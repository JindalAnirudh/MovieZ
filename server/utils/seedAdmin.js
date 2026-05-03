import bcrypt from 'bcryptjs';
import AuthUser from '../models/AuthUser.js';

// Fixed admin credentials (not from env)
export const ADMIN_EMAIL = 'admin@quickshow.com';
export const ADMIN_PASSWORD = 'QuickShowAdmin@123';
export const ADMIN_NAME = 'Administrator';

export async function ensureSeedAdmin() {
  const email = ADMIN_EMAIL.toLowerCase();
  let admin = await AuthUser.findOne({ email });
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  if (!admin) {
    admin = await AuthUser.create({
      name: ADMIN_NAME,
      email,
      password: hashed,
      role: 'admin',
    });
    return { created: true, id: admin._id.toString() };
  }
  // Ensure role is admin; keep existing password if present
  let changed = false;
  if (admin.role !== 'admin') { admin.role = 'admin'; changed = true; }
  // Optional: keep password as-is if already set; uncomment to force-reset each boot
  // admin.password = hashed; changed = true;
  if (changed) await admin.save();
  return { created: false, id: admin._id.toString() };
}
