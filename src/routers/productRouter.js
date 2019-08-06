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
//ORDER TAMBAHIN PAYMENT_STATUS // DONE
// ORDER_DETAILS TAMBAHIN QTY // DONE
// MANAGE PRODUCTS TAMBAHIN STATUS ('LIVE'/ 'OUT OF STOCK') // NANTI RENDER DENGAN FRONT-END
// TAMBAHIN RATING 4.5/5

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

//GET PRODUCT_CATEGORY PER ID
router.get('/productcategory/:product_id',(req,res)=>{
    const sql = `select * from product_categories
    inner join products
        ON product_categories.product_id = products.id
    inner join categories
        on product_categories.category_id = categories.id
    inner join genres
        on 	product_categories.genre_id = genres.id
        WHERE products.id = ${req.params.product_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

//DELETE PRODUCT BY ID
router.delete('/deleteproduct/:product_id',(req,res)=>{
    const sql = `DELETE FROM products WHERE id = ${req.params.product_id}`
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

//DELETE CATEGORY BY ID
router.delete('/deletecategory/:category_id',(req,res)=>{
    const sql = `DELETE FROM categories WHERE id = ${req.params.category_id}`

    conn.query(sql,(err,results)=>{
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

//DELETE genre BY ID
router.delete('/deletegenre/:genre_id',(req,res)=>{
    const sql = `DELETE FROM genres WHERE id = ${req.params.genre_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

// EDIT PRODUCT BY ID


module.exports = router