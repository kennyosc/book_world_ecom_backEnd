const router = require('express').Router()
const conn = require('../connection/index.js')
const fs = require('fs')
const sharp = require('sharp')

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

//PATCH EDITED CATEGORIES
router.patch('/saveeditedcategory',(req,res)=>{
    const sql = `UPDATE categories SET category = ? WHERE id = ?`
    const data = [req.body.category, req.body.id]

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//PATCH EDITED GENRES
router.patch('/saveeditedgenre',(req,res)=>{
    const sql = `UPDATE genres SET genre = ? WHERE id = ?`
    const data = [req.body.genre, req.body.id]

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})


//GET PRODUCT GENRES
router.get('/productgenres',(req,res)=>{
    //ASC karena di tampilan front-end jadi urut
    const sql = `SELECT * FROM genres ORDER BY genre ASC`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//POST NEW PRODUCT
//karena mau bikin ecommerce, jadinya tidak perlu product per user
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
        
        conn.query(sql2,product_category_data,(err,results2)=>{
            if(err){
                return res.send(err)
            }
            res.send(results)
        })
    })
})

//GET ALL PRODUCTS
router.get('/allproducts', (req,res)=>{
    const sql = `SELECT * FROM products
        INNER JOIN product_categories
        ON product_categories.product_id = products.id
        ORDER BY products.created_at DESC`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//SEARCHED PRODUCTS
router.get('/search/:product_title',(req,res)=>{
    const sql = `SELECT * FROM products WHERE name LIKE '%${req.params.product_title}%'`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET 5 PRODUCTS FOR NEW BOOKS
router.get('/newproducts',(req,res)=>{
    const sql = `SELECT * FROM products ORDER BY created_at DESC LIMIT 5`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET 3 PRODUCTS FOR BEST SELLERS
router.get('/bestsellers',(req,res)=>{
    const sql=`SELECT SUM(quantity) as quantity_sold,order_details.order_id, product_id, products.photo,
                products.name, products.description, products.price,products.id from order_details
                INNER JOIN products
                ON order_details.product_id = products.id
                group by product_id
                HAVING order_id IS NOT NULL
                ORDER BY quantity_sold DESC
                LIMIT 3`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET 3 PRODUCTS IS BEST SELLERS < 3 
router.get('/bestseller2',(req,res)=>{
    const sql=`SELECT * FROM products ORDER BY created_at ASC  LIMIT 3`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})


//GET PRODUCT_CATEGORY PER ID
//untuk digunakan di edit product
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

//GET PRODUCTS PER ID
router.get('/productdetails/:product_id',(req,res)=>{
    const sql = `SELECT * FROM products WHERE id = ${req.params.product_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

//GET ALL PRODUCT REVIEW PER product_id
router.get('/productreviews/:product_id',(req,res)=>{
    const sql = `SELECT DATE_FORMAT(product_reviews.created_at, '%m/%d/%y') AS created_at, users.username,
                users.avatar, product_reviews.rating_value, product_reviews.review FROM product_reviews
                INNER JOIN users
                ON users.id = product_reviews.user_id
                
                WHERE product_id = ${req.params.product_id}
                LIMIT 5`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET AVG OF PRODUCT_REVIEWS BY PRODUCT ID
router.get(`/averageproductrating/:product_id`,(req,res)=>{
    const sql = `SELECT avg(rating_value) AS ratings from product_reviews WHERE product_id = ${req.params.product_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

//DELETE PRODUCT BY ID
router.delete('/deleteproduct/:product_id',(req,res)=>{
    const sql = `SELECT photo FROM products WHERE id = ${req.params.product_id}`
    const sql2 = `DELETE FROM products WHERE id = ${req.params.product_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        const productImageName = results[0].photo
        const productImagePath = productImageDir + '/' + productImageName

        if(results[0].photo){
            fs.unlink(productImagePath, (err)=>{
                if(err){
                    return res.send(err)
                }
            })
        }

        conn.query(sql2, (err,results)=>{
            if(err){
                return res.send(err)
            }
            res.send(results)
        })
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

//READ IMAGE BY PRODUCT ID
router.get('/geteditproductimage/:productimagename', (req,res)=>{
    const options={
        root: productImageDir
    }

    const productImageName = req.params.productimagename

    res.sendFile(productImageName, options, (err)=>{
        if(err){
            return res.send(err)
        }
    })
})

// EDIT PRODUCT IMAGE BY ID
router.patch('/editproductimage/:product_id',upload_productImage.single('productImage'),(req,res)=>{
    //ini select dulu karena foto yang sudah ada, mau dicari namanya dan di unlink
    const sql = `SELECT photo FROM products WHERE id = ${req.params.product_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send({
                status:'error1',
                content: err})
        }
        
        const productImageName = results[0].photo
        const productImgPath = productImageDir + '/' + productImageName

        
        fs.unlink(productImgPath, (err)=>{
            if(err){
                return res.send(err)
            }
        })
        //lalu diupdate dengan photo yang baru di-upload
        const sql2 = `UPDATE products SET photo = '${req.file.filename}' WHERE id = ${req.params.product_id}`
                
            conn.query(sql2,(err,results)=>{
                if(err){
                    return res.send(err)
                }
                res.send(results)
            })
        }
    )
})

//EDIT PRODUCT PER PRODUCT ID
router.patch('/editproduct/:product_id', (req,res)=>{
    const sql = `UPDATE products SET ? WHERE id = ${req.params.product_id}`
    const sql2 = `UPDATE product_categories SET ? WHERE product_id = ${req.params.product_id}`
    const data = req.body

    const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        weight: data.weight,
        published: data.published,
        author:data.author
    }

    conn.query(sql,productData,(err,results)=>{
        if(err){
            return res.send(err)
        }

        const productCategoriesData = {
            category_id : data.category_id,
            genre_id : data.genre_id
        }
        conn.query(sql2, productCategoriesData, (err,results2)=>{
            if(err){
                return res.send(err)
            }
            res.send(results2)
        })
    })
})

//GET 1 product SPECIFIC WISHLIST for knowing if this product is wishlisted or not
router.get('/productwishlist/:user_id/:product_id',(req,res)=>{
    const sql = `SELECT * FROM wishlist WHERE user_id = ${req.params.user_id} AND product_id = ${req.params.product_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

//POST 1 PRODUCT TO WISHLIST
router.post('/addwishlist', (req,res)=>{
    const sql = `INSERT INTO wishlist SET ?`
    const data = req.body

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//DELETE 1 PRODUCT FROM WISHLIST
router.delete('/deletewishlist/:user_id/:product_id',(req,res)=>{
    const sql = `DELETE FROM wishlist WHERE user_id =${req.params.user_id} AND product_id = ${req.params.product_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})


module.exports = router