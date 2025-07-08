const express = require('express');
const { connectToDatabase } = require('./db');
const axios = require('axios');
const compression = require('compression');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;

// Environment variables for Jamendo credentials
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || '3a6fa828';
const JAMENDO_API_BASE_URL = 'https://api.jamendo.com/v3.0';

app.use(compression());
app.use(cors({ 
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Helper function for API requests with retry logic
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 2000) => {
    try {
        const response = await axios.get(url, { params: options });
        return response.data;
    } catch (error) {
        if (error.response?.status === 429 && retries > 0) {
            console.warn(`Rate limited! Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        console.error(`API request failed: ${error.message}`);
        throw error;
    }
};

// Delay function for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Connect to database
let db;
(async () => {
    db = await connectToDatabase();
})();

// fetch chord data and metadata for a track 
app.get('/chords', async (req, res) => {
    const trackId = req.query.trackId;

    if (!trackId) {
        console.log("Missing trackId parameter");
        return res.status(400).json({ message: "Missing trackId parameter" });
    }

    try {
        const collection = db.collection('descriptors');

        // Fetch chord data from MongoDB
        const trackData = await collection.findOne({ _id: `jamendo-tracks:${trackId}` });

        if (!trackData || !trackData.chords || !trackData.chords.chordSequence) {
            return res.status(404).json({ message: "No chord sequence available for this track" });
        }

        // Fetch track metadata from Jamendo API
        const jamendoResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/tracks`, {
            client_id: JAMENDO_CLIENT_ID,
            format: 'json',
            id: trackId
        });

        if (!jamendoResponse.results.length) {
            throw new Error("Track not found on Jamendo");
        }
        const jamendoTrack = jamendoResponse.results[0];

        // Fetch artist details from Jamendo API
        let artistData = {};
        try {
            const artistResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/artists`, {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                name: jamendoTrack.artist_name,
                limit: 1
            });

            if (artistResponse.results.length > 0) {
                artistData = artistResponse.results[0];
            }
        } catch (error) {
            console.error(`Error fetching artist data from Jamendo: ${error.message}`);
        }

        
        const genres = artistData?.musicinfo?.tags?.genres || [];

        res.json({
            trackId,
            trackName: jamendoTrack?.name || "Unknown Track",
            artist: {
                name: artistData?.name || jamendoTrack?.artist_name || "Unknown Artist",
                bio: artistData?.bio || "No biography available.",
                genres,
                website: artistData?.website || ""
            },
            chords: trackData.chords.chordSequence.map(chord => ({
                timeStart: chord.start,
                timeEnd: chord.end,
                chord: chord.label
            }))
        });
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// search endpoint
app.get('/search', async (req, res) => {
    const query = req.query.query;
    
    if (!query || query.trim() === "") {
        return res.json([]);
    }

    try {
        let filteredTracks = [];
        let offset = 0;
        const limit = 50;
        const desiredResults = 20;
        const delayBetweenRequests = 1000; // Delay between requests

        const collection = db.collection('descriptors');

        while (filteredTracks.length < desiredResults) {
            await delay(delayBetweenRequests);

            const jamendoParams = {
                client_id: JAMENDO_CLIENT_ID,
                search: query,
                format: 'json',
                limit,
                offset
            };

            const jamendoResponse = await fetchWithRetry(`${JAMENDO_API_BASE_URL}/tracks`, jamendoParams);
            const jamendoTracks = jamendoResponse.results;

            if (jamendoTracks.length === 0) break;

            const trackIds = jamendoTracks.map(track => `jamendo-tracks:${track.id}`);
            const existingTracks = await collection.find({ _id: { $in: trackIds } }).toArray();
            const existingTrackIds = new Set(existingTracks.map(track => track._id));

            const newFilteredTracks = jamendoTracks
                .filter(track => existingTrackIds.has(`jamendo-tracks:${track.id}`))
                .map(track => ({
                    id: track.id,
                    name: track.name || "Unknown Track",
                    artist_name: track.artist_name || "Unknown Artist",
                    album_name: track.album_name || "Unknown Album",
                    genre: track.tags?.split('|')[0] || "Unknown Genre"
                }));

            filteredTracks.push(...newFilteredTracks);
            offset += limit;
            if (filteredTracks.length >= desiredResults) break;
        }

        filteredTracks = filteredTracks.slice(0, desiredResults);
        res.json(filteredTracks);
    } catch (error) {
        console.error("Error fetching search results:", error.message);
        res.status(500).json({ message: "Error fetching search results", error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on("error", (err) => {
    console.error("Server encountered an error:", err.message);
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Catch uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
});