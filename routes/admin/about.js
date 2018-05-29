const express = require('express');
const router = express.Router();
const About = require('../../models/About');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
 });

router.get('/', (req, res)=>{
  res.render('admin/about');
     
});


module.exports = router;