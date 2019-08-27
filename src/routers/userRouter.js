const router = require('express').Router()
const conn = require('../connection/index.js')
const bcrypt = require('bcrypt')
const validator = require('validator')
const fs = require('fs')

const mailVerify = require('../../nodemailer/verify_user.js')

//==================================================
//MODULE UNTUK IMAGE
//upload avatar
const path = require('path')
const multer = require('multer')

//photo directory
const rootDir = path.join(__dirname,'../..')
const avatarDir = path.join(rootDir, '/uploads/avatars')
const paymentProofDir = path.join(rootDir, '/uploads/paymentproof')

//konfigurasi untuk storage menaruh file avatar
const avatar_storage = multer.diskStorage(
    {
        destination: function(req,file,cb){
            cb(null,avatarDir)
        },
        filename: function(req,file,cb){
            // console.log(file)
            // { fieldname: 'avatar',
            //     originalname: 'destiny_avatar2.jpg',
            //     encoding: '7bit',
            //     mimetype: 'image/jpeg' }

            // console.log(path)
            cb(null, (Date.now() + '_' + file.fieldname + path.extname(file.originalname)).toLowerCase())
        }
    }
)

const payment_proof_storage = multer.diskStorage(
    {
        destination: function(req,file,cb){
            cb(null,paymentProofDir)
        },
        filename: function(req,file,cb){
            cb(null,(Date.now()+ '_' + file.fieldname + path.extname(file.originalname)).toLowerCase())
        }
    }
)

//konfigurasi untuk filter ketika melakukan upload
const upload_avatar = multer(
    {
        storage: avatar_storage,
        limits:{
            fileSize: 1000000
        },
        fileFilter(req,file,cb){
            if(file.originalname.toLowerCase().match(/\.(jpg|png|jpeg)$/)){
                cb(null,true)
            }else{
                cb(new Error('Please upload a .jpg .png .jpeg photo'))
            }
        }
    }
)

const upload_payment_proof = multer(
    {
        storage: payment_proof_storage,
        limits:{
            fileSize: 1000000
        },
        fileFilter(req,file,cb){
            if(file.originalname.toLowerCase().match(/\.(jpg|png|jpeg)$/)){
                cb(null,true)
            }else{
                cb(new Error('Please upload a .jpg .png .jpeg photo'))
            }
        }
    }
)

//==================================================

//REGISTER ROUTE
router.post('/register',(req,res)=>{
    const data = req.body
    const sql1 = `SELECT username FROM users WHERE username='${data.username}'`
    const sql2 = `SELECT email FROM users WHERE email='${data.email}'`
    const sql3 = `INSERT INTO users SET ?`
    // console.log(data)
    /*
    {   first_name: 'Alvin',
        last_name: '',
        username: 'alvin',
        email: 'alvin@gmail.com',
        phone_number: '1234568',
        password: 'pass' }
    */

    if(data.first_name == '' || data.username == '' || data.gender == '' || data.email == '' || data.password == ''){
        return res.send('Please insert all the required fields')
    }else{
         //first_name huruf depannya huruf besar
    const f_first_letter = data.first_name.charAt(0).toUpperCase()
    const f_name = data.first_name.slice(1)
    data.first_name = f_first_letter.concat(f_name)

    //last_name huruf depannya huruf besar
    const l_first_letter = data.last_name.charAt(0).toUpperCase()
    const l_name = data.last_name.slice(1)
    data.last_name = l_first_letter.concat(l_name)

    //username trim()
    if(data.username.includes(' ')){
        return res.send('Username must not contain spaces')
    }
    data.username = data.username.trim() 

    // isEmail
    if(!validator.isEmail(data.email)){
        return res.send('Please input correct form of email')
    }

    //ubah password jadi hash
    if(data.password.length < 8){
        return res.send('Password must be >= 8 words')
    } else{
        data.password = bcrypt.hashSync(data.password, 8)
    }

        //CHECK IF USERNAME IS TAKEN OR NOT
        conn.query(sql1, (err,results)=>{
            if(err){
                return res.send(err)
            }
            if(!(results.length == 0)){
                return res.send('Username already taken')
            }else{
                //CHECK IF EMAIL IS TAKEN OR NOT
                conn.query(sql2, (err,results2)=>{
                    if(err){
                        return res.send(err)
                    }
                    if(!(results2.length == 0)){
                        return res.send('Email already taken')
                    }else{ 
                        //INPUT DATA TO DATABASE
                        conn.query(sql3,data, (err,results3)=>{
                            if(err){
                                return res.send(err)
                            }
                            // mailVerify(data)
                            res.send(results3)
                        })
                    }
                })
            }
        })
    }
   
})

//VERIFY EMAIL ROUTE
router.get('/verify/:user_id',(req,res)=>{
    const sql = `UPDATE users SET verified = true WHERE id='${req.params.user_id}'`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send('User Verified!')
    })
})

//LOGIN ROUTE
router.post('/login', (req, res)=>{
    const data = req.body
    const sql = `SELECT * FROM users WHERE email = '${data.email}'`

    if(data.email == '' || data.password == ''){
        return res.send('Please fill all the field')
    } else{
        conn.query(sql, (err,results)=>{
            if(err){
                return res.send(err)
            }

            if(!results){
                return res.send('Please register first')
            }
            console.log(results)
            if(results.length < 1){
                return res.send('Email/ Password Incorrect')
            }else{
                bcrypt.compare(data.password, results[0].password).then((value)=>{
                    if(value === false){
                        return res.send('Email/ Password Incorrect!')
                    }else{
                        return res.send(results[0])
                    }
                })
            }
        })
    }
    
})

//UPDATE : PROFILE
router.patch('/updateprofile/:id', (req,res)=>{
    const data = [req.body, req.params.id ]
    const sql = `UPDATE users SET ? WHERE id = ?`

    conn.query(sql,data, (err,results)=>{
        if(err){
            return res.send(err)
        }

        //karena mau dikirim lagi ke front-end untuk update redux
        const sql2 = `SELECT * FROM users WHERE id = ${req.params.id}`
        conn.query(sql2, (err,results2)=>{
            if(err){
                return res.send(err)
            }
            res.send(results2[0])
        })
    })
})

//UPDATE : CHANGE PASSWORD
router.patch('/updatepassword/:id', (req,res)=>{
    //apakah harus di cek dulu?
    // kalau tidak check dulu bisa tidak?
    const sql = `SELECT * FROM users WHERE id = ${req.params.id}`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send('Password Incorrect')
        }
        const data = req.body
        
        const verifyPassword = bcrypt.compare(data.oldPassword,results[0].password)
        const newPassword = bcrypt.hashSync(data.newPassword , 8)

        if(verifyPassword){
            const sql2 = `UPDATE users SET password = '${newPassword}' WHERE id = ${req.params.id}`
            conn.query(sql2, (err,results)=>{
                if(err){
                    return res.send(err)
                }
                res.send('Password updated')
            })
        }
    })
})

//UPDATE : AVATAR TO SPECIFIED USER
router.patch('/updateavatar/:user_id', upload_avatar.single('avatar'),(req,res)=>{
    const sql = `SELECT avatar FROM users WHERE id = ${req.params.user_id}`
    const sql2 = `UPDATE users SET avatar = '${req.file.filename}' WHERE id = ${req.params.user_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        const imageName = results[0].avatar
        const avatarPath = avatarDir + '/' + imageName

        if(results[0].avatar){
            fs.unlink(avatarPath, (err)=>{
                if(err){
                    return res.send(err)
                }

            })
        }

        conn.query(sql2, (err,results)=>{
            if(err){
                return res.send(123)
            }
    
            res.send(req.file.filename)
        })
        
    })

})

//READ : AVATAR FROM USER
router.get('/profile/avatar/:imagename', (req,res)=>{
    //res.sendFile(path [, options] [, fn])

    const options = {
        root: avatarDir
    }

    const imagename = req.params.imagename

    res.sendFile(imagename, options, (err)=>{
        if(err){
            return res.send(err)
        }
    })

})

//===================USER ORDERS====================
//get all orders by user_id
router.get('/userorders/:user_id',(req,res)=>{
    const sql = `SELECT DATE_FORMAT(created_at, '%m/%d/%y') as created_at,id,order_recipient,phone_number,recipient_address,total,payment_confirmation,order_status 
    FROM orders WHERE user_id= ${req.params.user_id}  ORDER BY created_at DESC`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//uploading proof of payment
router.patch(`/uploadpaymentproof`, upload_payment_proof.single('payment_proof'),(req,res)=>{
    const sql = `SELECT payment_confirmation FROM orders WHERE id = ${req.body.order_id} AND user_id=${req.body.user_id}`
    const sql2 = `UPDATE orders SET payment_confirmation='${req.file.filename}' where id =${req.body.order_id} AND user_id = ${req.body.user_id}`
    
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        //check if there is already proof of payment
        if(results[0].payment_confirmation){
            const proofName = results2[0].payment_confirmation
            const proofPath = paymentProofDir + '/' + proofName

            fs.unlink(proofPath,(err)=>{
                if(err){
                    return res.send(err)
                }
            })
        }
        
            //update payment_confirmation
            conn.query(sql2,(err,results2)=>{
                if(err){
                    return res.send(req.file.filename)
                }

                //add to notification
                const sql3 = `INSERT INTO admin_notifications (user_id, notification) VALUES
                (${req.body.user_id}, '${req.body.username} has uploaded proof of payment to order ${req.body.order_id}');`

                conn.query(sql3,(err,results3)=>{
                    if(err){
                        return res.send(err)
                    }
                    res.send(results3)
                })
            })
    })
})

//render all product in order_details where order_id = ....
router.get(`/userproductreview/:user_id/:order_id`,(req,res)=>{
    const sql = `SELECT orders.id AS order_id, order_details.id AS order_details_id,order_details.review_status,
    products.id AS product_id,products.photo,products.name,products.price,
    products.author,products.published FROM order_details 

    INNER JOIN products
    ON products.id = order_details.product_id
    INNER JOIN orders
    ON orders.id = order_details.order_id
    WHERE order_details.user_id = ${req.params.user_id} AND order_details.order_id = ${req.params.order_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//ADD PRODUCT REVIEW
router.post(`/addproductreview`,(req,res)=>{
    const sql = `INSERT INTO product_reviews SET ?`
    const data = req.body

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        
        const sql2 = `UPDATE order_details SET review_status = 1 WHERE order_id=${data.order_id} AND user_id=${data.user_id} AND product_id=${data.product_id}`
        conn.query(sql2,(err,results2)=>{
            if(err){
                return res.send(err)
            }
            res.send(results2)
        })
    })
})

module.exports = router
