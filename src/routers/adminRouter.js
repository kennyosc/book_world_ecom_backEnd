const router = require('express').Router()
const conn = require('../connection/index.js')

//ADMIN LOGIN ROUTE
router.post('/admin/login', (req,res)=>{
    const sql = `SELECT * FROM admins WHERE username = '${req.body.username}' AND password = '${req.body.password}'`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })


})

module.exports = router