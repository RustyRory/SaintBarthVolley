import Album from '../models/Album.js';
import Media from '../models/Media.js';

export const getAlbums = async (req, res) => {
  try {
    const filter = {};
    if (req.query.public === 'true') filter.isPublic = true;
    if (req.query.teamId) filter.teamIds = req.query.teamId;
    if (req.query.matchId) filter.matchId = req.query.matchId;
    if (req.query.newsId) filter.newsId = req.query.newsId;
    if (req.query.seasonId) filter.seasonId = req.query.seasonId;

    const albums = await Album.find(filter)
      .populate('teamIds', 'name category gender')
      .populate('eventId', 'title date')
      .populate('matchId', 'opponentName date homeAway')
      .populate('newsId', 'title slug')
      .populate('seasonId', 'name')
      .sort({ eventDate: -1, createdAt: -1 });

    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('teamIds', 'name category gender')
      .populate('eventId', 'title date')
      .populate('matchId', 'opponentName date homeAway')
      .populate('newsId', 'title slug')
      .populate('seasonId', 'name');

    if (!album) return res.status(404).json({ message: 'Album non trouvé' });

    // Inclure les médias publics dans la réponse
    const mediaFilter = { albumId: album._id };
    if (req.query.public === 'true') mediaFilter.isPublic = true;
    const medias = await Media.find(mediaFilter).sort({ order: 1 });

    res.json({ ...album.toObject(), medias });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAlbum = async (req, res) => {
  try {
    const album = await Album.create(req.body);
    res.status(201).json(album);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!album) return res.status(404).json({ message: 'Album non trouvé' });
    res.json(album);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album non trouvé' });
    await Media.deleteMany({ albumId: req.params.id });
    res.json({ message: 'Album et médias supprimés' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
