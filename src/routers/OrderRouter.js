const router = require('express').Router()
const conn = require('../connection/index.js')

//=============CART===============

//GET CART BY USER_ID
router.get('/getusercart/:user_id',(req,res)=>{
    const sql = `SELECT * FROM order_details 
    JOIN products
        ON products.id = order_details.product_id
    WHERE user_id = ${req.params.user_id} AND order_id IS NULL`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//COUNT TOTAL OF ORDER DETAILS WHERE ORDER_ID IS NULL
router.get('/gettotalorder/:user_id',(req,res)=>{
    const sql = `SELECT sum(sub_total) as SUM from order_details WHERE user_id = ${req.params.user_id} AND order_id IS NULL`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

//HANDLE ADD TO CART LOGIC
router.post('/handleaddtocart',(req,res)=>{
    // const sql = `INSERT INTO orders SET ?`
    const data = req.body
    const sql = `SELECT * FROM products WHERE id = ${data.product_id}`
    const sql3 = `SELECT * FROM order_details WHERE product_id = ${data.product_id} AND user_id = ${data.user_id} AND order_id IS NULL`
    const sql4 = `INSERT INTO order_details SET ?`

    // var orders_data = {
    //     user_id: data.user_id,
    //     order_recipient: data.first_name.concat(` ${data.last_name}`),
    //     total: data.total,
    //     phone_number: data.phone_number
    // }

    // conn.query(sql,orders_data,(err,results)=>{
    //     if(err){
    //         return res.send(err)
    //     }

    // CEK JUMLAH STOCK YANG TERSEDIA
    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }
        //LIAT ORDER_DETAILS APAKAH TERDAPAT PRODUCT YANG SAMA
        conn.query(sql3,(err,results1)=>{
            if(err){
                return res.send(err)
            }

            var order_details_data = {
                // order_id: results.insertId,
                user_id: data.user_id,
                product_id : data.product_id,
                quantity : data.quantity,
                sub_total : data.sub_total
            }

            if(!results1[0]){
                if(data.quantity > results[0].stock){
                    return res.send(`Stock remaining : ${results[0].stock}`)
                }else{
                    //JIKA TIDAK ADA YANG SAMA, MAKA TAMBAH 1 ORDER_DETAILS
                    conn.query(sql4,order_details_data,(err,results2)=>{
                        if(err){
                            return res.send(err)
                        }
                        res.send(results2)
                    })
                }
            }else{
                // JIKA ADA YANG SAMA, MAKA...
                //CEK JUMLAH STOCK YANG SUDAH DIPESAN
                const sql2 = `SELECT * FROM order_details WHERE user_id = ${data.user_id} AND product_id = ${data.product_id} AND order_id IS NULL`

                conn.query(sql2,(err,results4)=>{
                    if(err){
                        return res.send(err)
                    }

                    if((data.quantity + results4[0].quantity) > results[0].stock){
                        return res.send(`Stock remaining : ${results[0].stock}`)
                    }else{

                        // DAN UPDATE QUANTITY YANG SUDAH DIPESAN BERDASARKAN USER DAN ORDER_ID IS NULL (KARENA BELUM CHECKOUT)
                        var updateQty = results1[0].quantity + data.quantity
                        var updateSubTotal = results1[0].sub_total + data.sub_total
                        const sql5 = `UPDATE order_details SET quantity = ${updateQty}, sub_total=${updateSubTotal} WHERE product_id = ${data.product_id} AND user_id = ${data.user_id} AND order_id IS NULL`

                        conn.query(sql5,(err,results3)=>{
                            if(err){
                                return res.send(err)
                            }
                            res.send(results3)
                        })
                    }
                })
            }
        })
        
            // const sql2 = `UPDATE products SET stock=${results[0].stock - data.quantity} WHERE id =${data.product_id}`
    })
})

//DELETE FROM CART
router.delete('/deletefromcart/:user_id/:product_id',(req,res)=>{
    //DELETE FROM CART BY USER AND PRODUCT ID
    const sql = `DELETE FROM order_details WHERE user_id = ${req.params.user_id} AND product_id = ${req.params.product_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//=============COUPONS===============

//WHEN USER USES COUPON
router.post('/usecoupon',(req,res)=>{
    const data = req.body
    const sql3 = `SELECT user_id, coupon_code,count(*) as total_used, coupon_limit FROM coupons
        INNER JOIN used_coupons
            ON coupons.id = used_coupons.coupon_id
        GROUP BY used_coupons.user_id
        HAVING coupons.coupon_code = '${req.body.coupon_code}' AND user_id = ${data.user_id}`

    //untuk melihat jumlah total berapa kali user telah menggunakan 1 coupon berdasarkan coupon_limit
    conn.query(sql3,(err,results)=>{
        if(err){
            return res.send(err)
        }

        //kalau belum pakai sama sekali, maka post
        if(!results[0]){
            const sql = `SELECT * FROM coupons WHERE coupon_code = '${req.body.coupon_code}'`
                conn.query(sql,(err,results2)=>{
                    if(err){
                        return res.send(err)
                    }
                    
                    if(!results2[0]){
                        return res.send('Coupon not found')
                    }
                    const sql2 = `INSERT INTO used_coupons SET ?`
            
                    const coupon_data = {
                        user_id : data.user_id,
                        coupon_id : results2[0].id
                    }
            
                    conn.query(sql2,coupon_data,(err,results3)=>{
                        if(err){
                            return res.send(err)
                        }
                        res.send(results3)
                    })
                })
        }else{
            //kalau ada
            //cek apakah user tersebut sudah melebihi limit atau belum
            if(results[0].total_used === results[0].coupon_limit){
                return res.send('Coupon have reached its limit')
            }else{

                //jika belum maka masukin ke used_coupons
                const sql = `SELECT * FROM coupons WHERE coupon_code = '${req.body.coupon_code}'`
                conn.query(sql,(err,results2)=>{
                    if(err){
                        return res.send(err)
                    }
                    
                    const sql2 = `INSERT INTO used_coupons SET ?`
            
                    const coupon_data = {
                        user_id : data.user_id,
                        coupon_id : results2[0].id
                    }
            
                    conn.query(sql2,coupon_data,(err,results3)=>{
                        if(err){
                            return res.send(err)
                        }
                        res.send(results3)
                    })
                })
            }
        }
        
    })

})

//GET COUPONS VALUE WHERE ORDER_ID IS NULL.
//karena yang null adalah yang belum di checkout
//setelah di checkout, baru masukin (update) order_id ke dalam used_coupons
router.post('/getcouponvalue',(req,res)=>{
    const sql = `SELECT * FROM coupons
    INNER JOIN used_coupons
        on used_coupons.coupon_id = coupons.id 
    WHERE user_id = '${req.body.user_id}' AND used_coupons.order_id IS NULL`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results[0])
    })
})

//REMOVE COUPON FROM USER
router.delete('/deleteusecoupon/:coupon_id/:user_id',(req,res)=>{
    const sql = `DELETE FROM used_coupons WHERE coupon_id = ${req.params.coupon_id} AND user_id = ${req.params.user_id} AND order_id IS NULL`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//=============SHIPPING ADDRESS===============
//GET MAIN USER ADDRESS
router.get('/getuseraddress/:user_id',(req,res)=>{
    const sql = `SELECT * FROM user_address WHERE user_id = ${req.params.user_id} AND main_address = 1`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        res.send(results[0])
    })
})

//GET ALL USER ADDRESS
router.get('/getalluseraddress/:user_id',(req,res)=>{
    const sql = `SELECT * FROM user_address WHERE user_id = ${req.params.user_id} ORDER BY main_address DESC`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET ALL SHIPPING CITY
router.get('/allshippingcity',(req,res)=>{
    const sql = `SELECT * FROM shipping ORDER BY city`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//GET SHIPPING CITY VALUE WHERE USER_ADDRESS = MAIN
router.get('/shippingvalue/:user_id',(req,res)=>{
    const sql = `SELECT shipping_cost FROM shipping
                INNER JOIN user_address
                ON user_address.city = shipping.city
                    WHERE user_address.main_address = 1 AND user_id=${req.params.user_id}`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        
        res.send(results[0])
    })
})

//ADD NEW USER ADDRESS
router.post('/newuseraddress',(req,res)=>{
    const data = req.body
    const sql = `SELECT * FROM user_address WHERE user_id = ${req.body.user_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        if(results.length === 5){
            return res.send('Number of maximum address exceeded')
        }else{
            const sql2 = `INSERT INTO user_address SET ?`

            conn.query(sql2,data,(err,results2)=>{
                if(err){
                    return res.send(err)
                }
                res.send(results2)
            })
        }
    })
})

//DELETE USER ADDRESS PER ID
router.delete(`/deleteuseraddress/:user_id/:address_id`,(req,res)=>{
    const sql = `DELETE FROM user_address WHERE user_id=${req.params.user_id} AND id=${req.params.address_id}`
    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(results)
    })
})

//SET ADDRESS AS MAIN
router.patch('/setaddressasmain/:user_id/:address_id',(req,res)=>{
    const sql = `UPDATE user_address SET main_address = 0 WHERE user_id=${req.params.user_id} AND main_address = 1`

    conn.query(sql,(err,results)=>{
        if(err){
            return res.send(err)
        }

        if(!results){
            return res.send('Address not found')
        }

        const sql2 = `UPDATE user_address SET main_address = 1 WHERE user_id=${req.params.user_id} AND id=${req.params.address_id}`
        conn.query(sql2,(err,results)=>{
            if(err){
                return res.send(err)
            }
            res.send(results)
        })
    })
})

//=============CHECKOUT===============
//checkout untuk masukin ke orders,update order_details, dan update coupon
router.post('/finalcheckout',(req,res)=>{
    //insert to orders
    const sql = `INSERT INTO orders SET ?`
    const data = req.body

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }
        
        //get orders_id (insertId)
        if(!results){
            return res.send('Input order failed')
        }

        const order_id = results.insertId
        
        //update order_details (order_id) supaya 'cart' menjadi hilang
        const sql2 = `UPDATE order_details SET order_id = ${order_id} WHERE user_id=${data.user_id} AND order_id IS NULL`
        conn.query(sql2,(err,results2)=>{
            if(err){
                return res.send(err)
            }
            
            if(!results2){
                return res.send('Order Details not found')
            }

            //update used_coupons (order_id) sehingga coupon tercatat digunakan untuk order sekian
            const sql3 = `UPDATE used_coupons SET order_id = ${order_id} WHERE user_id =${data.user_id} AND order_id IS NULL`
            conn.query(sql3,(err,results3)=>{
                if(err){
                    return res.send(err)
                }

                if(!results3){
                    return res.send('Coupon not found')
                }

                res.send(results3)
            })
        })
    })
})

//checkout untuk update stock produk yang dibeli
router.patch(`/checkoutupdatestock`,(req,res)=>{
    //get existing product stock
    const sql = `SELECT stock FROM products WHERE id = ${req.body.product_id}`

    conn.query(sql,(err,results1)=>{
        if(err){
            return res.send(err)
        }
        if(!results1){
            return res.send('Product not found')
        }
        
        const existing_stock = results1[0].stock
        //update product stock
        const sql2 = `UPDATE products SET stock = ${existing_stock - req.body.quantity} WHERE id=${req.body.product_id}`
        conn.query(sql2,(err,results2)=>{
            if(err){
                return res.send(err)
            }
            res.send(results2)
        })

    })
})

module.exports = router
