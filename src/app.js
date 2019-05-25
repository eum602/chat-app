const express = require('express')
const hbs = require('hbs')
const path = require('path') //core module
const socketRouter = require('./routers/socketRouter')

const app = express()

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

module.exports = app