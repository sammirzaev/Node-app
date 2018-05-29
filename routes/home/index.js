const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res)=>{
   const perPage = 10;
   const page = req.query.page || 1;
   Post.find({})
   .skip((perPage*page) - perPage)
   .limit(perPage)
   .then(posts=>{
       Post.count().then(postCount=>{
        Category.find({}).then(categories=>{
            res.render('home/index', {
                posts: posts, 
                categories: categories,
                current: parseInt(page),
                pages: Math.ceil(postCount / perPage)
                  });
              });
       });
    
   });
   
});

router.get('/about', (req, res)=>{
   res.render('home/about');
});

router.get('/login', (req, res)=>{
    res.render('home/login');
 });

 //APP LOGIN 

 passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
     
     User.findOne({email: email}).then(user=>{
         if(!user){
              return done(null, false, {message: 'No user found'});
         }
         bcrypt.compare(password, user.password, (err, matched)=>{
             if(err) return err;
             if(matched){
                 return done(null, user);
             }else{
                 return done(null, false, {message: 'Incorrect Password'})
             }
         });
     });
 }));

 passport.serializeUser(function(user, done){
     done(null, user.id);
 });

 passport.deserializeUser(function(id, done){
   User.findById(id, (err, user)=>{
      done(err, user);
   });
 });

 router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect:'/login',
        failureFlash: true
    })(req, res, next);
 });

 // App logout

 router.get('/logout', (req,res)=>{
     req.logOut();
      res.redirect('/login');
 });

 router.get('/register', (req, res)=>{
    res.render('home/register');
 });

 router.post('/register', (req, res)=>{
    let errors = [];
    const newUser = new User({
       firstName: req.body.firstName,
       lastName:  req.body.lastName,
       email:     req.body.email,
       password:  req.body.password
    });

    if(!req.body.firstName){
          errors.push({message: 'please enter first name'});
    }
    if(!req.body.lastName){
       errors.push({message: 'please enater last name'});
    }
    if(!req.body.email){
        errors.push({message: 'please enter email'});
    }
    if(!req.body.password){
        errors.push({message: 'please enter password'});
    }
    if(!req.body.passwordConfirm){
        errors.push({message: 'This field can not be blank'});
    }
    if(req.body.password !== req.body.passwordConfirm){
        errors.push({message: 'Passowrd fields do not match'});
    }
    if(errors.length > 0){
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    }else{
        User.findOne({email: req.body.email}).then(user=>{
               if(!user){
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName:  req.body.lastName,
                    email:     req.body.email,
                    password:  req.body.password
                 });
        
                 bcrypt.genSalt(10, (err, salt)=>{
                     bcrypt.hash(newUser.password, salt, (err, hash)=>{
                         newUser.password = hash;
        
                         newUser.save().then(savedUser=>{
                           req.flash('success_message', 'You are now registred, Please Login');
                           res.redirect('/login');
                        });
                     });
                 });
               }else{
                   req.flash('error_message', 'This email already exist, please login');
                   res.redirect('/login');
               }
        });
    
    }
 });

 router.get('/blog-post/:slug', (req, res)=>{
    Post.findOne({slug:req.params.slug})
    .populate({path: 'comments', match:{approveComment: true}, populate: {path: 'user', model: 'users'}})
    .populate('user')
    .then(post=>{
        Category.find({}).then(categories=>{
        res.render('home/blog-post', {post: post, categories: categories});
     });
    });   
 });

 module.exports = router;
