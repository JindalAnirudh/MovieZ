import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from 'stripe'
import { sendDashboardUpdate } from '../utils/realtime.js'
import { inngest } from '../inngest/index.js'
import sendEmail from '../configs/nodeMailer.js'
import AuthUser from '../models/AuthUser.js'
import User from '../models/User.js'

// function to check availabilty of selected seats for a movie 
const checkSeatsAvailability=async(showId,selectedSeats)=>{
    try{
        const showData=await Show.findById(showId)
        if(!showData) return false;
        const occupiedSeats=showData.occupiedSeats;
        const isAnySeatTaken=selectedSeats.some(seat=>occupiedSeats[seat])
        return !isAnySeatTaken;   
    }
    catch(error){
        console.log(error.message); 
        return false;
        
    }
}

// Quote endpoint to preview pricing before checkout
export const getQuote = async (req, res) => {
    try{
        const userId = req.user?.userId;
        if(!userId){
            return res.status(401).json({success:false,message:'Unauthorized'})
        }
        const { showId, selectedSeats } = req.body || {}
        if(!showId || !Array.isArray(selectedSeats) || selectedSeats.length===0){
            return res.json({success:false,message:'showId and selectedSeats are required'})
        }
        const showData=await Show.findById(showId).populate('movie');
        if(!showData){
            return res.json({success:false,message:'Show not found'})
        }
        const tierForSeat = (seatId='') => {
            const row = String(seatId).charAt(0).toUpperCase()
            if(['A','B'].includes(row)) return 'vip'
            if(['C','D','E','F'].includes(row)) return 'premium'
            return 'normal'
        }
        const prices = showData.prices || {}
        const fallback = Number(showData.showPrice) || 0
        const priceForTier = (tier) => {
            const v = Number(prices?.[tier])
            return Number.isFinite(v) && v > 0 ? v : fallback
        }
        const items = selectedSeats.map(seat=>{
            const tier = tierForSeat(seat)
            const price = priceForTier(tier)
            return { seat, tier, price }
        })
        const subtotal = items.reduce((s,i)=>s+i.price,0)
        // Simple convenience fee: 5% of subtotal (rounded to nearest rupee)
        const fees = Math.round(subtotal * 0.05)
        const total = subtotal + fees
        return res.json({success:true, subtotal, fees, total, currency:'INR', items, ticketCount: selectedSeats.length})
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

export const createBooking=async(req,res)=>{
    try{
        const userId = req.user?.userId;
        if(!userId){
            return res.status(401).json({success:false,message:'Unauthorized'})
        }
        const {showId,selectedSeats}=req.body;
        const {origin}=req.headers;
        // check if the seat is available for the selecte show 
        const isAvailable=await checkSeatsAvailability(showId,selectedSeats)
        if(!isAvailable){
            return res.json({success:false,message: "Selected seats are not availanle"})
        }
        //Get the show details 
        const showData=await Show.findById(showId).populate('movie');
        
        //Get user details - check both User (Clerk) and AuthUser collections
        let userData = null;
        if (userId.startsWith('user_')) {
            // Clerk user ID
            userData = await User.findById(userId);
        } else {
            // AuthUser ID
            userData = await AuthUser.findById(userId);
        }

        // Calculate amount per seat tier
        const tierForSeat = (seatId='') => {
            const row = String(seatId).charAt(0).toUpperCase()
            if(['A','B'].includes(row)) return 'vip'
            if(['C','D','E','F'].includes(row)) return 'premium'
            return 'normal'
        }
        const prices = showData.prices || {}
        const fallback = Number(showData.showPrice) || 0
        const priceForTier = (tier) => {
            const v = Number(prices?.[tier])
            return Number.isFinite(v) && v > 0 ? v : fallback
        }
        const subtotal = selectedSeats.reduce((sum, seat)=>{
            const tier = tierForSeat(seat)
            return sum + priceForTier(tier)
        }, 0)
        
        // Calculate convenience fee (5% of subtotal, same as in getQuote)
        const fees = Math.round(subtotal * 0.05)
        const totalAmount = subtotal + fees

        //create a new booking 
        const booking=await Booking.create({
            user:userId,
            userName: userData?.name || 'Unknown User',
            show:showId,
            movieName: showData?.movie?.title || 'Unknown Movie',
            showDateTime: showData?.showDateTime,
            amount: totalAmount,
            bookedSeats:selectedSeats
        })
        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat]=userId;
        })
        showData.markModified('occupiedSeats');
        await showData.save();
        
        //stripe gateway initialize
        const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY)
        const line_items=[{
            price_data:{
                currency:'inr',
                product_data:{
                    name:`${showData.movie.title} - ${selectedSeats.length} ${selectedSeats.length > 1 ? 'Tickets' : 'Ticket'}`,
                    description: `Seats: ${selectedSeats.join(', ')} (includes convenience fee)`
                },
                // booking.amount is in rupees; Stripe expects smallest unit (paise)
                unit_amount: Math.round(Number(booking.amount) * 100)
            },
            quantity:1
        }]
        const session=await stripeInstance.checkout.sessions.create({
            success_url:`${origin}/loading/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${origin}/my-bookings`,
            line_items:line_items,
            mode:'payment',
            metadata:{
                bookingId:booking._id.toString()
            },
            expires_at:Math.floor(Date.now()/1000)+30*60,//30 minutes
        })
        booking.paymentLink=session.url
        await booking.save()
        res.json({success:true,url:session.url})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}


export const getOccupiedSeats=async(req,res)=>{
    try{
        const {showId}=req.params;
        const showData=await Show.findById(showId)
        const occupiedSeats=Object.keys(showData.occupiedSeats)
         res.json({success:true,occupiedSeats})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

// Verify checkout session on return (fallback in case webhooks are not configured)
export const verifyCheckoutSession = async (req, res) => {
    try{
        const { sessionId } = req.params;
        const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY)
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
        if(!session){
            return res.status(404).json({success:false,message:'Session not found'})
        }
        if(session.payment_status === 'paid'){
            const bookingId = session.metadata?.bookingId;
            if(bookingId){
                const updated = await Booking.findByIdAndUpdate(bookingId,{ isPaid:true, paymentLink:"" }, { new: true })
                // Notify admin dashboards in real-time
                try { sendDashboardUpdate() } catch {}
                // Fire confirmation email workflow in case webhooks aren't configured
                try { await inngest.send({ name: 'app/show.booked', data: { bookingId } }) } catch {}
                // Email sending disabled due to authentication issues with multiple providers
                // Booking system works perfectly without emails - users see confirmation on screen
                console.log('[Booking] Email disabled - booking confirmed successfully');
                console.log('[Booking] Booking details:', { 
                    movieName: updated.movieName, 
                    userName: updated.userName || 'there', 
                    amount: updated.amount,
                    userEmail: 'firerobo33@gmail.com',
                    message: 'User can see booking confirmation in MyBookings section'
                });
                return res.json({success:true, paid:true})
            }
        }
        return res.json({success:true, paid:false})
    }catch(error){
        console.log(error.message);
        res.status(500).json({success:false,message:error.message})
    }
}