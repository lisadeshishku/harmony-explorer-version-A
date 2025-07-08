import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/MinimalTrackView.css';

const MinimalTrackView = () => {
    const [searchParams] = useSearchParams();
    const trackId = searchParams.get('trackId');
    const trackName = searchParams.get('trackName') || 'Unknown Track';
    const navigate = useNavigate();
    
    const [chordData, setChordData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchChordData = async () => {
            if (!trackId) {
                setError('No track ID provided');
                setLoading(false);
                return;
            }
            
            try {
                
                const response = await fetch(`http://localhost:5001/chords?trackId=${trackId}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', response.status, errorText);
                    throw new Error(`Failed to fetch chord data: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Chord data:', data);
                
                if (!data.chords || data.chords.length === 0) {
                    throw new Error('No chord data available for this track');
                }
                
                setChordData(data);
            } catch (err) {
                console.error('Error details:', err);
                setError(err.message || 'An error occurred while fetching chord data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchChordData();
    }, [trackId]);

    const goBack = () => {
        navigate('/');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="minimal-loading">Loading chord data...</div>;
    }

    if (error) {
        return (
            <div className="minimal-error">
                <h2>Error</h2>
                <p>{error}</p>
                <p>
                    Make sure your backend server is running on port 5001 and the
                    /chords endpoint is properly configured.
                </p>
                <button onClick={goBack}>Go Back</button>
            </div>
        );
    }

    if (!chordData) {
        return (
            <div className="minimal-error">
                <h2>No Data</h2>
                <p>No chord data available for this track.</p>
                <button onClick={goBack}>Go Back</button>
            </div>
        );
    }

    // Artist name from the data, fallback to "Unknown Artist"
    const artistName = chordData.artist?.name || "Unknown Artist";

    return (
        <div className="minimal-track-view">
            <div className="track-header">
                <button onClick={goBack} className="back-button">← Back to Search</button>
                <h1>{trackName}</h1>
                <h2>by {artistName}</h2>
            
            </div>
            
            <div className="chord-timeline">
                <div className="timeline-header">
                    <div className="time-label">Time</div>
                    <div className="chord-label">Chord</div>
                    <div className="duration-label">Duration</div>
                </div>
                
                <div className="chord-sequence">
                    {chordData.chords.map((chord, index) => {
                        const nextChord = chordData.chords[index + 1];
                        const duration = nextChord ? (nextChord.timeStart - chord.timeStart).toFixed(1) : "end";
                        
                        return (
                            <div key={index} className="chord-item" title={`${chord.chord} (${chord.timeStart}s)`}>
                                <div className="time">{formatTime(chord.timeStart)}</div>
                                <div className="chord">{chord.chord}</div>
                                <div className="duration">
                                    {duration !== "end" ? formatTime(nextChord.timeStart - chord.timeStart) : ""}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="artist-info">
                {chordData.artist && (
                    <>
                        <h3>About the Artist</h3>
                        <p>{chordData.artist.bio || "No biography available."}</p>
                        
                        {chordData.artist.genres && chordData.artist.genres.length > 0 && (
                            <div className="artist-genres">
                                <h4>Genres</h4>
                                <div className="tag-list">
                                    {chordData.artist.genres.map((genre, index) => (
                                        <span key={index} className="tag">{genre}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {chordData.artist.website && (
                            <p>
                                <a href={chordData.artist.website} target="_blank" rel="noopener noreferrer">
                                    Artist Website
                                </a>
                            </p>
                        )}
                    </>
                )}
            </div>
            
            <div className="track-footer">
                <p>Chord visualization for research purposes</p>
            </div>
        </div>
    );
};

export default MinimalTrackView;