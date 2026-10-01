
const timetoMinutes = (time = '') => {
    const [hour , minute] =  time.split(':').map(Number)
    return hour * 60 + minute
}
const minutestoTime = (time = 0) =>{
    const hour = Math.floor(time/60)
    const minutes = time % 60
    return `${String(hour).padStart(2 , '0')}:${String(minutes).padStart(2 ,'0')}`
}
/**
 * 
 * @param {String} startTime 
 * @param {String} endTime 
 * @param {Array} existingBooking                                             
 */
exports.checkConflict = ( nstartTime , nendTime , existingBooking) => {
 const newStart = timetoMinutes(nstartTime)
 const newEnd = timetoMinutes(nendTime)
 
 const work_start = 9*60
 const work_end = 18*60

 // checking ki start time and endtime me paglo wali harkat to nahi
 if(newStart>=newEnd){
    return {
        conflict : true , 
        status: 400,
        messages : " start tome must be greater than endtime"
    }
 }

// now checking ki   booking off hours me to nahi
 if(newStart<work_start || newEnd > work_end){
     return {
        conflict : true , 
        status: 400,
        messages : "!! Bookings must be between 09:00 and 18:00 !!"
    }
 }

 // now main coflict checking started
  for(const booking of existingBooking){
    const ebStartTime = timetoMinutes(booking.startTime)
    const ebEndTime = timetoMinutes(booking.endTime)
//      11;30           11;00        10;30    11;30
    if(ebEndTime > newStart && ebStartTime < newEnd){
        return {
        conflict : true , 
        status: 400,
        conflictWith: booking,
        messages : `Conflict detected with booking "${booking.title}" (${booking.startTime} - ${booking.endTime})`
    }
    }
  }
  return {
    conflict : false
  }
}

/**
 * 
 * @param {Array} existingBooking 
 * @param {String} duration 
 */
exports.findNextAvail = (existingBooking , duration) => {
  const work_start = 9*60
  const work_end = 18*60

  let cursor = work_start
  const sorted = [...existingBooking].sort((a , b)=> timetoMinutes(a.startTime) - timetoMinutes(b.startTime)) 

  for( const booking of sorted){
     const startTime = timetoMinutes(booking.startTime)
    const endTime  = timetoMinutes(booking.endTime)
    
    if(startTime - cursor >= duration){
        const et = Number(cursor) + Number(duration)
        return {
            startTime : minutestoTime(cursor),
            endTime : minutestoTime(et)
        }
    }
     if(endTime>cursor){
        cursor = endTime
     }
  }
  if(work_end-cursor >= duration){
     const et = Number(cursor) + Number(duration)
        return {
            startTime : minutestoTime(cursor),
            endTime : minutestoTime(et)
        }
  }

  return null
}