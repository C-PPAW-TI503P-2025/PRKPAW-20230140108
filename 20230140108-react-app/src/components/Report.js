import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:3001/api/reports/daily";

function ReportPage() {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // State Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchReports = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // Setup Query Params
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

    // Load data awal saat komponen dimuat
    useEffect(() => {
        fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReports();
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
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
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                        Tidak ada data presensi ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ReportPage;