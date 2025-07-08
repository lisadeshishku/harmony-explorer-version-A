import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MinimalHomepage.css';

const MinimalHomepage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            
            const serverUrl = 'http://localhost:5001';  
            const searchUrl = `${serverUrl}/search?query=${encodeURIComponent(searchTerm)}`;
            
            console.log('Fetching from:', searchUrl);
            
            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    // Add CORS headers if needed
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', response.status, errorText);
                throw new Error(`Search failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Search results:', data);
            setSearchResults(data);
        } catch (err) {
            console.error('Search error details:', err);
            if (err.message.includes('Failed to fetch')) {
                setError('Cannot connect to the server. Is it running at http://localhost:5000?');
            } else {
                setError(`Failed to fetch search results: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const viewTrack = (trackId, trackName) => {
        navigate(`/track?trackId=${trackId}&trackName=${encodeURIComponent(trackName)}`);
    };

    return (
        <div className="minimal-homepage">
            <div className="search-container">
                <h1>Harmony Explorer</h1>
                <p className="subtitle">Basic Version</p>
                
                <form onSubmit={handleSearch}>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search for a song or artist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" disabled={isLoading || !searchTerm.trim()}>
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
                
                {isLoading && <div className="loading">Searching...</div>}
                
                {error && (
                    <div className="error">
                        <p>{error}</p>
                        <p>
                            Make sure your backend server is running on port 5001 and the
                            /search endpoint is properly configured.
                        </p>
                    </div>
                )}
                
                {searchResults.length > 0 && (
                    <div className="search-results">
                        <h2>Results</h2>
                        <div className="result-list">
                            {searchResults.map((track) => (
                                <div key={track.id} className="result-item">
                                    <div className="track-name">{track.name}</div>
                                    <div className="artist-name">by {track.artist_name}</div>
                                    <button 
                                        onClick={() => viewTrack(track.id, track.name)}
                                        className="view-button"
                                    >
                                        View Chords
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {searchResults.length === 0 && searchTerm.trim() !== '' && !isLoading && !error && (
                    <div className="no-results">
                        No results found for "{searchTerm}". Try another search term.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinimalHomepage;