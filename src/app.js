const express = require('express')
require('./db/mongoose')
const hbs = require('hbs')
const path = require('path') //core module
const http = require('http') //core module
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUsersInRoom ,getUser} = require('./utils/users')
//routers
const socketRouter = require('./routers/socketRouter')

//setup server
const app = express()
const server = http.createServer(app) //creting a server using code http module instead of using express; in order to
//use it with sockets, by the way it works with or without sockets

//socket library to work with our custom server
const io = socketio(server) //server is required as a raw http server; wich is not possible with express directly, so we use http core 
//module

//defines paths for Exoress config
const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath =  path.join(__dirname,'../templates/partials')

//setup handle bars engine and  views location
app.set('view engine','hbs') //setting the view engine as hbs, now we can create some dynamic content.
app.set('views',viewsPath)
hbs.registerPartials(partialsPath)

//setup static directory to serve
app.use(express.static(publicDirectoryPath)) //to customize our server
//static means items do not change, so if I refresh the page it will be showing the same.

app.use(express.json()) //parsing automatic incoming json to an object, so we can easily process objects

app.use(socketRouter)

io.on('connection',socket=>{
    console.log('new websocket connection')

    //socket.on('join',async({username,room},callback)=>{
    socket.on('join',async(options,callback)=>{
        //const {error , user} = await addUser({id:socket.id,username, room})
        const {error , user} = await addUser({id:socket.id,...options}) //spread operator "..."
        if(error){
            return callback(error) //return in order to none of the cod bellow runs
        }

        //joining a new user to a specific room        
        socket.join(user.room)
        //Lets recap
        //socket.emit=> send message to a specific client
        //io.emit => sends an event to all clients including the sender.
        //socket.broadcast.emit => sends an event to every connected client except the sender
        //io.to.emit => similar to io but in one room
        //socket.broadcast.emit => analogous to soclket.broadcast but in one room

        socket.emit('message',generateMessage('Admin',`Welcome ${user.username}!`)) //emitting event only to the new user

        //telling other in the room that a new user has joined
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        const users = await getUsersInRoom(user.room)
        io.to(user.room).emit('roomData',{//emitting data to a whole room
            room: user.room,
            users: users
        })

        callback() //meaning sending no errors to the clien
    })
    

    socket.on('sendMessage',async(message,callback) => {
        try{
            const filter = new Filter()
            if(filter.isProfane(message)){
                return callback('Profanity is not allowed')
            }
            
            const user = await getUser(socket.id) //getting user by its socket.id
            if(user){
                io.to(user.room).emit('message',generateMessage(user.username,message))            
            }

            callback()
        }catch(e){
            callback(e)
        }
        
    })

    socket.on('sendLocation',async({latitude,longitude},callback)=>{
        try{
            const user = await getUser(socket.id) //getting user by its socket.id
            if(user){
                io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
            }           
            callback()
        }catch(e){
            callback(e)
        }
    })

    //events for disconnected sockets
    socket.on('disconnect', async()=>{
        const user = await removeUser(socket.id) //each user identified by its id        
        if(user){
            const users = await getUsersInRoom(user.room)
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: users
            })
        }
    })
})


module.exports = server //using our custom server

