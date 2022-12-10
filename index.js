require("dotenv").config();

const express = require("express");
const app = express();
const path = require("node:path");
const jwt = require("jsonwebtoken"); 
const cors = require("cors");

app.use(cors());
app.use(express.json());

const jokeRouter = require("./routes/jokes");
const jsonSecretKey = process.env.jsonSecretKey;

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/jokes", jokeRouter);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//signup login don't need a token
app.use((req, res, next)=>{
  if(req.url === "/api/signup" || req.url === "/api/signin"){
    next();
  }else{
    const token = getToken(req);
    
    if(token){
      console.log('Auth Token:', token);
      if(jwt.verify(token, jsonSecretKey)){
        req.decode = jwt.decode(token);
        next();
      }else{
        res.status(403).json({error:"Not Authorized"});
      }
    }else {
      res.status(403).json({error:"No token, Unauthorized"});
    }
  }
});

function getToken(req){
  return req.headers.authorization.split(" ")[1];
}

const users = {};

app.post("/api/signup", (req, res) => {
  const {username, name, password} = req.body;
  users[username] ={
    name,
    password
  };
  console.log('Users Object:', users);
  res.json({success:"true"});
});

app.post("/api/signin", (req, res) => {
  const {username, password} = req.body;
  const user = users[username];
  if(user && user.password === password){
    console.log('Found user:', user);
    res.json({token: jwt.sign({name: user.name}, jsonSecretKey)});
  }else {
    res.status(403).json({
      token:"",
      error:{
        message:"Error logging in. Invalid username/password combination."
      }
    })
  }
});

app.get("/api/profile" , (req, res)=> {
  res.json(req.decode);
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is rinning on port ${PORT} 🏖`);
});
