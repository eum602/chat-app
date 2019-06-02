const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        unique:true
    },
    users:[{
        type: mongoose.Schema.Types.ObjectId, //object is an object id
        required: true,
        ref: 'User' //using a reference so we do not save all the object but only a reference to the object which is stored in other 
        //collection
    }]
},{timestamps:true})

// roomSchema.virtual('users',{
//     ref: 'User',
//     localField: 'users',
//     foreignField: '_id'
// })

const Room = mongoose.model('Room',roomSchema)
module.exports = Room