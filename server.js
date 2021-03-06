const express=require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors =require('cors');
const saltRounds=10;
const knex = require('knex');
const db=knex({
    client: 'pg',
    connection: {
      host : 'LOCALHOST',
    user : 'USERNAME',
    password : 'PASSWORD',
    database : 'DATABASE_NAME',
      ssl: true
    }
  });

const app=express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

app.post('/login',(req,res)=>{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json("User Not Found");
        }
         db.select('email','hash').from('users').where(
                'email','=',email
            ).then(user=>{
              if(user[0]===undefined)
              {
               return res.status(400).json("User Not Found");
            }
                const isValid=bcrypt.compareSync(password, user[0].hash);
                if(isValid){
                   return db('users').where( 'email','=', email )
                        .increment('entries',1)
                        .returning(['entries','name'])
                        .then(response1=>{
                            res.status(200).json(response1[0])
                        }).catch(err=>{res.status(400).json("Wrong Credentials")})    
                    }
                    else{
                     return res.status(400).json("User Not Found");
                  }
                
            })
 })

 app.post('/signup',(req,res)=>{
    const { name,email,password }=req.body;
    if(!email || !password || !name)
    {
      return  res.status(400).json("unable to register!!!");
    }
    const hash = bcrypt.hashSync(password, saltRounds);
    db.transaction(trx=>{
    trx.insert({
            name:name,
            email:email,
            hash:hash,
            joined:new Date()
        }).into('users')
        .then(trx.commit)
        .catch( trx.rollback)})
        .then(user=>{
              return  res.status(200).json("WOOHOO");
            }).catch(err=>{
              console.log(err);
              return res.status(400).json(err)});
          
 })

 app.post('/movie',(req,res)=>{
   const {mname}=req.body;
   if(!mname)
    {
      return  res.status(400).json("no movie selected");
    }
 })

app.get('/',(req,res)=>{res.send(`Heroku Working on ${PORT}`)})
 app.listen(PORT);
