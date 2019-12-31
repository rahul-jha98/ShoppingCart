const User   = require('../models/user'),
      bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    const error = req.flash('error');
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: error.length > 0 ?
            error[0] : null,
    });
};

exports.getSignup = (req, res) => {
    const error = req.flash('error');
    res.render('auth/signup', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: error.length > 0 ?
            error[0] : null,
    });
};

exports.postLogin = (req, res) => {
    const email    = req.body.email,
          password = req.body.password;

    User.findOne({email: email})
        .then((user) => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save( (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.redirect('/');
                            }
                        });
                    }
                    req.flash('error', 'Invalid email or password');
                    return res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch((err) => console.log(err));
};

exports.postSignup = (req, res) => {
    const email           = req.body.email,
          password        = req.body.password;

    User.findOne({email: email})
        .then( (userDoc) => {
            if (userDoc) {
                req.flash('error', 'E-mail already registered');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then((hashedPassword) => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: {items: []},
                    });
                    return user.save();
                })
                .then((result) => {
                    res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
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
