import express from 'express'
import { getFavorites, getUserBookings, updateFavorite } from '../controllers/userController.js'
import { verifyToken } from '../middleware/auth.js'
const userRouter=express.Router()
userRouter.get('/bookings', verifyToken, getUserBookings)
userRouter.post('/update-favorite', verifyToken, updateFavorite)
userRouter.get('/favorites', verifyToken, getFavorites)
export default userRouter;