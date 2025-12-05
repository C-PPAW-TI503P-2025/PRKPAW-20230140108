// Gunakan model dengan relasi
const { Presensi, User } = require("../../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });

exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const { latitude, longitude } = req.body;
    const waktuSekarang = new Date();

    // Ambil nama file foto (bukan full path)
    const photo = req.file ? req.file.filename : null;

    // Cek apakah user sudah check-in hari ini
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    // Buat record presensi baru
    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: latitude || null,
      longitude: longitude || null,
      photo: photo  // <-- Simpan nama file, bukan path penuh
    });

    const recordWithUser = await Presensi.findByPk(newRecord.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'nama', 'email'] }]
    });

    res.status(201).json({
      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: {
        id: recordWithUser.id,
        userId: recordWithUser.userId,
        user: recordWithUser.user,
        checkIn: format(recordWithUser.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
        checkOut: null,
        latitude: recordWithUser.latitude,
        longitude: recordWithUser.longitude,
        photo: recordWithUser.photo
      },
    });
  } catch (error) {
    console.error("CheckIn Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    // Cari record check-in yang belum checkout
    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nama', 'email']
      }]
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    // Update checkOut
    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: {
        id: recordToUpdate.id,
        userId: recordToUpdate.userId,
        user: recordToUpdate.user,
        checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
        checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const presensiId = req.params.id;
    
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    // Admin bisa hapus semua, user biasa hanya bisa hapus miliknya
    if (role !== 'admin' && recordToDelete.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }

    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.updatePresensi = async (req, res) => {
  try {
    const { role } = req.user;
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body;
    
    // Admin only bisa update presensi
    if (role !== 'admin') {
      return res.status(403).json({ message: "Hanya admin yang dapat mengupdate presensi." });
    }
    
    if (checkIn === undefined && checkOut === undefined) {
      return res.status(400).json({
        message: "Request body tidak berisi data yang valid untuk diupdate (checkIn atau checkOut).",
      });
    }
    
    const recordToUpdate = await Presensi.findByPk(presensiId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nama', 'email']
      }]
    });
    
    if (!recordToUpdate) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    // Update field yang diberikan
    if (checkIn !== undefined) {
      recordToUpdate.checkIn = new Date(checkIn);
    }
    if (checkOut !== undefined) {
      recordToUpdate.checkOut = new Date(checkOut);
    }

    await recordToUpdate.save();

    res.json({
      message: "Catatan presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
