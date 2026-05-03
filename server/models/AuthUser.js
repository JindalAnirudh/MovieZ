import mongoose from 'mongoose';

const authUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('AuthUser', authUserSchema);
