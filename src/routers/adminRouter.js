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

//ADD NEW ADMIN
router.post('/addadmin', (req,res)=>{
    const sql = `INSERT INTO admins SET ?`
    const data = req.body

    conn.query(sql,data, (err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET ALL ADMIN
router.get('/alladmins', (req,res)=>{
    const sql = `SELECT * FROM admins`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//DELETE ADMIN BY ID
router.delete('/deleteadmin/:admin_id',(req,res)=>{
    const sql = `DELETE FROM admins WHERE id = ${req.params.admin_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET ALL USERS
router.get('/allusers', (req,res)=>{
    const sql = `SELECT * FROM users`
    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(results)
        }
        res.send(results)
    })
})

//SUSPEND/UNSUSPEND USER BY ID
router.patch('/admin/suspenduser/:user_id', (req,res)=>{
    const sql = `UPDATE users SET ? WHERE id = ${req.params.user_id}`
    const data = req.body

    conn.query(sql,data, (err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})


module.exports = router