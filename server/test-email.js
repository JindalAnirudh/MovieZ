import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from './configs/nodeMailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('SMTP User:', process.env.SMTP_USER);
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    
    const result = await sendEmail({
      to: 'firerobo33@gmail.com',
      subject: 'Test Email from QuickShow',
      body: `<div style="font-family:Arial,sans-serif; line-height:1.6; color:#111;">
        <h2 style="margin:0 0 12px;">Test Email</h2>
        <p style="margin:0 0 10px;">This is a test email to verify the email configuration is working.</p>
        <p style="margin:14px 0;">If you receive this, the email system is working! 🍿</p>
        <p style="margin:0;">Thanks,<br/>QuickShow Team</p>
      </div>`
    });
    
    console.log('Email sent successfully:', result.messageId);
  } catch (error) {
    console.error('Email test failed:', error.message);
  }
};

testEmail();
