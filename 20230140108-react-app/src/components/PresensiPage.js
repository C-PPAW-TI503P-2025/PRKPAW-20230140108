import React, { useState, useEffect } from 'react';  // <-- TAMBAH useEffect di sini
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';  // <-- TAMBAH baris ini
import L from 'leaflet';

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function PresensiPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token');

  // Dapatkan lokasi pengguna saat komponen dimuat
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser ini.");
      setLoading(false);
    }
  }, []);

  const handleCheckIn = async () => {
    setMessage("");
    setError("");

    if (!coords) {
      setError("Lokasi belum didapatkan. Mohon izinkan akses lokasi.");
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };
      
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-in",
        {
          latitude: coords.lat,  // <-- Kirim koordinat
          longitude: coords.lng  // <-- Kirim koordinat
        },
        config
      );

      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-in gagal");
    }
  };

  const handleCheckOut = async () => {
    setMessage("");
    setError("");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };

      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-out",
        {}, 
        config
      );

      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-out gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="max-w-2xl mx-auto">
        
        {/* PETA LOKASI */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center mb-6">
            <p className="text-gray-600">Mendapatkan lokasi Anda...</p>
          </div>
        ) : coords ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-blue-600 text-white">
              <h3 className="font-bold">📍 Lokasi Presensi Anda</h3>
              <p className="text-sm opacity-90">Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}</p>
            </div>
            <MapContainer 
              center={[coords.lat, coords.lng]} 
              zoom={16} 
              style={{ height: '300px', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[coords.lat, coords.lng]}>
                <Popup>
                  <strong>Lokasi Anda</strong><br/>
                  Lat: {coords.lat.toFixed(6)}<br/>
                  Lng: {coords.lng.toFixed(6)}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : null}

        {/* CARD CHECK-IN / CHECK-OUT */}
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Lakukan Presensi
          </h2>

          {message && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded">{message}</div>}
          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}

          <div className="flex space-x-4">
            <button
              onClick={handleCheckIn}
              disabled={!coords}
              className={`flex-1 py-3 px-4 font-semibold rounded-md shadow-sm transition ${
                coords 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ✅ Check-In
            </button>
            
            <button
              onClick={handleCheckOut}
              className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 transition"
            >
              🚪 Check-Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;