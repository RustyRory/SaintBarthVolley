import News from '../models/News.js';

// GET all news
export const getNews = async (req, res) => {
  try {
    const news = await News.find().populate('authorId', 'firstName lastName').populate('albumId'); // Si tu veux récupérer les infos de l'album
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single news by ID
export const getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id).populate('authorId', 'firstName lastName').populate('albumId');
    if (!newsItem) return res.status(404).json({ message: 'News non trouvée' });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE news
export const createNews = async (req, res) => {
  try {
    const newsItem = await News.create(req.body);
    res.status(201).json(newsItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE news
export const updateNews = async (req, res) => {
  try {
    const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!newsItem) return res.status(404).json({ message: 'News non trouvée' });
    res.json(newsItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE news
export const deleteNews = async (req, res) => {
  try {
    const newsItem = await News.findByIdAndDelete(req.params.id);
    if (!newsItem) return res.status(404).json({ message: 'News non trouvée' });
    res.json({ message: 'News supprimée', newsItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
