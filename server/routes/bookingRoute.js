const express = require('express')
const { createBooking, deleteBooking, sortBookings, nextAvail } = require('../controller/bookingController')
const bookingRouter = express.Router()
bookingRouter.route('/').post( createBooking).get(sortBookings)
bookingRouter.delete('/',deleteBooking)
bookingRouter.route('/next-available').get(nextAvail).post(nextAvail)
bookingRouter.route('/next-availible').get(nextAvail).post(nextAvail)
module.exports = bookingRouter
