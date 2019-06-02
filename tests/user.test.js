
//above is using the node environment variable (I quit the test env node because it quit the console logs arrobatestEnvironment node)
//const User = require('../src/models/user')
const {addUser , removeUser,getUser, getUsersInRoom} = require('../src/utils/users')

const {setupDatabase,userOneId,userTwo,userThree, roomOneName} = require('./features/db')
// beforeEach(async()=>{
//    await setupDatabase()
// })
beforeEach(setupDatabase)


test('Should add a new user',async()=>{
    const user = await addUser(userTwo)    
    expect(user).toEqual(userTwo)
})

test('Should have a non empty room name',async()=>{    
    const user = await addUser(userThree)
    expect(user).toEqual({
        error: 'Username and room are required!'
    })
})

test('Should remove user', async()=>{
    const user =  await removeUser(userOneId)
    expect(user._id).toEqual(userOneId) //similar => use toEqual; because id is an object
})

test('Should get a user by id', async()=>{
    const user = await getUser(userOneId)
    expect(user._id).toEqual(userOneId)
})

test('Should get users in room', async () =>{
    const users = await getUsersInRoom(roomOneName)
    expect(users).not.toBeNull()
})
