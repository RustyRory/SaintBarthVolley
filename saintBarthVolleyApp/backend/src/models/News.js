import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', default: null },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('News', newsSchema);
