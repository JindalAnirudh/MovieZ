import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";
import AuthUser from "../models/AuthUser.js";

export const isAdmin=async(req,res)=>{
     res.json({success:true,isAdmin:true})
}

export const getDashboardData=async(req,res)=>{
    try{
        const bookings=await Booking.find({isPaid:true});
        const activeShows=await Show.find({showDateTime:{$gte:new Date()}}).populate('movie');
        let totalUser = 0;
        try { totalUser = await AuthUser.countDocuments() } catch {}
        if(!totalUser){
            try { totalUser = await User.countDocuments() } catch {}
        }
        const dashboardData={
            totalBookings:bookings.length,
            totalRevenue:bookings.reduce((acc,booking)=>acc+booking.amount,0),
            activeShows,
            totalUser
        }
        res.json({success:true,dashboardData})
    }
    catch(error){
        console.error(error);
        res.json({success:false,message:error.message})
    }
}

export const getAllShows=async(req,res)=>{
    try{
        const shows=await Show.find({showDateTime:{$gte:new Date()}}).populate('movie').sort({showDateTime:1});
        res.json({success:true,shows})
    }
    catch(error){
        console.error(error);
        res.json({success:false,message:error.message})
    }
}

export const getAllBookings=async(req,res)=>{
    try{
        const bookings=await Booking.find({}).sort({createdAt:-1})
        res.json({success:true,bookings})
    }
    catch(error){
        console.error(error)
        res.json({success:false,message:error.message})
    }
}