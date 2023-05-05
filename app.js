const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');

const app = express();
app.set("view engine", "ejs");
const port = 3000;

// Initialzie database in your mysql server first (use the tuffyasks.sql dump file)
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // YOUR PASSWORD HERE
    database: 'tuffyasks'
})

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ', err);
    } else {
        console.log('Connected to database!');
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
const emailRegex = /^[a-zA-Z0-9._-]{3,}@((csu\.)?fullerton\.edu)$/;

app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false
}));

function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated, so we proceed to the next middleware or route handler function
        next();
    } else {
        // User is not authenticated, so we redirect them to the login page
        res.redirect('login');
    }
}

function redirectLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        // User is already logged in, so we redirect them to home page
        res.redirect('/');
    } else {
        // User is not logged in, so we proceed to the next middleware or route handler function
        next();
    }
}


app.get('/register', redirectLoggedIn, (req, res) => {
    const errorMessage = req.query.error;
    res.render('register', { errorMessage });
});


app.get('/login', redirectLoggedIn, (req, res) => {
    const errorMessage = req.query.error;
    res.render('login', { errorMessage });
});

app.get('/add-a-course', requireLogin, (req, res) => {
    const errorMessage = req.query.error;
    res.render('add-a-course', { errorMessage });
})


app.get(['/', '/index'], requireLogin, (req, res) => {
    const name = req.session.user.username
    const errorMessage = req.query.error;
    res.render('index', { errorMessage, name });
});

// end session
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        console.log("Logout successful");
        res.redirect('login');
    });
});

// searching for a course
app.post(['/', '/index'], requireLogin, (req, res) => {
    const { search_course } = req.body;
    // Replace space with dash
    const search_course_dash = search_course.trim().replace(/\s+/g, '-');

    const query = `SELECT * FROM courses WHERE course_id = ?`;
    conn.query(query, [search_course_dash], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Internal server error');
        } else if (results.length === 0) {
            let errorMessage = 'The specificed course does not exist. Try adding it.';
            res.redirect(`index?error=${encodeURIComponent(errorMessage)}`);
        } else {
            res.redirect(`courses/${search_course_dash}`);
        }
    });

});

// login submit
app.post('/login', redirectLoggedIn, (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Internal server error');
        } else if (results.length === 0) {
            let errorMessage = 'No matching user found with specificed credentials';
            res.redirect(`login?error=${encodeURIComponent(errorMessage)}`);
        } else {
            const user = results[0];
            console.log('Matching user found:', user);

            // Initialize session with user data
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                password: user.password
            };
            res.redirect('/');
        }
    });

});

// register submit
app.post('/register', redirectLoggedIn, (req, res) => {
    const { email, username, password } = req.body;

    // validate form data
    if (email.match(emailRegex) && username && password) {
        // insert form data into the SQL database
        const query = 'INSERT INTO users (email, username, password) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM users WHERE email = ? OR username = ?)';
        conn.query(query, [email, username, password, email, username], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal server error');
            } else if (results.affectedRows === 0) {
                // If no rows were affected, it means the email or username already exists in the database
                let errorMessage = 'Email or username already exists';
                res.redirect(`register?error=${encodeURIComponent(errorMessage)}`);
            } else {
                res.redirect('login');
            }
        });
    } else {
        res.status(400).send('Invalid form data');
    }
});

// add a course submit
app.post('/add-a-course', requireLogin, (req, res) => {
    const { course_id, course_title, course_desc } = req.body;
    // Replace space with dash
    const course_id_dash = course_id.trim().replace(/\s+/g, '-');

    // Try to insert the new course into the database
    const query = 'INSERT INTO courses (course_id, course_title, course_desc) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM courses WHERE course_id = ?)';
    conn.query(query, [course_id_dash, course_title, course_desc, course_id_dash], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else if (results.affectedRows === 0) {
            // If no rows were affected, it means the course already exists in the database
            let errorMessage = 'Sorry. That course already exists.';
            res.redirect(`add-a-course?error=${encodeURIComponent(errorMessage)}`);
        } else {
            res.redirect(`courses/${course_id_dash}`)
        }
    });
});


// course page
app.get('/courses/:course_id', requireLogin, (req, res) => {
    const courseId = req.params.course_id;
    const courseId_no_dash = courseId.trim().replace(/-/g, ' ');

    // Look up the course in the database by its course_id
    const query = 'SELECT * FROM courses WHERE course_id = ?';
    conn.query(query, courseId, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else if (result.length === 0) {
            res.status(404);
            res.redirect('404-error');
        } else {
            // Look up posts for the course
            const query = 'SELECT * FROM posts WHERE course_id = ?';

            conn.query(query, courseId, (err, result2) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                } else {
                    // Truncate post content longer than 200 characters
                    const truncatedPosts = result2.map(post => {
                        if (post.post_content.length > 200) {
                            return { ...post, post_content: post.post_content.substring(0, 200) + '...' };
                        } else {
                            return post;
                        }
                    });

                    // Render the course page template with the course data
                    res.render('course', {
                        course: result[0],
                        posts: truncatedPosts,
                        course_id_no_dash: courseId_no_dash
                    });
                }
            });
        }
    });
});

// create new post page for course page
app.post('/courses/:course_id', requireLogin, (req, res) => {
    const courseId = req.params.course_id;
    const courseId_no_dash = courseId.trim().replace(/-/g, ' ');
    const op = req.session.user.username;
    const { post_title, post_content } = req.body;

    // Try to insert the new post into the database
    const query = 'INSERT INTO posts (op, course_id, post_title, post_content) VALUES (?, ?, ?, ?)';
    conn.query(query, [op, courseId, post_title, post_content], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            const query = 'SELECT LAST_INSERT_ID() as postId';

            conn.query(query, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                } else {
                    const postId = result[0].postId;
                    const redirectUrl = `/courses/${courseId}/posts/${postId}`;
                    res.redirect(redirectUrl);
                }
            });
        }
    });
});

// create new reply for post page
app.post('/courses/:course_id/posts/:post_id', requireLogin, (req, res) => {
    const courseId = req.params.course_id;
    const courseId_no_dash = courseId.trim().replace(/-/g, ' ');
    const postId = req.params.post_id;
    const op = req.session.user.username;
    const { reply_content } = req.body;

    // Try to insert the new reply into the database
    const query = 'INSERT INTO replies (op, reply_content, id) VALUES (?, ?, ?)';
    conn.query(query, [op, reply_content, postId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            res.redirect(req.originalUrl);
        }
    });
});


// redirect post to its corresponding page
app.get('/courses/:course_id/posts/:post_id', requireLogin, (req, res) => {
    const courseId = req.params.course_id;
    const courseId_no_dash = courseId.trim().replace(/-/g, ' ');
    const postId = req.params.post_id;

    // Look up the post in the database by its post_id, and join it with course table
    const query = 'SELECT * FROM posts JOIN courses ON posts.course_id = courses.course_id WHERE posts.id = ? AND courses.course_id = ?';
    conn.query(query, [postId, courseId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else if (result.length === 0) {
            res.status(404);
            res.redirect('404-error');
        } else {

            // retrieve replies for the post
            const query = 'SELECT * FROM replies WHERE id = ?';
            conn.query(query, postId, (err, result2) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal server error');
                } else {
                    // Render the post page template with the post data
                    res.render('post', {
                        post_page: result[0],
                        replies: result2,
                        course_id_no_dash: courseId_no_dash
                    });
                }
            });
        }
    });
});


app.use((req, res) => {
    res.status(404);

    res.render('404-error');
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
