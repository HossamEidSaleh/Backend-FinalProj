const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

const getAllNotes = asyncHandler(async (req , res)=>{
    const notes = await Note.find().lean()

    if(!notes?.length){
        return res.status(400).json({message:'No Notes Founded'})
    }
    const notesWithUser = await Promise.all(notes.map(async(note)=>{
        const user = await User.findById(note.user).lean().exec()
        return {...note ,username: user.username}
    }))
    res.json(notesWithUser)
})



 
const createNewNote = asyncHandler(async (req,res)=>{
    const {user , title, text} = req.body
    if(!user || !title || !text){
        return res.status(400).json({message : 'All Fields Are Required'})
    }
    const duplicate = await Note.findOne({title}).collation({locale: 'en' , strength:2}).lean().exec()
    if(duplicate !== null){
        return res.status(400).json({message: 'Duplicate Note Title'})
    }

    const noteObject = {user , title , text}
    const newNote = await Note.create(noteObject)
    console.log(newNote)

    if(newNote){
        return res.status(201).json({message : 'New Note Created'})
    }else{
        return res.status(400).json({message: 'Invalid Note Data Received'})
    }
})


const updateNote = asyncHandler(async (req,res)=>{
    const {id , user, title, text, completed} = req.body
    if(!id || !user || !title || !text || typeof completed !=='boolean'){
        return res.status(400).json({message: 'All Fields Are Required'})
    }

    const note = await Note.findById().exec()

    if(!note){
        return res.status(400).json({message: 'Note  Not Found'})
    }

    const duplicate = await Note.findOne({title}).collation({locale: 'en' , strength:2}).lean().exec()
    if(duplicate && duplicate?._id.toString() !==id){
        return res.status(409).json({message: 'Duplicate Note Title'})
    }

    note.user = user 
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()
    res.json(`${updatedNote.title} Updated`)
})



const deleteNote= asyncHandler(async(req ,res)=>{
    const {id} = req.body

    if(!id){
            return res.status(400).json({message: 'Note Id Required'})
    }

    const note = await Note.findById(id).exec()

    if(!note){
            return res.status(400).json({message: 'Note Not Found'})
    }
    const result = await note.deleteOne()

    const reply = `Note ${result.title} With Id ${result._id} Deleted`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}