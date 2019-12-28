const path        = require('path'),
      express     = require('express'),
      bodyParser  = require('body-parser'),
      mongoose    = require('mongoose'),
      errorController = require('./controllers/error'),
      User            = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


const adminRoutes = require('./routes/admin'),
      shopRoutes = require('./routes/shop');

app.use((req, res, next) => {
    User.findById('5e07132c13fcc66e6d14aedb')
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
    .connect(
        'mongodb://localhost/shop',
    )
    .then((result) => {
        User.findOne().then((user) => {
            if (!user) {
                const user = new User({
                    name: 'Max',
                    email: 'max@test.com',
                    cart: {
                        items: [],
                    },
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
