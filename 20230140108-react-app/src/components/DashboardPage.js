import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Tambahkan Link
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect jika tidak ada token
    } else {
        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
        } catch (e) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20">
      {/* Konten Dashboard */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Selamat Datang!</h1>
        
        {user && (
            <div className="mb-8">
                <p className="text-xl text-gray-600">Halo, <span className="font-bold text-blue-600">{user.nama}</span></p>
                <p className="text-sm text-gray-500 mt-1">Anda login sebagai: <span className="capitalize font-medium">{user.role}</span></p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Menu untuk Semua User */}
            <Link to="/presensi" className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                <h3 className="text-xl font-bold text-blue-800 mb-2">📝 Presensi</h3>
                <p className="text-gray-600">Lakukan Check-In dan Check-Out harian Anda di sini.</p>
            </Link>

            {/* Menu Khusus Admin */}
            {user && user.role === 'admin' && (
                <Link to="/reports" className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition">
                    <h3 className="text-xl font-bold text-green-800 mb-2">📊 Laporan Admin</h3>
                    <p className="text-gray-600">Lihat rekap presensi seluruh pegawai/mahasiswa.</p>
                </Link>
            )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-10 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;