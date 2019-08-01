create database book_world_db;
use book_world_db;

-- PRIMARY TABLES
-- users,products, categories

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    gender ENUM('Male', 'Female') NOT NULL,
    phone_number VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL DEFAULT 1,
    photo VARCHAR(255) NOT NULL,
    weight DECIMAL(2 , 1 ) NOT NULL,
    published DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_code CHAR(8) NOT NULL UNIQUE,
    coupon_value INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);


CREATE TABLE admins(
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
SELECT * FROM admins
-- CONNECTING TABLES
-- ratings, reviews, orders, product_categories, coupons

CREATE TABLE product_reviews (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating_value ENUM('1', '2', '3', '4', '5'),
    review TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_userId FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_productId FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id , user_id , product_id)
);

-- table order akan diinput bersamaann ketika add to cart bersama dengan order_details
-- ketika checkout, orders.id harus naik 1
-- klik ADD TO CART -- ketika add to cart, orders.id harus insert 1 dan order_details harus insert 1
-- KLIK ADD TO CART X2 -- jika sudah ada barang di dalam cart, maka orders.total akan update dan insert baru di order_details
-- KLIK CHECKOUT -- 
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
	order_recipient VARCHAR(255) NOT NULL,
    total INT NOT NULL,
    coupon_id INT,
    order_status BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_orders_userId FOREIGN KEY (user_id)
        REFERENCES users (id),
    CONSTRAINT FK_orders_couponId FOREIGN KEY (coupon_id)
        REFERENCES coupons (id)
);

CREATE TABLE order_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    sub_total INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_details_orderId FOREIGN KEY (order_id)
        REFERENCES orders (id),
    CONSTRAINT FK_details_productId FOREIGN KEY (product_id)
        REFERENCES products (id)
);

CREATE TABLE product_categories (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_category_productId FOREIGN KEY (product_id)
        REFERENCES products (id),
    CONSTRAINT FK_category_categoryId FOREIGN KEY (category_id)
        REFERENCES categories (id),
    PRIMARY KEY (product_id , category_id)
);

CREATE TABLE wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_wishlist_userId FOREIGN KEY (user_id)
        REFERENCES users (id),
    CONSTRAINT FK_wishlist_productId FOREIGN KEY (product_id)
        REFERENCES products (id)
);

select * from users;


-- delivery_price(id, region, price)

-- delivery(id, order_id,region, address)

