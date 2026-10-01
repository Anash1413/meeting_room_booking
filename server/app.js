const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const PORT = process.env.PORT || 5000
const app = express()
const roomRouter = require('./routes/roomRoutes')
const bookingRouter = require('./routes/bookingRoute')

 app.use(cors({origin:['http://localhost:3000']}))
app.use(express.json())
app.use('/api', roomRouter)
app.use('/api/booking', bookingRouter)

app.listen(PORT, () => {
  console.log('your app is running in http://localhost:5000')
})
