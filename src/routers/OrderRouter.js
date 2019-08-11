const router = require('express').Router()
const conn = require('../connection/index.js')

//GET IF USER HAVE ALREADY ORDERED OR NOT
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

//HANDLE ADD TO CART LOGIC
router.post('/handleaddtocart',(req,res)=>{
    // const sql = `INSERT INTO orders SET ?`
    const data = req.body
    const sql = `SELECT * FROM products WHERE id = ${data.product_id}`
    const sql3 = `SELECT * FROM order_details WHERE product_id = ${data.product_id}`
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

        // JIKA YANG DIPESAN, LEBIH DARI STOCK, MAKA ERR
        if(data.quantity > results[0].stock){
            return res.send(`Stock remaining : ${results[0].stock}`)
        }else{
            const sql2 = `UPDATE products SET stock=${results[0].stock - data.quantity} WHERE id =${data.product_id}`
            //JIKA BISA, MAKA UPDATE STOCK YANG ADA DI PRODUCT
            conn.query(sql2,(err,results)=>{
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
                        //JIKA TIDAK ADA YANG SAMA, MAKA TAMBAH 1 ORDER_DETAILS
                        conn.query(sql4,order_details_data,(err,results2)=>{
                            if(err){
                                return res.send(err)
                            }
                            res.send(results2)
                        })
                    }else{
                        // JIKA ADA, MAKA AKAN DIUPDATE QTY NYA
                        var updateQty = results1[0].quantity + data.quantity
                        var updateSubTotal = results1[0].sub_total + data.sub_total
                        const sql5 = `UPDATE order_details SET quantity = ${updateQty}, sub_total=${updateSubTotal} WHERE product_id = ${data.product_id}`
            
                        conn.query(sql5,(err,results3)=>{
                            if(err){
                                return res.send(err)
                            }
                            res.send(results3)
                        })
                    }
                })

            })
        }

    })
    // })
})

module.exports = router

