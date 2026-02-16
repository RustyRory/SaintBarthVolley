import Album from '../models/Album.js';

// Récupérer tous les albums
export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find();
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un album par ID
export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album non trouvé' });
    res.json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouvel album
export const createAlbum = async (req, res) => {
  try {
    const album = await Album.create(req.body);
    res.status(201).json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un album
export const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!album) return res.status(404).json({ message: 'Album non trouvé' });
    res.json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un album
export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album non trouvé' });
    res.json({ message: 'Album supprimé', album });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
