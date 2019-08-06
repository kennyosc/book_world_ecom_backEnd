const express = require('express')
const server = express()
const cors = require('cors')

const userRouter = require('./routers/userRouter.js')
const adminRouter = require('./routers/adminRouter.js')
const productRouter = require('./routers/productRouter.js')

const port = 2019

server.use(express.json())
server.use(cors())

server.use(userRouter)
server.use(adminRouter)
server.use(productRouter)


server.listen(port, ()=>{
    console.log(`Connected to port ${port}`)
})