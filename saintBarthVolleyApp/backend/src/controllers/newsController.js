import News from '../models/News.js';

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET all news
export const getNews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.published === 'true') filter.isPublished = true;
    if (req.query.featured === 'true') filter.isFeatured = true;

    const news = await News.find(filter).populate('authorId', 'firstName lastName').sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single news by ID
export const getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id).populate('authorId', 'firstName lastName');
    if (!newsItem) return res.status(404).json({ message: 'News non trouvée' });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE news — authorId depuis JWT
export const createNews = async (req, res) => {
  try {
    const { title, content, isPublished, isFeatured } = req.body;

    const slug = generateSlug(title);
    const publishedAt = isPublished ? new Date() : null;

    const newsItem = await News.create({
      title,
      slug,
      content,
      isPublished: !!isPublished,
      isFeatured: !!isFeatured,
      publishedAt,
      authorId: req.user._id,
    });

    res.status(201).json(newsItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE news
export const updateNews = async (req, res) => {
  try {
    const update = { ...req.body };

    // Regénérer le slug si le titre change
    if (update.title) {
      update.slug = generateSlug(update.title);
    }

    // Auto publishedAt
    if (update.isPublished === true || update.isPublished === 'true') {
      const existing = await News.findById(req.params.id);
      if (!existing?.publishedAt) update.publishedAt = new Date();
    }

    const newsItem = await News.findByIdAndUpdate(req.params.id, update, {
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
    res.json({ message: 'News supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
