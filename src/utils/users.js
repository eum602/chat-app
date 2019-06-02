//const users = []

const User = require('../models/user')
const Room = require('../models/room')

const addUser = async({ _id,username, room }) => {//room => room_id
    // Clean the data
    username = username.trim().toLowerCase()    
    //room = room.trim().toLowerCase()    

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    // const existingUser = users.find((user) => {
    //     return user.room === room && user.username === username
    // })
    const existingUser = await User.findOne({_id,username,room})

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!',
        }
    }
    // Store user
    // const user = { id, username, room }
    // users.push(user)
    // return { user }    
    const user = {_id,username,room}
    await new User(user).save()    
    return user
}

const removeUser = async (id) => {
    console.log(id)
    //const index = users.findIndex((user) => user.id === id)
    const user = await getUser(id)
    await user.remove()
    return user

    // if (index !== -1) {
    //     return users.splice(index, 1)[0]
    // }
}

const getUser = async (id) => {
    //return users.find((user) => user.id === id)
    const user = await User.findById(id)    
    return user
}

const getUsersInRoom = async (roomName) => {
    // room = room.trim().toLowerCase()
    // return users.filter((user) => user.room === room)
    const room = await Room.findOne({name:roomName}).populate('users') //gets all the information by pulling from the Users schema
    return room.users
}

// const _id = new mongoose.Types.ObjectId
// const username = "Erick"
// const room = null//"123"
// const userToSave = {_id,username,room}
// const user = async()=>{
//     const saved = await addUser(userToSave)
//     console.log(saved)
// }
// user()

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}