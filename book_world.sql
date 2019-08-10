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
    suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

SELECT * FROM users;

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL DEFAULT 1,
    photo VARCHAR(255) NOT NULL,
    weight DECIMAL(2 , 1 ) NOT NULL,
    published YEAR(4) NOT NULL,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

select * from products;

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

INSERT INTO categories(category) VALUES ('Fiction'),('Non-Fiction');

select * from categories;

CREATE TABLE genres(
id INT AUTO_INCREMENT PRIMARY KEY,
genre VARCHAR(255) NOT NULL unique,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

INSERT INTO genres(genre) VALUES 
('Biography'),('Essay'),('Memoir'),('Narrative nonfiction'),('Periodicals'),('Reference books'),('Self-help'),('Speech'),('Textbook'),('Poetry'),
('Art'),('Cookbook'),('Health'),('History'),('Religion'),('Science'),('Math'),('Travel'),
('Action and adventure'),('Anthology'),('Classic'),('Comic and graphic novel'),('Crime and detective'),('Drama'),('Fable'),('Fairy tale'),('Fan-fiction'),
('Fantasy'),('Historical fiction'),('Horror'),('Humor'),('Legend'),('Magical realism'),('Mystery'),('Mythology'),('Realistic fiction'),('Romance'),('Satire'),('Sci-fi'),
('Short story'),('Thriller');

select * from genres;
select * from genres where genre like '%cookbook%';
-- delete from genres;

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

INSERT INTO admins(username,email,password) VALUES('kennyosc','kenny@gmail.com','password');
SELECT * FROM admins;
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
    phone_number VARCHAR(255),
    total INT NOT NULL,
    coupon_id INT,
    payment_status BOOLEAN DEFAULT FALSE,
    order_status BOOLEAN DEFAULT FALSE,
    checkout_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_orders_userId FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_orders_couponId FOREIGN KEY (coupon_id)
        REFERENCES coupons (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE order_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    sub_total INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_details_orderId FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_details_productId FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT FK_details_userId FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

SELECT * FROM orders;
SELECT * from order_details;

CREATE TABLE product_categories (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    genre_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_category_productId FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_category_categoryId FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT FK_category_genreId FOREIGN KEY (genre_id)
        REFERENCES genres(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (product_id , category_id, genre_id)
);



CREATE TABLE wishlist (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_wishlist_userId FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_wishlist_productId FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE,
	primary key(user_id,product_id)
);

select * from wishlist;

select * from products;
select * from product_categories;

select products.name,categories.category,genres.genre from product_categories
inner join products
	ON product_categories.product_id = products.id
inner join categories
	on product_categories.category_id = categories.id
inner join genres
	on 	product_categories.genre_id = genres.id;




-- delivery_price(id, region, price)

-- delivery(id, order_id,region, address)

