const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
 });

router.get('/', (req, res)=>{
  const perPage = 10;
  const page = req.query.page || 1;
      Comment.count().then(commentsCount=>{
        Comment.find({user: req.user.id})
        .skip((perPage*page) - perPage)
        .limit(perPage)
        .populate('user')
        .then(comments=>{
          res.render('admin/comments', {
              comments: comments,
              current: parseInt(page),
              pages: Math.ceil(commentsCount / perPage)    
            });
        });
      });
   
  });
  
    


//Delete comments 
router.delete('/:id', (req, res)=>{
    Comment.findByIdAndRemove({_id:req.params.id}).then(category=>{
        Post.findOneAndUpdate({comments: req.params.id}, {$pull:{comments: req.params.id}}, (err, data)=>{
            if(err) console.log(err);
            res.redirect('/admin/comments');
        });
        
    });
  });

router.post('/', (req, res)=>{
    Post.findOne({_id:req.body.id}).then(post=>{
      const newComment = new Comment({
          user: req.user.id,
          body: req.body.body
      });
      post.comments.push(newComment);
      post.save().then(savedPost=>{
           newComment.save().then(savedComment=>{
                req.flash('success_message', `Your Comment will be review in a second, Thank you!` );
                res.redirect(`/blog-post/${post.slug}`);
           });
       });
    });

});

router.post('/approve-comment', (req, res)=>{
    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{
        if(err) return err;
        res.send(result);
    });
});



module.exports = router;