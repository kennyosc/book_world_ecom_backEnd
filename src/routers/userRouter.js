const router = require('express').Router()
const conn = require('../connection/index.js')
const bcrypt = require('bcrypt')
const validator = require('validator')

//==================================================
//MODULE UNTUK IMAGE
//upload avatar
const path = require('path')
const multer = requier('multer')

//photo directory
const rootDir = path.join(__dirname,'../..')
const avatarDir = path.join(rootDir, '/uploads/avatars')

//konfigurasi untuk storage menaruh file avatar
const avatar_storage = multer.diskStorage(
    {
        destination: function(req,file,cb){
            cb(null,avatarDir)
        },
        filename: function(req,file,cb){
            cb(null, Date.now() + '_' + req.body.username + path.extname(file.originalname))
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
            if(file.originalname.match(/\.(jpg|png|jpeg)$/)){
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
    if(data.password < 8){
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
                            res.send(results3)
                        })
                    }
                })
            }
        })
    }
   
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
    
            bcrypt.compare(data.password, results[0].password).then((value)=>{
                if(value === false){
                    return res.send('Email/ Password Incorrect!')
                }else{
                    return res.send(results[0])
                }
            })
        })
    }
    
})

//UPDATE PROFILE
router.patch('/updateprofile/:username', (req,res)=>{
    const data = [req.body, req.params.username ]
    const sql = `UPDATE users SET ? WHERE username = ?`

    conn.query(sql,data, (err,results)=>{
        if(err){
            return res.send(err)
        }

        const sql2 = `SELECT * FROM users WHERE username = ${req.params.username}`
        res.send(results[0])
    })
})

module.exports = router
