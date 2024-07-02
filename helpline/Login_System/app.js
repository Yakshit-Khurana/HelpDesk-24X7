const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Database connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yakshit',
    database: 'registerationdb'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database');
});

app.get('/', (req, res) => {
    res.render('login', { error: null });
});

app.post('/register', (req, res) => {
    // ... (same registration code)
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return;
        }

        if (results.length === 0 || results[0].password !== password) {
            res.render('login', { error: 'Invalid email or password' });
            return;
        }

        req.session.userId = results[0].id;
        res.redirect('/dashboard'); // Redirect to a user dashboard page
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    // Fetch user data from the database and render the dashboard
    db.query('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return;
        }

        const user = results[0];
        res.render('dashboard', { user });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Session destruction error:', err);
            return;
        }
        res.redirect('/');
    });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
