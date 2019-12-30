const User = require('../models/user');

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn,
    });
};

exports.postLogin = (req, res) => {
    User.findById('5e07132c13fcc66e6d14aedb')
        .then((user) => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect('/');
        })
        .catch((err) => console.log(err));
};

exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (!err) {
            res.redirect('/');
        } else {
            console.log(err);
        }
    });
};
