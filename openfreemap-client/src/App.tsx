import React, { useState, useRef, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom modal CSS
const modalStyles: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  padding: '20px',
  zIndex: 1000,
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0,0,0,0.3)',
};

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: '100vw',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  zIndex: 999,
};

// GeoSearch component
const SearchControl = () => {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    controlRef.current = searchControl;
    (map as any).addControl(searchControl);

    return () => {
      if (controlRef.current) {
        (map as any).removeControl(controlRef.current);
      }
    };
  }, [map]);

  return null;
};

// Handles map clicks
type MapClickHandlerProps = {
  onClick: (e: LeafletMouseEvent) => void;
};

const MapClickHandler = ({ onClick }: MapClickHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onClick]);

  return null;
};

const App = () => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleMapClick = (e: LeafletMouseEvent) => {
    setMarkerPosition([e.latlng.lat, e.latlng.lng]);
    setShowModal(true);
  };

  const handleSubmit = () => {
    console.log('Review:', review);
    console.log('Image:', image);
    setShowModal(false);
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchControl />
        <MapClickHandler onClick={handleMapClick} />
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>
              <strong>Review:</strong> {review || 'No review yet.'}
              <br />
              <strong>Image:</strong>{' '}
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Uploaded"
                  style={{ width: '100px', marginTop: '5px' }}
                />
              ) : (
                'No image'
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {showModal && (
        <>
          <div style={overlayStyles} onClick={() => setShowModal(false)} />
          <div style={modalStyles}>
            <h3>Add Details</h3>
            <textarea
              placeholder="Write your review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              style={{ marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
