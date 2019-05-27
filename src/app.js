const express = require('express')
const hbs = require('hbs')
const path = require('path') //core module
const http = require('http') //core module
const socketio = require('socket.io')
const Filter = require('bad-words')
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
    socket.emit('message','Welcome!')

    socket.on('sendMessage',(message,callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.emit('message',message)
        callback()
    })

    socket.on('sendLocation',({latitude,longitude},callback)=>{
        try{
            socket.broadcast.emit('message',`https://google.com/maps?q=${latitude},${longitude}`)
            callback()
        }catch(e){
            callback(e)
        }
    })

    //events for disconnected sockets
    socket.on('disconnect', ()=>{
        io.emit('message', "A user has disconnected")
    })
    
})



module.exports = server //using our custom server