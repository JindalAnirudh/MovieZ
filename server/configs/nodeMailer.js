import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load and PARSE server/.env explicitly; prefer parsed values over process.env
const envPath = path.join(__dirname, '..', '.env')
const parsed = dotenv.config({ path: envPath, override: true }).parsed || {}
const get = (k, fb) => (parsed[k] ?? process.env[k] ?? fb)
const host = get('SMTP_HOST', 'smtp-relay.brevo.com')
const port = Number(get('SMTP_PORT', '587'))
const secure = String(get('SMTP_SECURE', 'false')).toLowerCase() === 'true'
const user = get('SMTP_USER', '')
const pass = get('SMTP_PASS', '')
const from = get('SENDER_EMAIL', 'no-reply@example.com')
console.log('[Email] env path:', envPath)
console.log('[Email] Using SMTP config:', { host, port, secure, user: user ? '[set]' : '[missing]' })

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  // Add additional options for better reliability
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

const sendEmail=async({to,subject,body})=>{
    try{
      console.log('[Email] Attempting to send email to:', to);
      console.log('[Email] Subject:', subject);
      
      const response=await transporter.sendMail({
          from,
          to,
          subject,
          html:body,
      })
      
      console.log('[Email] Email sent successfully:', response.messageId);
      console.log('[Email] Response:', response);
      return response
    }catch(err){
      console.error('[Email] Email send error:', err?.message || err)
      console.error('[Email] Full error:', err);
      throw err
    }
}
export default sendEmail;