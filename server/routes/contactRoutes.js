import express from 'express'
import {
  submitContactForm,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} from '../controllers/contactController.js'

const router = express.Router()

// Public route - Submit contact form
router.post('/', submitContactForm)

// Admin routes - These should be protected with admin authentication middleware
// For now, they're open but you should add admin auth middleware later
router.get('/', getAllContacts)
router.get('/:id', getContactById)
router.put('/:id', updateContactStatus)
router.delete('/:id', deleteContact)

export default router
