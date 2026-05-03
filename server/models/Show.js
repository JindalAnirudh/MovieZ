import mongoose, { modelNames } from "mongoose";
const showSchema=new mongoose.Schema(
    {
        movie:{type:String,required:true,ref:'Movie'},
        showDateTime:{type:Date,required:true},
        showPrice:{type:Number},
        prices:{
            vip:{ type:Number },
            premium:{ type:Number },
            normal:{ type:Number }
        },
        occupiedSeats:{type:Object,default:{}},
        city:{ type:String, default:'' },
        theatres:{ type:[String], default:[] }

    },{minimize:false}
)
const Show=mongoose.model("Show",showSchema);
export default Show;