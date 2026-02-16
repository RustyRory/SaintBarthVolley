import Media from '../models/Media.js';

// Tous les médias (optionnellement par album)
export const getMedias = async (req, res) => {
  try {
    const filter = req.query.albumId ? { albumId: req.query.albumId } : {};
    const medias = await Media.find(filter).populate('albumId');
    res.json(medias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Média par ID
export const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate('albumId');
    if (!media) {
      return res.status(404).json({ message: 'Média non trouvé' });
    }
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un média
export const createMedia = async (req, res) => {
  try {
    const media = await Media.create(req.body);
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un média
export const updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!media) {
      return res.status(404).json({ message: 'Média non trouvé' });
    }

    res.json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un média
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);

    if (!media) {
      return res.status(404).json({ message: 'Média non trouvé' });
    }

    res.json({ message: 'Média supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
