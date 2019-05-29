const express = require('express')
const router = new express.Router()


router.get('',(req,res)=>{
    res.render('index',{
        title:'Chat-app',
        name:'Erick Pacheco'
    }) //instead send we use render in order to render the views, previously we must set the wiew engine
    //index refers ti index.hbs
})

router.get('/chat',(req,res)=>{
    res.render('chat',{
        /**insert variables here */
    })
    //res.send('something')
})

module.exports = router
