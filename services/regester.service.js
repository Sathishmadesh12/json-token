const Regiester = require('../models/regester.model');

const createRegister = async (registerData) => {
  // console.log('-------createRegister------------->', registerData);
  const registerDatas = await Regiester.create(registerData);
  // console.log('-------registerData------------->', registerDatas);
  return registerDatas
};

const getRegisterByEmail = async (email) => {
  try {
    return await Regiester.findOne({ where: { email } });
  } catch (error) {
    console.error('Error fetching user by email:', error.message);
    throw error;
  }
};

const getAllRegisters = async () => {
  return await Regiester.findAll();
};

const getRegisterById = async (id) => {
  return await Regiester.findByPk(id);
};

const updateRegister = async (id, updatedData) => {
  return await Regiester.update(updatedData, { where: { id } });
};

const deleteRegister = async (id) => {
  const register = await Regiester.findByPk(id);
  if (register) {
    return await register.destroy();
  }
  throw new Error('Register not found');
};

module.exports = {
  createRegister,
  getAllRegisters,
  getRegisterById,
  updateRegister,
  deleteRegister,
  getRegisterByEmail
};
