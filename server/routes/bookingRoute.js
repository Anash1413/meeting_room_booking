const express = require('express')
const { createBooking, deleteBooking, sortBookings, nextAvail } = require('../controller/bookingController')
const bookingRouter = express.Router()
bookingRouter.route('/').post( createBooking).get(sortBookings)
bookingRouter.delete('/',deleteBooking)
bookingRouter.get('/next-availible' , nextAvail)
module.exports = bookingRouter
