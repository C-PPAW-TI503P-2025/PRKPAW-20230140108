const { Presensi, User } = require("../../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;

    // Filter untuk tabel Presensi (tanggal)
    let presensiWhere = {};

    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(tanggalMulai); startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(tanggalSelesai); endDate.setHours(23, 59, 59, 999);
      presensiWhere.checkIn = { [Op.between]: [startDate, endDate] };
    } else if (tanggalMulai) {
      const startDate = new Date(tanggalMulai); startDate.setHours(0, 0, 0, 0);
      presensiWhere.checkIn = { [Op.gte]: startDate };
    } else if (tanggalSelesai) {
      const endDate = new Date(tanggalSelesai); endDate.setHours(23, 59, 59, 999);
      presensiWhere.checkIn = { [Op.lte]: endDate };
    }

    // Filter untuk tabel User (nama)
    let includeOptions = {
      model: User,  // <-- INI YANG KURANG!
      as: 'user',
      attributes: ['id', 'nama', 'email']
    };

    // Jika ada filter nama, tambahkan where di include
    if (nama) {
      includeOptions.where = {
        nama: { [Op.like]: `%${nama}%` }
      };
    }

    const records = await Presensi.findAll({
      where: presensiWhere,
      include: [includeOptions],
      order: [['checkIn', 'DESC']]
    });

    res.json({
      reportDate: new Date().toLocaleDateString(),
      totalRecords: records.length,
      filters: {
        nama: nama || null,
        tanggalMulai: tanggalMulai || null,
        tanggalSelesai: tanggalSelesai || null
      },
      data: records,
    });
  } catch (error) {
    console.error("Error in getDailyReport:", error);
    res.status(500).json({ message: "Gagal mengambil laporan", error: error.message });
  }
};