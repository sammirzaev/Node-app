const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CategorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
},
    name:{
      type:String,
      require: true
    }
   
});

module.exports = mongoose.model('categories', CategorySchema);