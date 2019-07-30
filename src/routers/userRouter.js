const router = require('express').Router()
const conn = require('../connection/index.js')

router.post('/register',(req,res)=>{
    const sql = `INSERT INTO users SET ?`
    const data = req.body

    conn.query(sql,data, (err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
        res.send(data)
    })
})

module.exports = router
