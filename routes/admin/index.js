const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Category = require('../../models/Category');
const User = require('../../models/User');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
  const promises = [
      Post.count().exec(),
      Category.count().exec(),
      Comment.count().exec(),
      User.count().exec(),
      Post.count({user:req.user.id}).exec(),      
      Comment.count({user:req.user.id}).exec(),
      Category.count({user:req.user.id}).exec()
  ];
  Promise.all(promises).then(([postCount, categoryCount, commentCount, userCount, mypostCount, mycommentCount, mycategoryCount])=>{
    res.render('admin/index', {
                                         postCount: postCount, 
                                         commentCount: commentCount, 
                                         categoryCount: categoryCount, 
                                         userCount: userCount, 
                                         mypostCount: mypostCount, 
                                         mycommentCount: mycommentCount, 
                                         mycategoryCount: mycategoryCount
                                      });
  });
});
//  router.get('/', (req, res)=>{
//     Post.count({}).then(postCount=>{
//         Comment.count({}).then(commentCount=>{
//             Category.count({}).then(categoryCount=>{
//                 User.count({}).then(userCount=>{
//                  Post.count({user:req.user.id}).then(mypostCount=>{
//                      Comment.count({user:req.user.id}).then(mycommentCount=>{
//                          Category.count({user:req.user.id}).then(mycategoryCount=>{
//                              res.render('admin/index', {
//                                  postCount: postCount, 
//                                  commentCount: commentCount, 
//                                  categoryCount: categoryCount, 
//                                  userCount: userCount, 
//                                  mypostCount: mypostCount, 
//                                  mycommentCount: mycommentCount, 
//                                  mycategoryCount: mycategoryCount
//                               });
//                          });   
//                       });
//                    });
//                 });
//             }); 
//         });
//     });
    
//  });

router.post('/generate-fake-posts', (req, res)=>{
    for(let i=0; i < req.body.amount; i++){
         let post = new Post();
         post.title = faker.name.title();
         post.status = 'public';
         post.allowComments = faker.random.boolean();
         post.body = faker.lorem.sentences();
         post.slug = faker.name.title();
         post.save(function(err){
             if(err) throw err;
         });     
    }
    res.redirect('/admin');
});

module.exports = router;