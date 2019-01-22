'use strict'
const express = require("express")
const Sequelize = require("sequelize")
const twitter = require('twitter')
const bodyParser = require("body-parser")
var request = require('request') 

const SERVER = "https://project-secareanumihaela.c9users.io"

const sequelize = new Sequelize('tabel','root','password',{
    dialect: 'mysql'})

let Company = sequelize.define('company',{
    name: {
    type : Sequelize.STRING,
    allowNull : false,
    validate : {
            len : [3,255]
        }
    }
})

let Postari = sequelize.define('posts',{
    company:{
    type : Sequelize.STRING,
    allowNull : false,
    validate : {
            len : [3,255]
        }
    },
    text:{
        type : Sequelize.STRING
    },
    user:{
        type: Sequelize.STRING
    },
    posted_at:{
        type: Sequelize.DATE
    }
},{
    timestamps: false})

Company.hasMany(Postari)

const app = express()

app.use(bodyParser.json())

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


//sequelize.sync({force: true})
sequelize.sync()

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Methods", "POST, GET , OPTIONS")
   next()
})

app.get('/ping',(req,res)=>{
    res.status(200).json({message: 'pong'})
})

app.post('/companies', (req, res) => {
  if((req.body).length !== 0)
     Company.create(req.body)
     .then(()=>{
        searchTwitter(req.body.name)
     //  console.log(req.body.name)
        res.status(201).json({message : 'created'})
    }) 
    .catch(()=>
        res.status(500).json({message : 'server error'}))      
    })

app.get('/companies',(req,res)=>{
    Company.findAll()
    .then((companies)=>{
        res.status(200).json(companies)
    })
    .catch(()=> res.status(400).send({message: 'no companies'}))
})

app.get('/posts',(req,res)=>{
    Postari.findAll()
    .then((postari)=>{
        res.status(200).json(postari)
    })
    .catch(()=> res.status(400).send({message: 'no posts'}))
})


app.post('/posts', async(req,res) => {
    try
    { 
        await Postari.create(req.body)
      //  console.log(req.params.company)
        res.status(201).json({message : 'created'})
    }
    catch(e){
        console.warn(e.stack)
        res.status(500).json({message : 'posts server error'})
    }      
    })

app.get('/posts/:company', (req, res) => {
   var companyName = ''
   
    Postari.findAll({where:{ company: '' + companyName.concat(req.params.company)}})
    .then((postari)=>{
        res.status(200).json(postari)
    })
    .catch(()=> res.status(400).send({message: 'no companies'}))
    
})

var client = new twitter({
             consumer_key: "aV73Zfpftz1Ef4cV6Y9nNRsJI" ,
             consumer_secret: "7pVCQ67O7h8bCzyD6za0GaPHigKMCAHaLbJX7PjjRB7PULj8zS",
             access_token_key: "916732990738325509-VRDPfoIcPsUQHqNNGwNt5JIDF8LguL1",
             access_token_secret: "uB6hxtxSXAHR3NukuiK1qRXCwnxtDLBWNw24ok0niVciQ"
         })


function addPost(company, post){
  request.post({
            url: SERVER + '/posts',
            headers: {'Content-Type' : 'application/json'},
          json : {company : company,
                    posted_at: post.created_at,
                    user: post.user.name,
                    text: post.text
            }
        })
}

   function searchTwitter(company){
     var url = 'https://api.twitter.com/1.1/search/tweets.json?q='
     client.get(url.concat(company) , function(error, tweets, response) {
        if (!error) {
            for(var i = 0;i < tweets.statuses.length;i++){
            addPost(company, tweets.statuses[i])}}
        
        else console.warn(error.stack)
        }       
    )}
  

app.listen(8080)