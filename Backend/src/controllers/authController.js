const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (user) => {
  return jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists with this email',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    user.tokenVersion += 1;
    await user.save();

    const token = createToken(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();

    res.status(200).json({
      message: 'Logout successful. Token is now invalid',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
