/**
 * frontend logic for the application
 */

 //Container for the frontend application
 const app = {}

 //config
 app.config = {
     'sessionToken':false,
     'count':0
 }
 
 //Ajax client (for the restful API)
 app.client = {}

// Interface for making API calls
app.client.request = (headers,path,method,queryStringObject,payload,callback)=>{
    //set defaults
    headers = typeof(headers)==='object' && headers!==null ? headers:{}
    path = typeof(path) === 'string' ? path:'/'
    method = typeof(method) === 'string' && ['POST','GET','PUT','DELETE'].indexOf(method) >-1 ? method.toUpperCase():'GET'
    queryStringObject = typeof(queryStringObject)==='object' && queryStringObject!==null ? queryStringObject:{}
    payload = typeof(payload)==='object' && payload!==null ? payload:{}
    callback = typeof(callback) === 'function' ? callback:false

    //for each query String  parameter sent, add it to the path
    let requestUrl = path + '?'
    let counter = 0
    for(let queryKey in queryStringObject){
        if(queryStringObject.hasOwnProperty(queryKey)){
        counter++
        //If  at least one query string parameter has already been added, prepend  new ones with ampersand
        if(counter>1){
            requestUrl +='&'
        }
        //Add the key and value
        requestUrl += queryKey + '=' + queryStringObject[queryKey]
        }
    }

    //form the http request as a json type
    let xhr = new XMLHttpRequest()
    xhr.open(method,requestUrl,true)
    xhr.setRequestHeader("Content-Type","application/json")
    //For each header  sent add it to the request ne by one
    for(let headerKey in headers){
        if(headerKey.hasOwnProperty(headerKey)){
            xhr.setRequestHeader(headerKey,headers[headerKey])
        }
    }

    //if there is a current session token set, add that as a header
    if(app.config.sessionToken){
        xhr.setRequestHeader("token",app.config.sessionToken.id)
    }

    //When the request comes back handle the response
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == XMLHttpRequest.DONE){//means the request is done
        let statusCode = xhr.status
        let responseReturned = xhr.responseText

        //Callback if requested
        if(callback){
            try{
                const parsedResponse = JSON.parse(responseReturned)
                callback(statusCode,parsedResponse)///?????
            }catch(e){
                callback(statusCode,false)
            }
        }
        }
    }
  //Set the payload as json
    const payloadString = JSON.stringify(payload)
    xhr.send(payloadString)
}

// Bind the logout button
app.bindLogoutButton = ()=>{
  document.getElementById("logoutButton").addEventListener("click", e=>{
      // Stop it from redirecting anywhere         
      e.preventDefault()
  
      // Log the user out
      app.logUserOut()
  
    })
}

//Log the user out and then redirect them
app.logUserOut = redirectUser=>{
  redirectUser = typeof(redirectUser) === 'boolean' ? redirectUser:true
  const tokenId = typeof(app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id:false
  
  // Send the current token to the tokens endpoint to delete it
  const queryStringObject = {
      'id' : tokenId
  }

  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,(statusCode,responsePayload)=>{
      // Set the app.config token as false
      app.setSessionToken(false)
      // Send the user to the logged out page
      if(redirectUser){
        window.location = '/session/deleted'
      }      
  })
}

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
          const path = e.target.action
          let method = e.target.method.toUpperCase()
  
          
          //turn the inputs into a payload
          let payload = {}
          const elements = e.target.elements 
          //e.target=>form
          //e.target.elements=> all fields inside form
          //e.target.elements.message => accessing the input by its name
  
          //elements like inputs, div p and so on
          let order = {}
          for(let element of elements){
            if(element.type !== 'submit'){
                //GOAL: Create the "payload"
  
              // Override the method of the form if the input's name is _method
              let nameOfElement = element.name
  
              if(nameOfElement === 'centered-form__box__form'){
                                                
              }
            }
            if(Object.keys(order).length>0){
              payload = order
              //console.log('payload',payload)
            }
          }
          
  
          // If the method is DELETE, the payload should be a queryStringObject instead
          const queryStringObject = method === 'DELETE' ? payload : {}
  
          // Call the API
          app.client.request(undefined,path,method,queryStringObject,payload,(statusCode,responsePayload)=>{
            // Display an error on the form if needed
            if(statusCode !== 200){
  
              if(statusCode == 403){
                // log the user out
                app.logUserOut()
  
              } else {
  
                // Try to get the error from the api, or set a default error message
                const error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
  
                // Set the formError field with the error text
                document.querySelector("#"+formId+" .formError").innerHTML = error;
  
                // Show (unhide) the form error field on the form
                document.querySelector("#"+formId+" .formError").style.display = 'block';
              }
            } else {
              // If successful, send to form response processor
              app.formResponseProcessor(formId,payload,responsePayload);
            }
          })
        })
      }
    }
}


// Form response processor
app.formResponseProcessor = (formId,requestPayload,responsePayload)=>{    
    //if account creation was successful, try to immediately  log the user in
    if(formId == 'accountCreate'){
        //take the form and password, and use it to log the user in
        const newPayload = {
            'email':requestPayload.email,
            'password':requestPayload.password
        }

        app.client.request(undefined,'api/tokens','POST',undefined,newPayload,(newStatusCode,newResponsePayload)=>{
            //display the error on the form if needed
            if(newStatusCode!==200){
                //set the formError field  with the error test
                document.querySelector("#"+formId+" .formError").innerHTML = "Sorry,an error has occurred. Please try again"

                // Show (unhide) the form error field on the form
                document.querySelector("#"+formId+" .formError").style.display = 'block'
            }else{
                // If successful, set the token and redirect the user
                app.setSessionToken(newResponsePayload)
                window.location = '/'//'/checks/all'
            }
        })
    }
    // If login was successful, set the token in localstorage and redirect the user
    if(formId == 'sessionCreate'){
        app.setSessionToken(responsePayload)
        window.location = '/orders/create'//checks/all
    }

    // If forms saved successfully and they have success messages, show them
    const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','checksEdit1'];
    if(formsWithSuccessMessages.indexOf(formId) > -1){
        document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
    }

    //if the user just deleted their account , redirect them to the account-delete page
    if(formId==='accountEdit3'){
    app.logUserOut(false)
    window.location = '/account/deleted'
    }

    if(formId === 'ordersCreate'){
    app.config.orderId = responsePayload.id
    const orderIdString = JSON.stringify(responsePayload.id)
    const price = JSON.stringify(responsePayload.price)
    localStorage.setItem('orderId',orderIdString)
    localStorage.setItem('price',price)
    window.location = '/orders/payment/exec'
    //console.log(formId,requestPayload,responsePayload)
    }
}

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = ()=>{
  const tokenString = localStorage.getItem('token')     
  if(typeof(tokenString) == 'string'){
    try{
      const token = JSON.parse(tokenString)
      app.config.sessionToken = token
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true)
      } else {
        app.setLoggedInClass(false)
      }
    }catch(e){
      app.config.sessionToken = false
      app.setLoggedInClass(false)
    }
  }
}

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = add=>{
  const target = document.querySelector("body")
  if(add){
    target.classList.add('loggedIn')
  } else {
    target.classList.remove('loggedIn')
  }
}

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = token => {
  app.config.sessionToken = token
  const tokenString = JSON.stringify(token)
  localStorage.setItem('token',tokenString)
  if(typeof(token) === 'object'){
    app.setLoggedInClass(true)
  } else {
    app.setLoggedInClass(false)
  }
}

// Renew the token
app.renewToken = callback => {
  const currentToken = typeof(app.config.sessionToken) === 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    var payload = {
      'id' : currentToken.id,
      'extend' : true,
    }
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new token details
        var queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode == 200){
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
}

// Load data on the page
app.loadDataOnPage = ()=>{
  // Get the current page from the body class
  const bodyClasses = document.querySelector("body").classList
  const primaryClass = typeof(bodyClasses[0]) === 'string' ? bodyClasses[0] : false

  // Logic for account settings page
  if(primaryClass === 'accountEdit'){
    app.loadAccountEditPage()
  }
  // // Logic for dashboard page
  // if(primaryClass === 'checksList'){
  //   app.loadChecksListPage()
  // }
  // // Logic for check details page
  // if(primaryClass == 'checksEdit'){
  //   app.loadChecksEditPage();
  // }
  //logic for order template
  if(primaryClass==='ordersCreate'){
    app.loadItems()
  }
  if(primaryClass==='execPayment'){
    app.loadPaymentInputs()
  }
}

app.loadItems = () => {
  
  //(headers,path,method,queryStringObject,payload,callback)
  const email = typeof(app.config.sessionToken.email) === 'string' ? 
  app.config.sessionToken.email : false

  if(email){
    // Fetch the user data
    const queryStringObject = {
      'email' : email
    }
    app.client.request(undefined,'api/items','GET',queryStringObject,undefined,(statusCode,responsePayload)=>{
      
      if(statusCode == 200){
        app.config.base = responsePayload
        ////////////////////////
        const base = app.config.base
        
         document.getElementById("addItem").addEventListener("click", e => {      
      
          let options = ''
          for(let item in base){
            options += `<option value="${item}">${item}</option>`
          }
          let content = `
          <div class="inputLabel">#${app.config.count+1}</div>
          <select name = "items${app.config.count}" id = "items${app.config.count}">
            ${options}
          </select>
      
          <div class="inputLabel">Pizza</div>
          <select name = "subItems${app.config.count}" id = "subItems${app.config.count}"></select>
      
          <div class="inputLabel" id="inputLabel${app.config.count}">Size</div>
          <select name="sizes${app.config.count}" id = "sizes${app.config.count}"></select>
      
          <div class="inputLabel" >amount</div>
          <input name="amounts${app.config.count}" id="amounts${app.config.count}" placeholder="number of units"/>
          `
      
          let typeOfElement = 'DIV'
          let classOfElement = 'inputWrapper'
          let id = `inputWrapper${app.config.count}`
          
          app.addNewElement('ordersCreate',content,typeOfElement,classOfElement,id,null)
      
          document.getElementById(`items${app.config.count}`).addEventListener('change',e=>{
            const selectedItem = e.target.id[5]
            
            const container = `subItems${selectedItem}`
      
            id = container
            app.removeAllChildItems(id)
            app.removeAllChildItems(`sizes${selectedItem}`)
            document.getElementById(`amounts${selectedItem}`).value = ""
      
            const valueOfItem = event.target.value
            app.config.base[valueOfItem].forEach(valueOfSubItem => {
              typeOfElement = 'OPTION'
              classOfElement = null
              id = null
              name = null
              app.addNewElement(container,valueOfSubItem.name,typeOfElement,classOfElement,id,name)        
            })
          })
      
          document.getElementById(`subItems${app.config.count}`).addEventListener('change',e=>{
            const selectedSubItemId = e.target.id[8]      
            const container = `sizes${selectedSubItemId}`
      
            id = container
            app.removeAllChildItems(id)
          
            const valuesOfSubItem = event.target.value //mozarella, coca cola,etc
            const item = document.getElementById(`items${selectedSubItemId}`).value
            let sizes = []
            app.config.base[item].forEach(subItem=>{
              if(subItem.name===valuesOfSubItem){
                sizes = subItem.sizes          
              }
            })
      
            sizes.forEach(size=>{
              typeOfElement = 'OPTION'
              classOfElement = null
              id = null
              name = null
              app.addNewElement(container,size,typeOfElement,classOfElement,id,name)
            })
          })
          
          app.config.count++
        })
        ////////////////////////
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)        
        app.logUserOut()
      }
    })
  } else {
    app.logUserOut()
  }
}

app.addNewElement = (container,content,typeOfElement,classOfElement,id,name) => {
  
  const node = document.createElement(typeOfElement)
  node.className = classOfElement
  node.setAttribute("id",id)
  node.name = name!==null ? name:""  
  if(typeOfElement==='OPTION'){
    node.text= content
    node.value= content
  }else{
    node.innerHTML = content
  }
  
  const lista = document.getElementById(container)
  //lista.appendChild(input)
  lista.appendChild(node)
}

app.removeAllChildItems = elementId => {
  var ele = document.getElementById(elementId);
  while (ele.hasChildNodes()) {
      ele.removeChild(ele.firstChild);
  }
}

// Load the account edit page specifically
app.loadAccountEditPage = ()=>{
  // Get the phone number from the current token, or log the user out if none is there
  const email = typeof(app.config.sessionToken.email) === 'string' ? 
  app.config.sessionToken.email : false

  if(email){
    // Fetch the user data
    const queryStringObject = {
      'email' : email
    }
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,(statusCode,responsePayload)=>{
      
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName
        document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName
        document.querySelector("#accountEdit1 .displayEmailInput").value = responsePayload.email
        document.querySelector("#accountEdit1 .streetAddressInput").value = responsePayload.streetAddress

        // Put the hidden phone field into both forms
        const hiddenEmailInputs = document.querySelectorAll("input.hiddenEmailInput")
        for(let hiddenEmailInput of hiddenEmailInputs){
            hiddenEmailInput.value = responsePayload.email;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    })
  } else {
    app.logUserOut();
  }
}

// Loop to renew token often
app.tokenRenewalLoop = ()=>{
  setInterval(()=>{
    app.renewToken(err=>{
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    })
  },1000 * 60)
}

//
app.loadPaymentInputs = () => {
  const amount = parseInt(localStorage.getItem('price'))*100
    // document.getElementById('paymentData').setAttribute("data-amount",amount)
    // console.log(document.getElementById('paymentData'))
  const handler = StripeCheckout.configure({
      key: 'pk_test_4dCE4rB2c8IAXeqiKm42Wggg',
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      token: token => {
        console.log('token returned',token)
      // You can access the token ID with `token.id`.
      // Get the token ID to your server-side code for use.
      ////////////////////      
        // Prevent user from leaving page
        window.onbeforeunload = () => {
                return ""
        }
        const formId = "execPayment"
        const orderId = JSON.parse(localStorage.getItem('orderId'))
        const tokenPayment = token.id
        app.client.request(undefined,'orders/payment/confirmed','POST',{'orderId':orderId},{'tokenPayment':tokenPayment},(newStatusCode,newResponsePayload)=>{
          //display the error on the form if needed
          if(newStatusCode!==200){
              //set the formError field  with the error test
              document.querySelector("#"+formId+" .formError").innerHTML = "Sorry,an error has occurred. Please try again"

              // Show (unhide) the form error field on the form
              document.querySelector("#"+formId+" .formError").style.display = 'block'
          }else{
            // If successful, set the token and redirect the user
            document.querySelector("#"+formId+" .formSuccess").style.display = 'block'
            document.getElementById("paymentData").disabled =true
            document.getElementById("paymentData").style.visibility = 'hidden'//"visible"
            //app.setSessionToken(newResponsePayload)
            //window.location = '/checks/all'
          }
        })
      }
  })
  document.getElementById('paymentData').addEventListener('click', e => {
      // Open Checkout with further options:
      handler.open({
      name: 'eum602',
      description: 'Orders for delivery',
      amount: amount
      })
      e.preventDefault()
  })
  
  // Close Checkout on page navigation:
  window.addEventListener('popstate', () => {      
      handler.close()      
  })
}


// Init (bootstrapping)
app.init = ()=>{
  // Bind all form submissions
  app.bindForms()

  // Bind logout logout button
  app.bindLogoutButton()

  // Get the token from localstorage
  app.getSessionToken()

   //Renew token
  app.tokenRenewalLoop()

  //Load data on page
  app.loadDataOnPage()
 }
 // Call the init processes after the window loads
window.onload = ()=>{
app.init()
}