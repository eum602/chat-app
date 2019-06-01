
/**
 * @jest-environment node
 */
//above is using the node environment variable
//const User = require('../src/models/user')
const {addUser} = require('../src/utils/users')

const {setupDatabase,useOne,userTwo,userThree, roomOne} = require('./features/db')
//when testing mongo directly with jest causes conflicts if you use the shorthand "beforeEach(setupDatabase)"; instead use:
beforeEach(()=>{
    async ()=>{
        await setupDatabase()
    }
})

test('Should add a new user',async()=>{
    const user = await addUser(userTwo)    
    expect(user).not.toBeNull()
})

test('Should have a non empty room name',async()=>{    
    const user = await addUser(userThree)    
    expect(user).not.toBeNull()
})