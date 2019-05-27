const socket = io() //calling the io funtion

//****Elements*****
const $messageForm = document.querySelector('#message-form') 
//dollar sign at the beggining is merely a convention
const $messageFormInput= $messageForm.elements.message
const $messageFormButton = $messageForm.elements.submit
const $sendLocationButton = document.querySelector("#send-location")

socket.on('message', message=>{
    console.log(`Server says: ${message}` )
})


$messageForm.addEventListener('submit',e=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled') //disables the button of the form
    const message = $messageFormInput.value//e.target.elements.message.value //e.target=>form
                                                    //e.target.elements=> all fields inside form
                                                    //e.target.elements.message => accessing the input by its name
    socket.emit('sendMessage',message,error=>{
        $messageFormButton.removeAttribute('disabled') //re enabling after a callback has returned from the server        
        $messageFormInput.value=''
        $messageFormInput.focus() //moving the cursor again to the input
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered')//a callback to ackonwledge a message was delivered
        
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition(position=>{//asynchronous nut unsopprted for async/await
        const {latitude, longitude} = position.coords
        
        socket.emit('sendLocation',{latitude,longitude},error=>{
            //sendLocationButton.removeAttribute('disabled')
            if(error){
                return console.log(error)
            }
            console.log("location shared")
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
