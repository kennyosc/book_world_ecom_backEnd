const router = require('express').Router()
const conn = require('../connection/index.js')

//=======================================
//MULTER PRODUCT IMAGE CONFIGURATION
const multer = require('multer')
const path = require('path')

const rootdir = path.join(__dirname, '../../')
const productImageDir = path.join(rootdir,'/uploads/productImage')

const productImage_storage = multer.diskStorage(
    {
        destination: function(req,file,cb){
            cb(null,productImageDir)
        },
        filename: function(req,file,cb){
            cb(null, Date.now() + file.fieldname + path.extname(file.originalname))
        }
    }
)

const upload_productImage = multer(
    {
        storage: productImage_storage,
        limits:{
            fileSize: 1000000
        },
        fileFilter(req,file,cb){
            if(file.originalname.match(/\.(jpg|png|jpeg)$/)){
                cb(null,true)
            }else{
                cb(new Error('Please upload a .jpg .png or .jpeg file'))
            }
        }
    }
)


//=======================================


//GET PRODUCT CATEGORIES
router.get('/productcategories', (req,res)=>{
    const sql=`SELECT * FROM categories`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET PRODUCT GENRES
router.get('/productgenres',(req,res)=>{
    const sql = `SELECT * FROM genres ORDER BY genre ASC`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//POST NEW PRODUCT
//karena mau bikin marketplace, jadinya tidak perlu product per user
router.post('/addproduct',upload_productImage.single('productImage'),(req,res)=>{
    //insert to products
    const sql = `INSERT INTO products SET ?`
    //insert into product_categories
    const sql2 = `INSERT INTO product_categories SET ?`
    const data = req.body
    
    const product_data = 
    {
        name: data.name,
        price: data.price,
        stock: data.stock,
        photo: req.file.filename,
        weight: data.weight,
        description: data.description,
        author: data.author,
        published: data.published
    }

    conn.query(sql,product_data,(err,results)=>{
        if(err){
            return res.send(err)
        }

        
        const product_category_data = 
        {
            product_id: results.insertId,
            category_id : data.category_id,
            genre_id: data.genre_id
        }
    
        
        conn.query(sql2,product_category_data,(err,results)=>{
            if(err){
                return res.send(err)
            }
            res.send(results)
        })
    })
})

//GET ALL PRODUCTS
router.get('/allproducts', (req,res)=>{
    const sql = `SELECT * FROM products`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//POST NEW CATEGORY
router.post('/addcategory', (req,res)=>{
    const sql = `INSERT INTO categories SET ?`
    const data = req.body

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})


//POST NEW GENRE
router.post('/addgenre', (req,res)=>{
    const sql = `INSERT INTO genres SET ?`
    const data = req.body

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

module.exports = router