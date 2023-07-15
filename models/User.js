// const mongoose = require('mongoose')
// const validator = require('validator')
// const bcryptjs = require('bcryptjs')
// const userSchema = new mongoose.Schema({
//     username:{
//         type:String,
//         required:true,
//         trim:true,
//     },
//     password:{
//         type:String,
//         required:true,
//         trim:true,
//         minlength:8
//     },
//     email:{
//         type:String,
//         required:true,
//         trim:true,
//         lowercase:true,
//         uniqe:true,
//         validate(val){
//             if(!validator.isEmail(val)){
//                 throw new Error ('EmailIs Invalid')
//             }
//     }
//     },
//     age:{
//         type:Number,
//         default:18,
//         validate(val){
//             if(val <=0){
//                 throw new Error('age must be a positive number')
//             }
//         }
//     },
//     city:{
//         type:String
//     }
// })
// userSchema.pre('save' , async function (){
//     const user = this
//     user.password = await bcryptjs.hash(user.password ,8 )
// })
// const User = mongoose.model('User',userSchema)
// module.exports = User ;

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    roles:{
        type: [String],
        default:['Employee']
    },
    active:{
        type:Boolean,
        default:true
    }  
})
module.exports = mongoose.model('User', userSchema);