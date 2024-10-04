const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const registerService = require('../services/regester.service');
const  Regester  = require('../models/regester.model');


// Login 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await registerService.getRegisterByEmail(email);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred during login' });
  }
};

//create a new register 
const createRegister = async (req, res) => {
  try {
    const { name, email, password, gender, phoneNumber } = req.body;

    if (!name || !email || !password || !gender || !phoneNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Name, email, password, and gender are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newRegister = await registerService.createRegister({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      gender,
      status: 'active'
    });

    const payload = {
      id: newRegister.id,
      email: newRegister.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    await newRegister.update({ token });

    res.status(StatusCodes.CREATED).json({
      message: 'User registered successfully',
      user: {
        id: newRegister.id,
        name: newRegister.name,
        email: newRegister.email,
      },
      token: token,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

// Change Password Controller
const changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Both passwords are required' });

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await registerService.getRegisterById(id);

    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Incorrect old password' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await registerService.updateRegister(user.id, { password: hashedNewPassword });

    res.status(StatusCodes.OK).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// gettokendata
const gettokenData = (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'You have successfully accessed', user: req.user });
};

const getAllRegisters = async (req, res) => {
  try {
    const registers = await registerService.getAllRegisters();
    res.status(StatusCodes.OK).json(registers);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getRegisterById = async (req, res) => {
  try {
    const userId = req.params.id;

    const register = await registerService.getRegisterById(userId);
    if (register) {
      res.status(StatusCodes.OK).json(register);
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const updateRegister = async (req, res) => {
  try {
    const updatedRegister = await registerService.updateRegister(req.params.id, req.body);

    if (!updatedRegister) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Register not found' });
    }

    res.status(StatusCodes.OK).json({ message: 'Register updated successfully', updatedRegister });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};


const deleteRegister = async (req, res) => {
  try {
    await registerService.deleteRegister(req.params.id);
    res.status(StatusCodes.OK).json({ message: 'Register deleted successfully' });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'Register not found' });
  }
};

module.exports = {
  createRegister,
  getAllRegisters,
  getRegisterById,
  updateRegister,
  deleteRegister,
  login,
  changePassword,
  gettokenData,
};
