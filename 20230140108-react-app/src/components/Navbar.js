import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Tambah useLocation
import { jwtDecode } from 'jwt-decode';

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); // Hook untuk mendeteksi perpindahan halaman

    // Fungsi untuk cek status login
    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
            } catch (error) {
                console.error("Token tidak valid", error);
                handleLogout();
            }
        } else {
            setUser(null);
        }
    };

    // Jalankan cek login setiap kali komponen dimuat ATAU route berubah
    useEffect(() => {
        checkLoginStatus();
    }, [location]); // Dependency 'location' akan memicu ulang saat pindah halaman

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Menu Kiri */}
                    <div className="flex items-center space-x-8">
                        <Link to={user ? "/dashboard" : "/login"} className="text-xl font-bold text-gray-800 hover:text-blue-600">
                            PresensiApp
                        </Link>
                        
                        {/* MENU UTAMA: Hanya muncul jika user Login */}
                        {user && (
                            <div className="hidden md:flex space-x-4">
                                {/* TOMBOL DASHBOARD DITAMBAHKAN DI SINI */}
                                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md">
                                    Dashboard
                                </Link>

                                <Link to="/presensi" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md">
                                    Presensi
                                </Link>
                                
                                {user.role === 'admin' && (
                                    <Link to="/reports" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md">
                                        Laporan Admin
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Menu Kanan (User Info / Auth) */}
                    <div>
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-gray-900">{user.nama}</div>
                                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Login</Link>
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;