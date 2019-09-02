// SET UP NODEMAILER
// npm i --save nodemailer
const nodemailer = require('nodemailer')

// function yang menerima 1 object
const transporter = nodemailer.createTransport(
    {
        service:'gmail',
        auth:{
            //Suatu protokol terbuka yang memungkinkan pengguna untuk berbagi sumber pribadi mereka (mis. foto, video, daftar alamat) yang disimpan di suatu situs web dengan situs lain tanpa perlu menyerahkan nama pengguna dan kata sandi mereka.
            type:'OAuth2',
            user:'kennyoscar95@gmail.com',
            //clientId ambil dari google api credentials
            clientId:'1077309332924-hg2fspgq22sv1q8cg5gjf9h821b3fh9g.apps.googleusercontent.com',
            clientSecret: 'c7TVL1lRrxzw9XJvjGLHjQaG',
            // https://auth0.com/learn/token-based-authentication-made-easy/
            // A client token is a signed data blob that includes configuration and authorization 
            // Token based authentication works by ensuring that each request to a server is accompanied by a signed token which the server verifies for authenticity and only then responds to the request.
            refreshToken:'1/rCFjEHjsAhJcazhuaWJrpfZ4KqVl1oheRQErRrUp0KM'
        }
    }
)


const mailVerify = (data) =>{

    var {id,username,email} = data

    let mail = {
        from: 'Book World <kennyoscar95@gmail.com>',
        to: email,
        subject: '[BookWorld] Please verify your email adress',
        html:`
        <p>Almost done, <b>@${username}</b>! To complete your Book World sign up, we just need to verify your email address:</p>
        <h3>${email}</h3>
        <br>
        <b><a href="http://localhost:2019/verify/${id}"> Verify Email </a></b>
        <br>
        <br>
        <p>Once verified, you can start collecting all of the different books in Book World.</p>`
    }

    transporter.sendMail(mail, (err, results)=>{
        if(err){
            return console.log(err)
        }
    
        console.log(results)
        console.log('Email Sent')
        /*
                { accepted: [ 'kennyoscar95@hotmail.com' ],
            rejected: [],  envelopeTime: 630,
            messageTime: 854,
            messageSize: 314,
            response: '250 2.0.0 OK  1564374990 2sm104879752pgm.39 - gsmtp',
            envelope:
            { from: 'bookworld@gmail.com',
                to: [ 'kennyoscar95@hotmail.com' ] },
            messageId: '<27ce0f8e-955e-e805-5ef0-e4ea2d2719a1@gmail.com>' }
        */
    })
}

module.exports = mailVerify



