'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    static associate(models) {
      // Satu Presensi dimiliki oleh satu User
      Presensi.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
    }
  }
  Presensi.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // HAPUS field nama - lines 25-28
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Presensi',
  });
  return Presensi;
};