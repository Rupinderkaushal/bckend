const express = require('express');
const cors= require('cors');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const app = express();


app.use(cors());
app.use(express.json());
mongoose.connect('mongodb+srv://rupi:12345@cluster0.ugmog0t.mongodb.net/rajubaba?retryWrites=true&w=majority', {
    useUnifiedTopology : false
})
.then(()=>{console.log("mdb connects")}).catch(err=>console.log(err))

const loginSchema = new mongoose.Schema({
    email : {
        type:String,
        required:true,
        unique : true
    },
    password : {
        type:String,
        required:true
    },
});
const expensesSchema = new mongoose.Schema({
    title : {
        type:String,
        required:true,
        unique : true
    },
    amount : {
        type:String,
        required:true
    },
});

const signupSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:true,
    },
    lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
})

const loginModal = mongoose.model("login", loginSchema);
const expensesModal= mongoose.model("expenses",expensesSchema);
const signupModal = mongoose.model("signup",signupSchema);

app.get('/',(req,res)=>{
    const {accesstoken}= req.headers;
    console.log(accesstoken)
    res.json("hey loops")
})
app.get('/expenslist',(req,res)=>{
    const token = req.headers['x-access-token'];
    console.log(token)
    jwt.verify(token ,'hello' , (err,ress) => {
        if(err){
            console.log(err)
            res.json({
                success : false
            })
        }else{
            console.log('ress',ress)
    expensesModal.find({}).then(result=>res.json(result)).catch(err=>res.json(err.message))

        }
    })
})

app.post('/login',(req,res)=>{
    console.log(req.body)
    signupModal.findOne({
        email:req.body.email,
    }).then(result=> {
        if(result){
            const token = jwt.sign({
                email : result.email
            },
            "hello",
            
            // {
            // expiresIn : 3600,
            // }
            )
            console.log('token', token)
            res.json({
                verified:"ok",
                token:token
            })
        }else{
    
            res.json("no user found !")
        }
    }).catch(err=>console.log(err))
    
})

app.post('/signup',(req,res)=>{
    signupModal.findOne({
        email:req.body.email
    }).then((result)=>{
        if(result){
            res.json("email already exist")
        }else{
            const newUser = new signupModal(req.body)
            newUser.save().then(() => res.json("user created")).catch(err=> res.json(err))
        }
    })
   
})

app.post('/expense',(req,res)=>{
    const newEntry= new expensesModal(req.body)
    newEntry.save().then(()=>res.json("data entered")).catch(err=>res.json(err))

})
app.post('/updateList',(req,res)=>{
    const {id} = req.body;
    const {fieldsToUpdate} = req.body;
    expensesModal.findOneAndUpdate({
        _id: id
    },{
        $set : fieldsToUpdate
    }).then((result)=> res.json({
        success : true,
        message : 'Item updated'
    })).catch(err=> {
        console.log(err)
        res.json({
            success : false,
            message : 'something went wrong'
        })
    })
})
app.delete('/deletelist',(req,res)=>{
    const id = req.headers.id;
    console.log("headers",id)
    expensesModal.deleteOne({_id:id}).then(result=> res.json("deleted succesfully")).catch(err=>res.json(err))
})
app.listen(8080,()=>{console.log("server running @8080")})