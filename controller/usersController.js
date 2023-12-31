const User = require ('../models/User')
const Note = require ('../models/Note.js')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const getAllUsers = asyncHandler(async (req ,res)=>{
    const users = await User.find().select('-password').lean()

    if(!users?.length){
        return res.status(400).json({message: "No User Found"})
    }
    res.json(users)
})


const createNewUser = asyncHandler(async(req ,res)=>{
    console.log(req.body)

    const {username , password , roles} = req.body

    if(!username || !password){
        return res.status(400).json({message: "All Fields Are Required"})
    }

    const duplicate = await User.findOne({username}).collation({locale: 'en', strength: 2}).lean().exec()

    if(duplicate){
        return res.status(409).json({message:"Duplicate Username"})
    }

    const hashedPwd = await bcrypt.hash(password , 10)
    const userObject = (!Array.isArray(roles) || !roles.length)
    ? {username , password:hashedPwd}
    :{username , password:hashedPwd , roles}
    
    const user = await User.create(userObject)
    if(user){
        res.status(201).json({message: `New User ${username} Created`})
    }else{
        res.status(400).json({message: 'Invalid User Data Received'})
    }
})

const updateUser = asyncHandler(async (req, res)=>{
    const {id , username, roles , active ,password} = req.body

    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !=='boolean'){
        return res.status(400).json({message: 'All Fields Except Password Are Required'})
    }

    const user = await User.findById().exec()

    if(!user){
        return res.status(400).json({message: 'User  Not Found'})
    }

    const duplicate = await User.findOne({username}).collation({locale: 'en' , strength:2}).lean().exec()
    if(duplicate && duplicate?._id.toString() !==id){
        return res.status(409).json({message:'Duplicate Username'})
    }
    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        user.password = await bcrypt.hash(password , 10)
    }

    const updatedUser = await user.save()
    res.json({message: `${updatedUser.username} Updated`})

})

const deleteUser = asyncHandler(async(req, res)=>{
    const {id} = req.body

    if(!id){
        return res.status(400).json({message: 'User Id Required'})
    }

    const note = await Note.findOne({user: id}).lean().exec()
    if(note){
        return res.status(400).json({message: 'User Has Assigned Notes'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: 'User Not Found'})
    }
    const result = await user.deleteOne()
    const reply = `Username ${result.username} With ID ${result._id} Deleted`
    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}