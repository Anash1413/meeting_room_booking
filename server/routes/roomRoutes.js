const { Router } = require('express')
const { getAllRooms } = require('../controller/roomController')
const roomRouter = Router()
roomRouter.get('/rooms' , getAllRooms)
module.exports = roomRouter
