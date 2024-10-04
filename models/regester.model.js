const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config'); 

const Regester = sequelize.define('regiester', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  phoneNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,  
    unique: true,      
    validate: {
      isInt: true,            
      len: [10, 10]            
    }
  },

  password: {
    type: DataTypes.STRING, 
  },

  gender: {
    type: DataTypes.ENUM('male', 'female'), 
    allowNull: false 
  },

  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive'), 
    allowNull: false,
    defaultValue: 'active', 
  },

  otp: {
    type: DataTypes.INTEGER, 
    // allowNull: true, 
  },

  expiresAt: {
    type: DataTypes.DATE,
    // allowNull: true,
},

  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
}
});

module.exports = Regester;
