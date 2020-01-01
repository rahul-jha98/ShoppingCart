const User   = require('../models/user'),
      bcrypt = require('bcryptjs'),
      crypto = require('crypto');

// For sending mails to client on registrations
const nodemailer        = require('nodemailer'),
      sendgridTransport = require('nodemailer-sendgrid-transport'),
      API_KEY =
      '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',
      transporter       = nodemailer.createTransport(sendgridTransport({
          auth: {
              api_key:
              API_KEY,
          },
      }));

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
        path: '/signup',
        pageTitle: 'Sign Up',
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
                    transporter.sendMail({
                        to: email,
                        from: 'shop-cart@rahul.com',
                        subject: 'Signup Succeeded!',
                        html: '<h1>Your have signed up!</h1>',
                    });
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

exports.getReset = (req, res) => {
    const error = req.flash('error');
    res.render('auth/reset', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: error.length > 0 ?
            error[0] : null,
    });
};

exports.postReset = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then((user) => {
                if (!user) {
                    req.flash('error', 'No account with the email id exists');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration =
                    Date.now() + 3600000;


                user.save()
                    .then((result) => {
                        res.redirect('/');
                        transporter.sendMail({
                            to: req.body.email,
                            from: 'shop-cart@rahul.com',
                            subject: 'Password Reset Link',
                            html: `
                                <p>You requested a password reset.</p>
                                <p>Click this <a href="http://localhost:3000/reset/${token}"> link </a>
                                to set a new password.</p>
                            `,
                        });
                    })
                    .catch( (err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {

            });
    });
};

exports.getNewPassword = (req, res) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then((user) => {
            if (!user) {
                req.flash('error', 'Expiration link expired');
                return res.redirect('/reset');
            }
            const error = req.flash('error');
            res.render('auth/new-password', {
                path: '/login',
                pageTitle: 'Password',
                errorMessage: error.length > 0 ?
                    error[0] : null,
                passwordToken: token,
                userId: user._id.toString(),
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postNewPassword = (req, res) => {
    const userId        = req.body.userId,
          newPassword   = req.body.password;
    let resetUser;
    User.findOne({
        _id: userId})
        .then((user) => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() =>{
            res.redirect('/login');
        })
        .catch((err) => {
            console.log(err);
        });
}