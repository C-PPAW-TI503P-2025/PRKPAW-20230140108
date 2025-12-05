import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:3001/api/reports/daily";
const UPLOADS_URL = "http://localhost:3001/uploads"; // Base URL untuk foto

function ReportPage() {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // State Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // State untuk Modal Foto
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchReports = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('nama', searchTerm);
            if (startDate) params.append('tanggalMulai', startDate);
            if (endDate) params.append('tanggalSelesai', endDate);

            const response = await axios.get(`${API_URL}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setReports(response.data.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setReports([]);
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setError("AKSES DITOLAK: Halaman ini khusus untuk Admin.");
            } else {
                setError("Gagal mengambil data laporan.");
            }
        }
    }, [navigate, searchTerm, startDate, endDate]);

    useEffect(() => {
        fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReports();
    };

    // Fungsi untuk membuka modal foto
    const openImageModal = (photoUrl) => {
        setSelectedImage(photoUrl);
    };

    // Fungsi untuk menutup modal
    const closeImageModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Laporan Presensi (Admin)</h1>

            {/* Form Filter */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama</label>
                        <input 
                            type="text" 
                            placeholder="Nama mahasiswa..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                        Filter Data
                    </button>
                </div>
            </form>

            {/* Pesan Error */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Tabel Data */}
            {!error && (
                <div className="bg-white shadow overflow-hidden rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti Foto</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.length > 0 ? (
                                reports.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.user ? item.user.nama : 'User Terhapus'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.checkIn).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            {new Date(item.checkIn).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                            {item.checkOut 
                                                ? new Date(item.checkOut).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})
                                                : <span className="text-gray-400 italic">Belum</span>
                                            }
                                        </td>
                                        {/* Kolom Bukti Foto */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {item.photo ? (
                                                <img 
                                                    src={`${UPLOADS_URL}/${item.photo}`} 
                                                    alt="Bukti Presensi"
                                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition border border-gray-200"
                                                    onClick={() => openImageModal(`${UPLOADS_URL}/${item.photo}`)}
                                                />
                                            ) : (
                                                <span className="text-gray-400 italic">Tidak ada foto</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        Tidak ada data presensi ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL POPUP untuk Foto Ukuran Penuh */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={closeImageModal}
                >
                    <div 
                        className="relative max-w-4xl max-h-full"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    >
                        {/* Tombol Close */}
                        <button 
                            onClick={closeImageModal}
                            className="absolute -top-10 right-0 text-white text-xl font-bold hover:text-gray-300 bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            ✕
                        </button>
                        
                      {/* Foto Ukuran Penuh */}
                        <img 
                            src={selectedImage} 
                            alt="Bukti Presensi Full"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        
                        {/* Caption */}
                        <p className="text-center text-white mt-4 text-sm">
                            Klik di luar gambar atau tombol ✕ untuk menutup
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportPage;