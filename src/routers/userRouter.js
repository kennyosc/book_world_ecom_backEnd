const router = require('express').Router()
const conn = require('../connection/index.js')
const bcrypt = require('bcrypt')

const validator = require('validator')

router.post('/register',(req,res)=>{
    const sql = `INSERT INTO users SET ?`
    const data = req.body

    // console.log(data)
    /*
    {   first_name: 'Alvin',
        last_name: '',
        username: 'alvin',
        email: 'alvin@gmail.com',
        phone_number: '1234568',
        password: 'pass' }
    */

    //first_name huruf depannya huruf besar
    const f_first_letter = data.first_name.charAt(0).toUpperCase()
    const f_name = data.first_name.slice(1)
    data.first_name = f_first_letter.concat(f_name)

    //last_name huruf depannya huruf besar
    const l_first_letter = data.last_name.charAt(0).toUpperCase()
    const l_name = data.first_name.slice(1)
    data.last_name = l_first_letter.concat(l_name)

    //username trim()
    if(data.username.includes(' ')){
        throw new Error('Username must not contain spaces')
    }
    if(validator.isAscii(data.username)){
        data.username = data.username.trim() 
    }else{
        throw new Error('Username must be ASCII')
    }

    // isEmail
    if(!validator.isEmail(data.email)){
        throw new Error('Please input correct form of email')
    }

    //ubah password jadi hash
    data.password = bcrypt.hashSync(data.password, 8)

    conn.query(sql,data, (err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

module.exports = router
