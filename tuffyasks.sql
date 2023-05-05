DROP DATABASE IF EXISTS tuffyasks;
CREATE DATABASE tuffyasks;

USE tuffyasks;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(50) NOT NULL,
  username VARCHAR(40) NOT NULL,
  password VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
	id INT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(8) NOT NULL,
    course_title VARCHAR(40) NOT NULL,
    course_desc TEXT NOT NULL,
    index (course_id)
);

drop table if exists posts;
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    op VARCHAR(50) NOT NULL,
    post_title VARCHAR(40) NOT NULL,
    post_content TEXT NOT NULL,
    course_id VARCHAR(8) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE replies (
	reply_id INT auto_increment primary key,
    op VARCHAR(50) NOT NULL,
    reply_content TEXT NOT NULL,
    id INT NOT NULL,
    FOREIGN KEY (id) REFERENCES posts(id)
);