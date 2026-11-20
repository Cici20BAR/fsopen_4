const mongoose = require('mongoose')

const usrSchema = new mongoose.Schema({
  name: {type:String,required:true},
  username: String,
  passwordHash: String ,
  blogs:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    }
  ]
  
})

usrSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash;
  }
})

module.exports = mongoose.model('User', usrSchema)