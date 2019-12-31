const path          = require('path'),
      express       = require('express'),
      bodyParser    = require('body-parser'),
      mongoose      = require('mongoose'),
      session       = require('express-session'),
      csrf          = require('csurf'),
      flash         = require('connect-flash'),
      MongoDBStore  = require('connect-mongodb-session')(session),
      app           = express();


const errorController = require('./controllers/error'),
      User            = require('./models/user'),
      MONGODB_URI     = 'mongodb://localhost/shop';

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'});


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'this is a long string',
    resave: false,
    saveUninitialized: false,
    store: store}));
app.use(csrf());
app.use(flash());

const adminRoutes = require('./routes/admin'),
      shopRoutes  = require('./routes/shop'),
      authRoutes  = require('./routes/auth');

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(
        MONGODB_URI,
    )
    .then((result) => {
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
