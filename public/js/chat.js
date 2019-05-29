const socket = io() //calling the io funtion

//****Elements*****
const $messageForm = document.querySelector('#message-form') 
//dollar sign at the beggining is merely a convention
const $messageFormInput= $messageForm.elements.message
const $messageFormButton = $messageForm.elements.submit
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
//innerHTML gives us access to the html inside the element
const renderMsg = ({text,createdAt})=>{
    const element = document.createElement('div')
    const formated_time = moment(createdAt).format('h:mm a')
    const msg = document.createTextNode(`${formated_time} - ${text}`)
    element.appendChild(msg)
    element.className = ''
    const html = element.outerHTML //parsing from html to string   
    
    $messages.insertAdjacentHTML('beforeend',html)//allows insert elements to the selected elements
    //afterbegin:just at the top inside of the div; means newer messages will show us first
    //afterend: means after the element clases
    //before begin: before the messages div
    //beforeend:before the mesage div ends, inside of it.
}

const renderUrl = ({url,createdAt})=>{
    const container = document.createElement('div')
    container.className='row'

    const paragraph = document.createElement('p')
    const formated_time = moment(createdAt).format('h:mm a')
    paragraph.textContent = `${formated_time} -  ` //adding content
    
    const anchor = document.createElement('A')
    //const ref = document.createAttribute('href')
    //ref.value = url
    //element.setAttributeNode(ref)
    anchor.href=url
    anchor.target = "_blank" //to click and automatically open new tab
    anchor.textContent = 'My current location'
    anchor.className = 'btn btn-location' //setting style

    paragraph.appendChild(anchor)

    container.appendChild(paragraph)
    //console.log(anchor)

    const html = container.outerHTML
    $messages.insertAdjacentHTML('beforeend',html)    
}

const forceScrollDown = () => {
    var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
}


socket.on('message', ({text,createdAt})=>{
    console.log(`Server says: ${createdAt} ${text}`)
    renderMsg({text,createdAt})
    forceScrollDown()    
})

socket.on('locationMessage', url=>{    
    renderUrl(url)
    forceScrollDown()
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
