import express from 'express'
import sendEmail from '../configs/nodeMailer.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

// POST /api/admin/test-email
// Body: { to: string, subject?: string, body?: string }
router.post('/test-email', protectAdmin, async (req, res) => {
  try{
    const { to, subject, body } = req.body || {}
    if(!to) return res.status(400).json({ success:false, message:'"to" is required' })
    const subj = subject || 'Test Email from MovieZ'
    const html = body || '<p>If you received this, SMTP is working ✅</p>'
    const info = await sendEmail({ to, subject: subj, body: html })
    return res.json({ success:true, message:'Email sent', id: info?.messageId || null })
  }catch(err){
    return res.status(500).json({ success:false, message: err?.message || 'Failed to send email' })
  }
})

export default router
