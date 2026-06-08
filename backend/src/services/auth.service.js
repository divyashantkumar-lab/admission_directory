const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  BCRYPT_ROUNDS,
  ROLES,
} = require('../config/constants');

function signToken(user) {
  return jwt.sign(
    { email: user.email, role: user.role },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN }
  );
}

async function signup({ email, password, name }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await userRepository.create({
    email,
    passwordHash,
    role: ROLES.USER,
    name: name || '',
  });
  const token = signToken(user);
  return { token, user };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const token = signToken(user);
  return {
    token,
    user: {
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };
}

function logout() {
  return { success: true };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

module.exports = {
  signup,
  login,
  logout,
  verifyToken,
  signToken,
};
