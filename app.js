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

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        console.log("Logout successful");
        res.redirect('login');
    });
});

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
            // Render the course page template with the course data
            const courseData = result[0];
            const url = `/${courseData.course_id}`;
            res.render('course', {
                course_id: courseId_no_dash,
                course_title: courseData.course_title,
                course_desc: courseData.course_desc,
                url
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
