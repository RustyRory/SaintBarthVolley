import User from '../models/User.js';

// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash'); // Ne jamais renvoyer les passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create user
export const createUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    const user = new User({ email, role, firstName, lastName });
    await user.setPassword(password);
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé', userId: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update user
export const updateUser = async (req, res) => {
  try {
    const { email, role, firstName, lastName, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (email) user.email = email;
    if (role) user.role = role;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) await user.setPassword(password);

    await user.save();
    res.json({ message: 'Utilisateur mis à jour' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
