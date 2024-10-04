const express = require('express');
const { createRegister, getAllRegisters, getRegisterById, updateRegister, deleteRegister, gettokenData} = require('../../controllers/regester.controller');
const { forgetPassword } = require('../../controllers/otp.controller');
const { resetPassword } = require('../../controllers/otp.controller');
const { login } = require('../../controllers/regester.controller');  
const authenticateToken = require('../../middlewares/authorization');
const registerController = require('../../controllers/regester.controller'); 
const { registerValidation, loginValidation} = require('../../validations/regester.validation');

const router = express.Router();

router.post('/forgetPassword', forgetPassword);

router.post('/resetPassword', resetPassword);

router.post('/login', loginValidation, login);

router.post('/',  registerValidation, createRegister);   

router.get('/token-data', authenticateToken, gettokenData);

router.get('/:id', getRegisterById);

router.get('/', getAllRegisters);

router.put('/change-password', registerController.changePassword);

router.delete('/:id', deleteRegister);

router.put('/:id', updateRegister);


module.exports = router;
