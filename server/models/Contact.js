import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Movies / Events / Dining / Other', 'Movies', 'Events', 'Dining', 'Other']
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved'],
    default: 'new'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Index for efficient querying
contactSchema.index({ createdAt: -1 })
contactSchema.index({ status: 1 })
contactSchema.index({ email: 1 })

const Contact = mongoose.model('Contact', contactSchema)

export default Contact
