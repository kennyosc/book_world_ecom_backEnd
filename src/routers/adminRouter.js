const router = require('express').Router()
const conn = require('../connection/index.js')

//ADMIN LOGIN ROUTE
router.post('/admin/login', (req,res)=>{
    const sql = `SELECT * FROM admins WHERE username = '${req.body.username}' AND password = '${req.body.password}'`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        //results[0] karena dalam SELECT pasti akan menghasilkan array
        if(!results[0]){
            return res.send('Admin not found')
        }

        //if data is an [{...data}], then it is right
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

//=================ORDERS=================
//render all orders - manageorders
router.get('/admin/alluserorders',(req,res)=>{
    const sql = `SELECT DATE_FORMAT(orders.created_at, '%m/%d/%y') as created_at,users.username,orders.order_recipient,orders.total, orders.payment_confirmation,orders.order_status FROM orders
                inner join order_details
                on orders.user_id = order_details.user_id
                inner join users
                on users.id = orders.user_id
                group by orders.id`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})


module.exports = router