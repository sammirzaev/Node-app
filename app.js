const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbURL} = require('./config/database');
const passport = require('passport');
const LocalStrategy = require('passport-local');

mongoose.Poromise = global.Promise;
mongoose.connect(mongoDbURL).then(db=>{
    console.log('Connected');
}).catch(error=>console.log(error));
// mongoose.connection
//  .once('open', ()=>console.log('Connected'))
//  .on('error', (err)=>{console.log('Could not connected')});

app.use(express.static(path.join(__dirname, 'public')));

//set view engine
const {select, generateTime, paginate} = require('./helpers/handlebars-helpers');
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {
    select: select, 
    generateTime: generateTime, 
    paginate: paginate
  }}));
app.set('view engine', 'handlebars');

//Upload Middleware
app.use(upload());

// Body Parser Load
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//Method Override
app.use(methodOverride('_method'));

//use middleware flash and session 
app.use(session({
    secret: 'samilovecoding',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Local Variables using middlewares
app.use((req,res,next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash('error');
    next();
});

//load routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');
const about = require('./routes/admin/about');


//use routes

app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);
app.use('/admin/about', about);


app.listen(4500, ()=>{
    console.log(`listening on port 4500`);
});