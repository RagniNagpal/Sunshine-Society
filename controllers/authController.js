const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = 'sunshine_secret_key';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password, flatNo, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'name, email, password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,       
      flatNo: flatNo || '',
      role: role === 'admin' ? 'admin' : 'resident'
    });

    const token = signToken(user);
    const safeUser = { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      flatNo: user.flatNo,
      maintenanceStatus: user.maintenanceStatus 
    };
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'email & password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (user.password !== password) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = signToken(user);
    const safeUser = { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      flatNo: user.flatNo,
      maintenanceStatus: user.maintenanceStatus 
    };
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ msg: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ msg: 'Forbidden' });
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};