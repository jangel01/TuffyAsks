DROP DATABASE IF EXISTS tuffyasks;
CREATE DATABASE tuffyasks;

USE tuffyasks;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(50) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
	id INT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(8) NOT NULL,
    course_title VARCHAR(50) NOT NULL,
    course_desc TEXT NOT NULL
);

select * from users;
select * from courses;