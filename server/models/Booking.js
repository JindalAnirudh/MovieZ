import mongoose from "mongoose";
const bookingSchema=new mongoose.Schema({
    user:{type:String,required:true,ref:'User'},
    userName:{type:String,required:true},
    show:{type:String,required:true,ref:'Show'},
    movieName:{type:String,required:true},
    showDateTime:{type:Date,required:true},
    amount:{type:Number,required:true},
    bookedSeats:{type:Array,required:true},
    isPaid:{type:Boolean,default:false},
    paymentLink:{type:String,default:false},

},{timestamps:true})
const Booking=mongoose.model("Booking",bookingSchema);
export default Booking;