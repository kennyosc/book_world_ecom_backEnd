const router = require('express').Router()
const conn = require('../connection/index.js')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')

const rootDir = path.join(__dirname,'../..')
const paymentProofDir = path.join(rootDir, '/uploads/paymentproof')

//ADMIN LOGIN ROUTE
router.post('/admin/login', (req,res)=>{
    const sql = `SELECT * FROM admins WHERE username = '${req.body.username}'`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        //results[0] karena dalam SELECT pasti akan menghasilkan array
        if(!results[0]){
            return res.send('Admin not found')
        }
        // parameter 1 : yang diinput
        // paramater 2 : yang di database
        bcrypt.compare(req.body.password, results[0].password).then(value=>{
            if(value === false){
                return res.send(results[0].password)
            }
            //if data is an [{...data}], then it is right
            res.send(results[0] )
        })
    })
})

//ADD NEW ADMIN
router.post('/addadmin', (req,res)=>{
    const sql = `INSERT INTO admins SET ?`
    const data = req.body

    data.password = bcrypt.hashSync(data.password, 8)

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
    const sql = `SELECT DATE_FORMAT(orders.created_at, '%m/%d/%y') as created_at,users.username,orders.order_recipient,orders.total, orders.payment_confirmation,orders.order_status, orders.id FROM orders
                inner join order_details
                on orders.user_id = order_details.user_id
                inner join users
                on users.id = orders.user_id
                group by orders.id
                order by orders.created_at DESC`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//accepting user payment
router.patch('/acceptuserpayment',(req,res)=>{
    const sql = `UPDATE orders SET order_status = 1 WHERE id = ${req.body.id} AND user_id = ${req.body.user_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        const sql2 = `INSERT INTO user_notifications (user_id, notification)
                        VALUES (${req.body.user_id}, 
                        'Your payment has been accepted on order ${req.body.id}')`
        conn.query(sql2,(err,results2)=>{
            if(err){
                return res.send(err)
            }
            res.send(results)
        })
    })
})

//rejecting user payment
router.patch('/rejectuserpayment',(req,res)=>{
    const sql = `SELECT payment_confirmation from orders WHERE id = ${req.body.id} AND user_id = ${req.body.user_id}`
    const sql2 = `UPDATE orders SET payment_confirmation = null WHERE id = ${req.body.id} AND user_id = ${req.body.user_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        if(!results[0]){
            return res.send('Proof not found')
        }

        const proofName = results[0].payment_confirmation
        const proofPath = paymentProofDir + '/' + proofName

        fs.unlink(proofPath,(err)=>{
            if(err){
                return res.send(err)
            }
        })

        conn.query(sql2,(err,results2)=>{
            if(err){
                return res.send(err)
            }

            const sql3 = `INSERT INTO user_notifications (user_id, notification)
                        VALUES (${req.body.user_id}, 
                        'Your payment has been rejected on order ${req.body.id}')`

            conn.query(sql3,(err,results3)=>{
                if(err){
                    return res.send(err)
                }

                res.send(results2)
            })
        })
    })
})

//GETTING USER PAYMENT PROOF
router.get('/adminpaymentproof/:imagename',(req,res)=>{
    const options = {
        root: paymentProofDir
    }

    const imagename = req.params.imagename

    res.sendFile(imagename, options, (err)=>{
        if(err){
            return res.send(err)
        }
    })
})

//=================NOTIFICATION=================
//get all notifications
router.get(`/adminnotification`,(req,res)=>{
    const sql= `SELECT DATE_FORMAT(created_at, '%m/%d/%y %H:%i:%S') AS created_at, notification,id
                FROM admin_notifications ORDER BY created_at DESC`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//delete 1 notification
router.delete(`/deletenotification/:user_id/:notif_id`,(req,res)=>{
    const sql = `DELETE FROM admin_notifications WHERE user_id=${req.params.user_id} AND id=${req.params.notif_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//delete all notification
router.delete(`/deleteallnotification`,(req,res)=>{
    const sql = `DELETE FROM admin_notifications`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//=================STATS=================
router.get(`/totalsalesonemonth`,(req,res)=>{
    const sql = `SELECT SUM(total) as totalOrders
    FROM orders
    WHERE
        created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y/%m/01')
            AND created_at < DATE_FORMAT(CURRENT_DATE(), '%Y/%m/31')`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

router.get(`/totalbooksoldonemonth`,(req,res)=>{
    const sql = `SELECT SUM(quantity) as bookSold
    FROM order_details
    WHERE
        created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y/%m/01')
            AND created_at < DATE_FORMAT(CURRENT_DATE(), '%Y/%m/31')
            AND order_id IS NOT NULL`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

router.get(`/averagebookrating`,(req,res)=>{
    const sql = `SELECT ROUND(avg(rating_value),1) as rating
    FROM product_reviews`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

router.get(`/totalusers`,(req,res)=>{
    const sql = `SELECT count(*) as totalUsers
    FROM users`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

router.get(`/totalcouponused`,(req,res)=>{
    const sql = `select sum(coupon_value) as couponCost from used_coupons
    inner join coupons
    on used_coupons.coupon_id = coupons.id`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

//=================COUPONS=================
//GET ALL COUPONS
router.get('/allcoupons',(req,res)=>{
    const sql = `SELECT * FROM coupons`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//POST NEW COUPON
router.post(`/submitnewcoupon`,(req,res)=>{
    const sql = `INSERT INTO coupons SET ?`
    const data = req.body

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//DELETE COUPON BY ID
router.delete(`/deletecoupon/:coupon_id`,(req,res)=>{
    const sql = `DELETE FROM coupons WHERE id = ${req.params.coupon_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})


module.exports = router