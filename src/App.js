import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/App.css';

// Lazy load components
const MinimalHomepage = lazy(() => import('./components/MinimalHomepage'));
const MinimalTrackView = lazy(() => import('./components/MinimalTrackView'));
const MinimalNavbar = lazy(() => import('./components/MinimalNavbar'));

function App() {
    return (
        <Router>
            <div className="App minimal">
                <header>
                    <Suspense fallback={<div>Loading...</div>}>
                        <MinimalNavbar />
                    </Suspense>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={
                            <Suspense fallback={<div>Loading...</div>}>
                                <MinimalHomepage />
                            </Suspense>
                        } />
                        <Route path="/track" element={
                            <Suspense fallback={<div>Loading...</div>}>
                                <MinimalTrackView />
                            </Suspense>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;