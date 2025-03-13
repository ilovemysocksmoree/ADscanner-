import React from 'react';
import { GoogleMap, useJsApiLoader, Polyline } from '@react-google-maps/api';
import { Box, CircularProgress } from '@mui/material';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 35.9078,
  lng: 127.7669, // Centered on South Korea
};

const options = {
  styles: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#746855' }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  backgroundColor: '#242f3e',
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180,
    },
    strictBounds: true,
  },
  minZoom: 2,
  maxZoom: 7,
};

interface GeographicalMapProps {
  targetLocations: Array<{
    lat: number;
    lng: number;
    weight?: number;
  }>;
}

export default function GeographicalMap({ targetLocations }: GeographicalMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const lines = targetLocations.map((target) => ({
    path: [
      { lat: center.lat, lng: center.lng },
      { lat: target.lat, lng: target.lng },
    ],
    options: {
      strokeColor: '#ff4444',
      strokeOpacity: 0.8,
      strokeWeight: target.weight || 1.5,
      geodesic: true,
    },
  }));

  if (!isLoaded) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#242f3e',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={4}
      options={options}
    >
      {lines.map((line, index) => (
        <Polyline
          key={index}
          path={line.path}
          options={line.options}
        />
      ))}
    </GoogleMap>
  );
} 