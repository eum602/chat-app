const mongoose = require('mongoose')
const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()
const userThreeId = new mongoose.Types.ObjectId()
const roomOneId = new mongoose.Types.ObjectId()
const roomOneName = "FirstRoom"
const User = require('../../src/models/user')
const Room = require('../../src/models/room')
require('../../src/db/mongoose') //super important in order to create the test database

const userOne = {
    _id : userOneId,
    username: 'arturo', 
    room: roomOneId
}

const userTwo = {
    _id : userTwoId,
    username: 'erick',
    room: roomOneId
}

const userThree = {
    _id : userThreeId,
    username: 'David',
    room: null
}


const roomOne = {
    _id: new mongoose.Types.ObjectId(),
    name: roomOneName,
    users: [userOneId, userTwoId] //userOneId is identical the same than userOne._id
}

const setupDatabase = async () => {
    await User.deleteMany() //emptying database
    await Room.deleteMany()
    await new User(userOne).save() //creating a new user    
    await new Room(roomOne).save()
}

module.exports = {
    userOne,
    userTwo,
    userOneId,
    userThree,
    roomOne,
    roomOneName,
    setupDatabase
}

