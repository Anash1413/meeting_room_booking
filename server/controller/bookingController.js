const { prisma } = require("../utils/db")
const { checkConflict, findNextAvail } = require("../utils/helper")

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
 exports.createBooking = async ( req , res , next) => {
    try {
        const {date , startTime , endTime , roomId , title } = req.body
        const existingBookings = await prisma.booking.findMany({where:{roomId:roomId , date: date}})
        console.log(existingBookings)
        const conflict = checkConflict(startTime , endTime , existingBookings)
        if(conflict.conflict){
            return res.status(400).json(conflict)
        }

       await prisma.booking.create({
            data: {
                title:title, date :date , endTime:endTime , startTime :startTime , roomId:roomId 
            }
        })
        console.log('booking created successfully')
        return res.status(200).json({
            conflict: false,
            message: 'booking created successfully'
        })
    } catch (error) {
      console.error(error , 'error occured during booking creation')
       return res.status(404).json({
        errormessage:`error occured during booking creation ,  ${error}`
       })
    }
 }
/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
 exports.deleteBooking =async (req, res) => {
    try {
        const id = req.params.id || req.body.id
        await prisma.booking.delete({where:{id},})
        console.log('booking deleted')
        return res.json({
            message :'booking deleted successfully'
        })
    } catch (error) {
        console.error(error , 'error occured during booking deletion')
       return res.status(404).json({
        errormessage:`error occured during booking deletion ,  ${error}`
       })
    }
 }
/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
 exports.sortBookings = async (req , res ) => {
   try {
     const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
   const {roomId , date} = req.query
   const where = {}
   if (date) {
      if (!DATE_REGEX.test(date)) {
        return res.status(400).json({
          error: "Invalid date format. Expected YYYY-MM-DD.",
        });
      }
      where.date = date;
    }

    if(roomId){
        if(typeof roomId !== 'string' || roomId.trim() === ""){
            return res.status(400).json({
          error: "Invalid roomId parameter.",
        });
        }
        where.roomId = roomId
    }
     const bookings = await prisma.booking.findMany({
        where , 
        include : {
            room :{
                select :{
                    id :true, 
                    name :true,
                    capacity :true
                }
            }
        },
        orderBy: {startTime :"asc"}
     })
    return res.status(200).json({
      count: bookings.length,
      data: bookings,
    });

   } catch (error) {
    console.error("Error fetching bookings:", error);

    return res.status(500).json({
      error: "An unexpected error occurred while fetching bookings. 0001 anash",
    });
   }
 }
/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
 exports.nextAvail = async (req , res) => {
     
     try {
      const {date , roomId, duration} = req.body ||req.query
      const existingBookings = await prisma.booking.findMany({where:{roomId:roomId , date: date}})
      const AvailbleSlot = findNextAvail(existingBookings , duration)
      if(typeof(AvailbleSlot) === null){
         return res.json({
             message:"sorry we dont have booking opt for your duration"
         })
      }
      return res.status(200).json({
         AvailbleSlot 
      })
    
  } catch (error) {
    console.error("Error finding availible booking slot", error);

    return res.status(500).json({
      error: "An unexpected error occurred while finding availible booking slot. 0002 anash",
    });
  }
 }