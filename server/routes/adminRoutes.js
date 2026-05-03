import express from 'express'
import { protectAdmin } from '../middleware/auth.js'
import { getAllBookings, getAllShows, getDashboardData, isAdmin } from '../controllers/adminController.js'
import sendEmail from '../configs/nodeMailer.js'

const adminRouter=express.Router()
adminRouter.get('/is-admin',protectAdmin,isAdmin)
adminRouter.get('/dashboard',protectAdmin,getDashboardData)
adminRouter.get('/all-shows',protectAdmin,getAllShows)
adminRouter.get('/all-bookings',protectAdmin,getAllBookings)
// Test email route (admin only)
adminRouter.post('/test-email', protectAdmin, async (req, res) => {
  try{
    const to = (req.body?.to || '').trim() || req.user?.email || process.env.SENDER_EMAIL
    const resp = await sendEmail({
      to,
      subject: 'QuickShow SMTP Test',
      body: '<p>This is a test email from QuickShow.</p>'
    })
    res.json({ success: true, message: 'Email sent', id: resp?.messageId || null })
  }catch(err){
    res.status(500).json({ success: false, message: err?.message || 'Failed to send' })
  }
})
export default adminRouter;