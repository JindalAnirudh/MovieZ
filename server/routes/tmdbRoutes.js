import express from 'express'
import { nowPlaying } from '../controllers/tmdbController.js'

const router = express.Router()
router.get('/now-playing', nowPlaying)

export default router
