const staticUsers = {
    admin: { username: 'admin', password: 'admin', role: 'admin' },
    customer: { username: 'customer', password: 'customer', role: 'customer' }
};

const login = (req, res) => {
    const { username, password } = req.body;
    const user = staticUsers[username];

    if (user && user.password === password) {
        req.session.user = user;
        return res.redirect('/');
    } else {
        return res.status(401).send('Authentication failed');
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
};
// Middleware to check if user is logged in
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};
// Middleware to check admin access
const checkAdmin = (req, res, next) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    next();
};
// Middleware to check customer access
const checkCustomer = (req, res, next) => {
    if (req.session.user.role !== 'customer') {
        return res.status(403).send('Access denied');
    }
    next();
};


module.exports = { login, logout, checkAdmin, checkCustomer, checkAuth };