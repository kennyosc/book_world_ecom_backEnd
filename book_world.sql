create database book_world_db;
use book_world_db;

-- PRIMARY TABLES
-- users,products, categories
select * from users;

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

SELECT count(*) as totalUsers
    FROM users;

CREATE TABLE user_address(
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
address varchar(255) not null,
city VARCHAR(255) not null,
postal_code varchar(255) not null,
main_address boolean default true,
constraint FK_address_userId
foreign key (user_id) references users(id)
on delete cascade on update cascade
);

select * from user_address;

ALTER TABLE user_address
ADD COLUMN order_recipient VARCHAR(255) AFTER user_id;

ALTER TABLE user_address
ADD COLUMN phone_number VARCHAR(255) AFTER order_recipient;

create table shipping(
id INT AUTO_INCREMENT PRIMARY KEY,
city VARCHAR(255) NOT NULL UNIQUE,
shipping_cost INT NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

select * from shipping;

INSERT INTO shipping (city,shipping_cost) VALUES
('Jakarta',9000),('Surabaya',19000),('Bandung',11000),('Bekasi',9000),('Tangerang',9000),('Depok',9000),('Semarang',18000),('Tangerang Selatan',9000),('Bogor',9000),('Malang',22000),('Medan',37000),
('Balikpapan',49000),('Denpasar',28000),('Yogjakarta',18000),('Palembang',22000),('Makassar',43000),('Manado',60000),('Batam',35000),('Pekanbaru',35000),('Banjarmasin',41000),('Pontianak',37000),('Solo',18000),
('Samarinda',55000),('Padang',35000),('Lampung',19000);

select * from shipping;
select * from shipping order by city ASC;

SELECT shipping_cost FROM shipping
                INNER JOIN user_address
                ON user_address.city = shipping.city
                    WHERE user_address.main_address = 1 AND user_id=2;

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

select * from genres;
select * from categories;

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
    promotion_title VARCHAR(255) NOT NULL,
    coupon_code CHAR(8) NOT NULL UNIQUE,
    coupon_value INT NOT NULL,
    quantity INT NOT NULL,
    coupon_limit INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

insert into coupons (coupon_code,coupon_value,quantity,coupon_limit) VALUES
('1234abcd',50000,50,3);

insert into coupons (coupon_code,coupon_value,quantity,coupon_limit) VALUES
('abcd1234',25000,50,3);

ALTER TABLE coupons
ADD column promotion_title VARCHAR(255) after id;

select * from coupons;

CREATE TABLE used_coupons(
coupon_id INT NOT NULL,
user_id INT NOT NULL,
order_id INT,
created_at TIMESTAMP DEFAULT NOW(),
udpated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
constraint FK_usedCoupons_couponId
FOREIGN KEY (coupon_id) references coupons(id)
ON DELETE CASCADE ON UPDATE CASCADE,
constraint FK_usedCoupons_userId
foreign key (user_id) references users(id)
ON DELETE CASCADE ON UPDATE CASCADE,
constraint FK_usedCoupons_orderId
foreign key (order_id) references orders(id)
ON DELETE CASCADE ON UPDATE CASCADE
);

SELECT * FROM coupons;
SELECT * FROM used_coupons;

SELECT user_id,coupon_id, coupon_code,count(*) as total_used, coupon_limit FROM coupons
        INNER JOIN used_coupons
            ON coupons.id = used_coupons.coupon_id
        GROUP BY used_coupons.coupon_id,used_coupons.user_id
        HAVING coupons.coupon_code = 'bw_1234' AND user_id = 2;

select sum(coupon_value) from used_coupons
inner join coupons
on used_coupons.coupon_id = coupons.id;

SELECT user_id, coupon_code,count(*) as total_used, coupon_limit FROM coupons
        INNER JOIN used_coupons
            ON coupons.id = used_coupons.coupon_id
        GROUP BY used_coupons.user_id
        HAVING coupons.coupon_code = '1234abcd' AND user_id =2 ;
        


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
    order_id INT not null,
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
	CONSTRAINT FK_orderId FOREIGN KEY (order_id)
        REFERENCES orders (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id , user_id , product_id, order_id)
);

SELECT * FROM product_reviews;
SELECT avg(rating_value) from product_reviews WHERE product_id = 8;

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
    order_status BOOLEAN DEFAULT FALSE,
    canceled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_orders_userId FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

select * from orders;
select sum(total) from orders;

SELECT * FROM orders
WHERE created_at BETWEEN(current_date() - INTERVAL 1 YEAR) AND CURRENT_DATE();

SELECT SUM(total)
FROM orders
WHERE
    created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y/%m/01')
        AND created_at < DATE_FORMAT(CURRENT_DATE(), '%Y/%m/31');
        
select date_format(current_date(), '%Y/%m/01');

alter table orders
drop column payment_status,
drop column checkout_status;

alter table orders
drop column review_status;

ALTER TABLE orders
ADD COLUMN recipient_address VARCHAR(255) AFTER order_recipient;

ALTER TABLE orders
ADD COLUMN payment_confirmation VARCHAR(255) after total;

ALTER TABLE orders
ADD COLUMN canceled boolean default false after order_status;

		

CREATE TABLE order_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    sub_total INT NOT NULL,
    review_status boolean default false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT FK_details_orderId FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_details_productId FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT FK_details_userId FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

alter table order_details
add column cancelled boolean default false after review_status;

select * from users;
SELECT * FROM orders;
SELECT * from order_details;
SELECT * FROM products;
select * from used_coupons;
SELECT * FROM order_details WHERE order_id IS NULL;

select * from orders
inner join order_details
on orders.id = order_details.order_id
inner join products
on products.id = order_details.product_id
WHERE orders.id = 10 ;

SELECT 
    SUM(quantity) AS quantity_sold,
    order_details.order_id,
    product_id,
    products.photo,
    products.name,
    products.description
FROM
    order_details
        INNER JOIN
    products ON order_details.product_id = products.id
GROUP BY product_id
HAVING order_details.order_id IS NOT NULL
ORDER BY quantity_sold DESC;
                
	SELECT SUM(quantity) as bookSold
    FROM order_details
    WHERE
        created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y/%m/01')
            AND created_at < DATE_FORMAT(CURRENT_DATE(), '%Y/%m/31')
            AND order_id IS NOT NULL;

alter table order_details
ADD COLUMN review_status boolean default false AFTER sub_total;

SELECT products.name, products.photo, products.price FROM order_details 
    INNER JOIN products
    ON products.id = order_details.product_id
    WHERE user_id = 2 AND order_id = 10;

select sum(sub_total) as totalOrder from order_details WHERE user_id = 2 AND order_id is null;
SELECT quantity FROM order_details WHERE user_id = 3 AND product_id = 8;

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

select * from product_categories;

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

SELECT 
    name,
    case
		WHEN wishlist.user_id = 2 AND wishlist.product_id = 12 THEN 'Wishlisted'
        Else 'unwished'
        END AS 'Wishlist'
FROM
    products,wishlist,users
GROUP BY name
ORDER BY products.created_at DESC
LIMIT 5;

select * from products;
select * from product_categories;

select products.name,categories.category,genres.genre from product_categories
inner join products
	ON product_categories.product_id = products.id
inner join categories
	on product_categories.category_id = categories.id
inner join genres
	on 	product_categories.genre_id = genres.id;


CREATE TABLE admin_notifications(
id INT auto_increment primary key,
user_id INT NOT NULL,
notification VARCHAR(400) not null,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP default now() on update now(),
constraint FK_notifications_userID
foreign key (user_id) references users(id)
ON DELETE CASCADE ON UPDATE CASCADE
);

select * from admin_notifications;

CREATE TABLE user_notifications(
id INT auto_increment primary key,
user_id INT NOT NULL,
notification VARCHAR(400) not null,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP default now() on update now(),
constraint FK_userNotifications_userID
foreign key (user_id) references users(id)
ON DELETE CASCADE ON UPDATE CASCADE
);

select * from user_notifications;

-- delivery_price(id, region, price)

-- delivery(id, order_id,region, address)

-- TESTING

select * from users;
SELECT * FROM orders;
SELECT * from order_details;
SELECT * FROM products;
select * from coupons;
select * from used_coupons;
select * from product_reviews;
select * from admin_notifications;

SELECT SUM(total) as totalOrders
    FROM orders
    WHERE
        created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y/%m/01 00:00:00')
            AND created_at <= DATE_FORMAT(CURRENT_DATE(), '%Y/%m/31 23:59:59')
            AND canceled = 0;
            
            select DATE_FORMAT(CURRENT_DATE(), '%Y/%m/01 23:59:59');
            select DATE_FORMAT(CURRENT_DATE(), '%Y/%m/31 23:59:59');

