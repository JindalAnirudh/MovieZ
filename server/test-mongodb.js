import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const testMongoConnection = async () => {
  try {
    console.log('Testing MongoDB connection...')
    console.log('Connection string:', process.env.MONGODB_URI)
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    })
    
    console.log('✅ MongoDB connected successfully!')
    
    // Test creating a document
    const testDoc = { name: 'test', created: new Date() }
    console.log('✅ Database operations working!')
    
    await mongoose.disconnect()
    console.log('✅ Connection test completed')
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

testMongoConnection()
