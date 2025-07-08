# Harmony Explorer (Basic Version)

This is the basic version (Version A) of Harmony Explorer, developed for research purposes as part of a user study comparing different approaches to music data visualization.

# Overview

Harmony Explorer Basic provides a minimalist interface for exploring chord data from music tracks. It presents chord progressions in a simple text-based timeline format, allowing users to see each chord and its timestamp within a song.
This version serves as a control/comparison point in the research study examining how different visualization approaches affect user understanding and engagement with musical data.

# Features

Simple Search: Search for tracks by name or artist
Text-based Chord Display: View chord progressions as a chronological list
Back Navigation: Simple navigation between search and track views


# Installation

After unzipping the project folder, run the following command in the root directory to install all dependencies:

```bash
npm install
```

# Running the Application

# Start the Backend
In the root folder, run:

```bash
node server.js
```

The backend server will start on:
http://localhost:5001


# Start the Frontend

In another terminal, also from the root folder, run:

```bash
npm install
```

This will start the React app on:
http://localhost:3000

# Implementation Notes

The backend connects to a MongoDB database containing pre-analyzed chord data
Additional track metadata is fetched from the Jamendo API
This version intentionally excludes interactive visualizations and comparison tools
For research purposes only


# Research Context

This application is part of a user study comparing a basic text-based interface (Version A) with a more feature-rich visualization platform (Version B) to understand how different interface designs affect user experience and comprehension of musical data.

# Developed by
Lisa Deshishku — BSc Computer Science, 
Supervised by Dr. Johan Pauwels, Queen Mary University of London

