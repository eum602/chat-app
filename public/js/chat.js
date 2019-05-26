const socket = io() //calling the io funtion

socket.on('countUpdated',count=>{
    console.log(`Account has been updated , count: ${count}`)
})

document.querySelector('#increment').addEventListener('click', ()=>{
    console.log('clicked')
    socket.emit('increment')
})
