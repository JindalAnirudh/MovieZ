import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import AuthUser from "../models/AuthUser.js";

// API controller function to get User Bookings 
export const getUserBookings=async(req,res)=>{
    try{
        const userId = req.user?.userId;
        if(!userId){
            return res.status(401).json({success:false,message:'Unauthorized'})
        }
        const bookings=await Booking.find({user:userId})
            .populate({
                path: 'show',
                populate: {
                    path: 'movie',
                    model: 'Movie'
                }
            })
            .sort({createdAt:-1});
        res.json({success:true,bookings})
    }
    catch(error){
        console.error(error.message);
        res.json({success:false,message:error.message});
    }
}

// Placeholders for favorites (optional to implement later)
export const updateFavorite=async(req,res)=>{
    try{
        const userId = req.user?.userId;
        if(!userId){
            return res.status(401).json({success:false,message:'Unauthorized'})
        }
        const { movieId } = req.body || {}
        if(!movieId){
            return res.json({success:false,message:'movieId is required'})
        }
        const user = await AuthUser.findById(userId)
        if(!user){
            return res.status(404).json({success:false,message:'User not found'})
        }
        // Toggle favorite
        const idx = user.favorites.findIndex(id => String(id) === String(movieId))
        let action = 'added'
        if(idx >= 0){
            user.favorites.splice(idx,1)
            action = 'removed'
        }else{
            user.favorites.push(String(movieId))
        }
        await user.save()
        return res.json({success:true,message:`Favorite ${action}`})
    }
    catch(error){
        console.error(error.message);
        res.json({success:false,message:error.message});
    }
}

export const getFavorites=async(req,res)=>{
    try{
        const userId = req.user?.userId;
        if(!userId){
            return res.status(401).json({success:false,message:'Unauthorized'})
        }
        const user = await AuthUser.findById(userId)
        const ids = Array.isArray(user?.favorites) ? user.favorites : []
        if(ids.length === 0){
            return res.json({success:true,movies:[]})
        }
        // Fetch movie docs; filter out any missing
        const movies = await Movie.find({ _id: { $in: ids } })
        return res.json({success:true,movies})
    }
    catch(error){
        console.error(error.message);
        res.json({success:false,message:error.message});
    }
}