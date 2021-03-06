const socket = io() //calling the io funtion

const app = {}

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
const renderMsg = ({username,text,createdAt})=>{
    const element = document.createElement('div')
    const formated_time = moment(createdAt).format('h:mm a')
    const msg = document.createTextNode(`${formated_time} - ${username}: ${text}`)
    element.appendChild(msg)
    element.className = ''
    const html = element.outerHTML //parsing from html to string   
    
    $messages.insertAdjacentHTML('beforeend',html)//allows insert elements to the selected elements
    //afterbegin:just at the top inside of the div; means newer messages will show us first
    //afterend: means after the element clases
    //before begin: before the messages div
    //beforeend:before the mesage div ends, inside of it.
}

const renderUrl = ({username,url,createdAt})=>{
    const container = document.createElement('div')
    container.className='row'

    const paragraph = document.createElement('p')
    const formated_time = moment(createdAt).format('h:mm a')
    paragraph.textContent = `${formated_time} - ${username}: ` //adding content
    
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
const renderRoomData = ({room,users}) =>{
    const title =  document.getElementById('room-title')
    title.innerHTML = room;

    const userHTML = document.querySelector('#users')
    userHTML.innerHTML = ""
    for(const user of users){
        //console.log(user)
        const li = document.createElement('li')
        li.textContent = user.username        
        userHTML.appendChild(li)
    }

}

const forceScrollDown = id => {
    var objDiv = document.getElementById(id);
    objDiv.scrollTop = objDiv.scrollHeight;
}

socket.on('message', ({username,text,createdAt})=>{
    console.log(`Server says: ${createdAt} ${text}`)
    renderMsg({username,text,createdAt})
    forceScrollDown('messages')    
})

socket.on('locationMessage', url=>{    
    renderUrl(url)
    forceScrollDown('messages')
})

socket.on('roomData', ({room,users})=>{
    console.log(room)
    console.log(users)
    renderRoomData({room,users})
    forceScrollDown('users')
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

app.getData = (key)=>{
    const value = localStorage.getItem(key)    
    if(typeof(value) == 'string'){
        try{
            const parsedValue = JSON.parse(value)
            if(typeof(parsedValue) == 'object'){
                return parsedValue
            } else {
                //app.setLoggedInClass(false)
                //something bad
            }
        }catch(e){
        //app.config.sessionToken = false
        //app.setLoggedInClass(false)
        }
    }
}

const userRoom = app.getData('userRoom') //getting object to create a new room
socket.emit('join',userRoom,error=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})


