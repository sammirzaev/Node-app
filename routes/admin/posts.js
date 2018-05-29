const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helpers');
const fs = require('fs');
const path = require('path');
const {userAuthenticated} = require('../../helpers/authentication');
const Comment = require('../../models/Comment');


router.all('/*', userAuthenticated, (req, res, next)=>{
   req.app.locals.layout = 'admin';
   next();
});

 router.get('/', (req, res)=>{
    const perPage = 10;
    const page = req.query.page || 1;
    Post.count().then(commentCount=>{
        Post.find({})
        .skip((perPage*page) - perPage)
        .limit(perPage)
        .populate('category')
        .then(posts=>{
            res.render('admin/posts', {
                Post: posts,
                current: parseInt(page),
                pages: Math.ceil(commentCount / perPage)
            });
        });
    });   
 });

 router.get('/my-posts', (req, res)=>{
    const perPage = 10;
    const page = req.query.page || 1;
    Post.count({user:req.user.id}).then(commentCount=>{
        Post.find({user:req.user.id})
        .skip((perPage*page) - perPage)
        .limit(perPage)
        .populate('category')
        .then(posts=>{
            res.render('admin/posts/my-posts', {
                Post: posts,
                current: parseInt(page),
                pages: Math.ceil(commentCount / perPage)
            });
        });
    });   
 });

 router.get('/create', (req, res)=>{
     Category.find({}).then(categories=>{
        res.render('admin/posts/create', {categories: categories});
     });
     
 });

 // create post

 router.post('/create', (req, res)=>{
     let errors = [];
     if(!req.body.title){
           errors.push({message: 'please add a title'});
     }
     if(!req.body.body){
        errors.push({message: 'please add a description'});
  }
     if(errors.length > 0){
         res.render('admin/posts/create', {
             errors: errors
         });
     }else{
                let filename = 'noimage.jpg';
                if(!isEmpty(req.files)){
                let file = req.files.file;  //file of filename
                filename = Date.now() + '-' + file.name;
                let dirUploads = './public/uploads/';
                file.mv(dirUploads + filename, (err)=>{
                    if(err) throw err;
                });
            
                }
                
                let allowComments = true;
                if(req.body.allowComments){
                    allowComments = true;
                }else{
                    allowComments = false;
                }
            const newPost = new Post({
                user:          req.user.id,
                title:         req.body.title,
                status:        req.body.status,
                allowComments: allowComments,
                body:          req.body.body,
                category:      req.body.category,
                file:          filename
                
            });
            newPost.save().then(savedPost=>{
                req.flash('success_message', `Post ${savedPost.title} was cretaed successfully` );
                res.redirect('/admin/posts/my-posts');
            }).catch(validator=>{
                res.render('admin/posts/create', {errors: validator.errors});
                //console.log(error.errors, 'could not saved');
            });
     }
     
    
 });

//edit or update post =>
 router.get('/edit/:id', (req, res)=>{
     Post.findOne({_id:req.params.id}).then(post=>{
         Category.find({}).then(categories=>{
         res.render('admin/posts/edit', {post: post, categories: categories});
        });
     });   
 });
// => update post by PUT method with Method Overrride
 router.put('/edit/:id', (req, res)=>{
     
    Post.findOne({_id:req.params.id}).then(post=>{
        
        let allowComments = true;
        if(req.body.allowComments){
            allowComments = true;
        }else{
            allowComments = false;
        }
        post.user          = req.user.id;
        post.title         = req.body.title;
        post.status        = req.body.status;
        post.allowComments = allowComments;
        post.category      = req.body.category;
        post.body          = req.body.body;
                if(!isEmpty(req.files)){
                let file = req.files.file;  //file of filename
                filename = Date.now() + '-' + file.name;
                post.file = filename;
                let dirUploads = './public/uploads/';
                file.mv(dirUploads + filename, (err)=>{
                    if(err) throw err;
                });
            
                }
        post.save().then(updatedPost=>{
             req.flash('success_message', `Post was updated successfully`);
             res.redirect('/admin/posts/my-posts');
        }).catch(error=>{
              console.log(error, 'could not save');
        });       
    });
 });

 router.delete('/:id', (req, res) => {
    Post.findOne({_id:req.params.id}).then(post=>{
            
            fs.unlink(uploadDir + post.file, (err)=>{
            post.remove();
            req.flash('success_message', `Post was deleted successfully`);
            res.redirect('/admin/posts/my-posts');
        });
         
    });
 });
module.exports = router;