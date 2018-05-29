const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    Category.find({user: req.user.id})
    .then(categories=>{
        res.render('admin/categories',{categories: categories});
    });
});

router.post('/create', (req, res)=>{
    const newCategory = Category({
        user: req.user.id,
        name: req.body.name
    });
    newCategory.save().then(savedCategory=>{
        res.redirect('/admin/categories');
    });
    
 });

router.get('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
            res.render('admin/categories/edit', {category: category});
        });

});

router.put('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
        category.user = req.user.id;
        category.name = req.body.name;
        category.save().then(updatedCategory=>{
            res.redirect('/admin/categories');
        });
    });
});

router.delete('/:id', (req, res)=>{
    Category.findOneAndRemove({_id:req.params.id}).then(category=>{
        res.redirect('/admin/categories');
    }).catch(error=>{
        console.log(error);
    });
});

module.exports = router;