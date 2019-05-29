/**
 * frontend logic for the application
 */

 //Container for the frontend application
 const app = {}

//Ajax client (for the restful API)
 app.client = {}


// Bind the forms
app.bindForms = ()=>{
  if(document.querySelector("form")){

    const allForms = document.querySelectorAll("form")
    for(let form of allForms){
      form.addEventListener('submit',e=>{
        
        // Stop it from submitting
        e.preventDefault()
        //console.log(e.target)
        const formId = e.target.id //e.targer = form
        //const path = e.target.action
        //let method = e.target.method.toUpperCase()

        //iterating through all forms
        if(formId==='centered-form__box__form'){
            //turn the inputs into a payload
            //let payload = {}
            const elements = e.target.elements
            //e.target=>form
            //e.target.elements=> all fields inside form
            //e.target.elements.message => accessing the input by its name
            let username = elements.username.value
            let room = elements.room.value
            //saving values locally
            const userRoom = JSON.stringify({username,room})
            localStorage.setItem('userRoom',userRoom)
            console.log(userRoom)
            //redirecting user
            window.location = '/chat'
        }

        // If the method is DELETE, the payload should be a queryStringObject instead
        //const queryStringObject = method === 'DELETE' ? payload : {}

        // Call the API        
      })
    }
  }
}

/////////////////////////////////////****2******////////////////////////
// Init (bootstrapping)
app.init = ()=>{
  // Bind all form submissions
  app.bindForms()

  // Bind logout logout button
  //app.bindLogoutButton()

  // Get the token from localstorage
  //app.getSessionToken()

   //Renew token
  //app.tokenRenewalLoop()

  //Load data on page
  //app.loadDataOnPage()
}
 // Call the init processes after the window loads
/////////////////////////////////////****1******////////////////////////
window.onload = ()=>{
app.init()
}
