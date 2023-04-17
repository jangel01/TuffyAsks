const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
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
        // User is authenticated, so we can proceed
        next();
    } else {
        // User is not authenticated, so we redirect them to the login page
        res.redirect('login');
    }
}

function redirectLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        // User is already logged in, so we redirect them to a different page
        res.redirect('h');
    } else {
        // User is not logged in, so we proceed to the next middleware or route handler function
        next();
    }
}

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Eerror destroying session:', err);
        }
        console.log("Logout successful")
        res.redirect('/login');
    });
});


app.get('/register', redirectLoggedIn, (req, res) => {
    res.render('register');
});

app.get('/h', requireLogin, (req, res) => {
    const name = req.session.user.username
    res.render('h', { name });
});

app.get('/login', redirectLoggedIn, (req, res) => {
    res.render('login');
});

app.post('/login', redirectLoggedIn, (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Internal server error');
        } else if (results.length === 0) {
            res.render('login', { errorMessage: 'No matching user found with specificed credentials' });
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
            res.redirect('h')
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
                res.render('register', { errorMessage: 'Email or username already exists' });
            } else {
                //res.send('Registration successful!');
                res.redirect('login');
            }
        });
    } else {
        res.status(400).send('Invalid form data');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
