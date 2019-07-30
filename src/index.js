const express = require('express')
const server = express()
const cors = require('cors')

const userRouter = require('./routers/userRouter.js')

const port = 2019

server.use(express.json())
server.use(cors())

server.use(userRouter)


server.listen(port, ()=>{
    console.log(`Connected to port ${port}`)
})