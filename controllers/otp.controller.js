const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const regester = require('../models/regester.model');
const bcrypt = require('bcrypt');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anandhan.v@nextbraintech.com',
        pass: 'Anandh.v@1999' 
    }
});

// Forget Password function
const forgetPassword = async (req, res) => {
  const { email, phoneNumber } = req.body;

  console.log('Received request:', { email, phoneNumber });

  if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phone number is required' });
  }

  const otp = generateOTP();
  try {
      const whereClause = {};
      if (email) whereClause.email = email;
      if (phoneNumber) whereClause.phoneNumber = phoneNumber;
      console.log('Searching for user with filter:', whereClause);

      const existingRegister = await regester.findOne({ where: whereClause });

      if (existingRegister) {
          await regester.update(
              { otp, expiresAt },
              { where: whereClause }
          );

          if (email) {
              const mailOptions = {
                  from: 'anandhan.v@nextbraintech.com',
                  to: email,
                  subject: 'Your OTP Code',
                  text: `Your OTP code is: ${otp}`
              };
              await transporter.sendMail(mailOptions);
              return res.status(200).json({ message: 'OTP sent to email successfully', otp });
          } else {
                    return res.status(200).json({ message: 'OTP  received successfully', otp });
          }
      } else {
          return res.status(404).json({ error: 'User not found' });
      }
  } catch (error) {
      return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const resetPassword = async (req, res) => {
  const { email, phoneNumber, otp, newPassword } = req.body;

  console.log('Reset Password Request:', req.body);

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  if (!otp || !newPassword) {
    return res.status(400).json({ error: 'OTP and new password are required' });
  }

  console.log('Using email for OTP lookup:', email);
  console.log('Using phoneNumber for OTP lookup:', phoneNumber);

  try {
    const query = {};
    if (email) query.email = email;
    if (phoneNumber) query.phoneNumber = phoneNumber;

    const otpRecord = await regester.findOne({
      where: query,
      attributes: ['otp', 'expiresAt']
    });

    if (!otpRecord) {
      return res.status(404).json({ error: 'No OTP found for this email or phone number' });
    }

    const { otp: storedOtp, expiresAt } = otpRecord;

    if (new Date() > new Date(expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (String(storedOtp) !== String(otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await regester.update(
      { password: hashedPassword, otp: null, expiresAt: null },
      { where: query }
    );

    return res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error during password reset' });
  }
};

module.exports = { forgetPassword, resetPassword };
