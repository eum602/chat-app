const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({//when used first time it created a collection eith lowercase and
    //in plural => "tasks"
    //setting up all those fields as properties of this object
    username:{
        type:String,
        required:true, //customizing the user
        trim:true //removing leading and trailing spaces; see docs l-85
    },
    // room:{
    //     type: mongoose.Schema.Types.ObjectId, //object is an object id
    //     required: true,
    //     ref: 'Room'
    // }
    room:{
        type:String,
        required:true, //customizing the user
        trim:true //removing leading and trailing spaces; see docs l-85
    },
    userId:{
        type:String,
        required:true,
        trim:true
    }
},{
    timestamps:true}) //timestamp:true => one of the many possible options we can have.
    //by default timestamp is set to false

const User = mongoose.model('User',userSchema)
module.exports = User
