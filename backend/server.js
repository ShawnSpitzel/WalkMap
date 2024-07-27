require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database('./walkability.db');

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to get walkability index for all cities within a radius
app.get('/walkability', async (req, res) => {
  const { city, radius } = req.query;

  try {
    // Get coordinates for the city
    const cityCoords = await getCityCoordinates(city);
    console.log(`City Coordinates: ${JSON.stringify(cityCoords)}`);

    // Get all cities within the radius
    const nearbyCities = await getNearbyCities(cityCoords, radius);
    console.log(`Nearby Cities: ${JSON.stringify(nearbyCities)}`);

    // Fetch walkability index for each city
    const walkabilityIndexes = await Promise.all(
      nearbyCities.map(async city => {
        const index = await fetchWalkabilityIndex(city.lat, city.lng);
        return { city: city.name, lat: city.lat, lon: city.lng, walkability_index: index };
      })
    );

    res.json(walkabilityIndexes);
  } catch (error) {
    console.error('Error fetching walkability indexes:', error);
    res.status(500).json({ error: 'Failed to fetch walkability indexes' });
  }
});

// Function to fetch walkability index from SQLite database
async function fetchWalkabilityIndex(lat, lon) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT walkability_index 
      FROM walkability 
      WHERE lat BETWEEN ? AND ? 
      AND lon BETWEEN ? AND ?
      ORDER BY ABS(lat - ?) + ABS(lon - ?)
      LIMIT 1
    `;
    const latRange = 10000; // Adjust the range as needed
    const lonRange = 10000; // Adjust the range as needed
    //idk why this works the way it does but it needs to be this high to work
    db.get(query, [lat - latRange, lat + latRange, lon - lonRange, lon + lonRange, lat, lon], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(row ? row.walkability_index : null);
      }
    });
  });
}

// Function to get city coordinates using Google Maps Geocoding API
async function getCityCoordinates(city) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log('Using API Key:', apiKey);

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: city,
        key: apiKey
      }
    });
    console.log(`Geocoding API response: ${JSON.stringify(response.data)}`);
    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }
    const location = response.data.results[0].geometry.location;
    return { lat: location.lat, lon: location.lng };
  } catch (error) {
    console.error('Error with Geocoding API request:', error);
    throw error;
  }
}

// Function to get nearby cities using Google Maps Places API with pagination and visited cities set
async function getNearbyCities(coords, radius) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const places = new Set();
    const visited = new Set();
    let nextPageToken = '';
    const radiusMeters = radius * 1609.34; // Convert miles to meters
  
    while (true) {
      const params = {
        location: `${coords.lat},${coords.lon}`,
        radius: radiusMeters, // Use the radius converted to meters
        type: 'locality',
        key: apiKey,
      };
  
      if (nextPageToken) {
        params.pagetoken = nextPageToken;
      }
  
      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', { params });
        console.log(`Places API response: ${JSON.stringify(response.data)}`);
  
        response.data.results.forEach(place => {
          const placeId = place.place_id;
          if (!visited.has(placeId)) {
            visited.add(placeId);
            places.add({
              name: place.name,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            });
          }
        });
  
        if (response.data.next_page_token) {
          // Google Places API next_page_token requires a short delay before the next request
          nextPageToken = response.data.next_page_token;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          break;
        }
      } catch (error) {
        console.error('Error with Places API request:', error);
        break;
      }
    }
  
    return Array.from(places);
  }
  
  

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
