require("dotenv").config();

const express = require("express");
const app = express();
const path = require("node:path");
const jwt = require("jsonwebtoken"); 
const cors = require("cors");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(express.json());

const jokeRouter = require("./routes/jokes");
const jsonSecretKey = process.env.jsonSecretKey;

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/jokes", jokeRouter);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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

app.post("/api/signup", async (req, res) => {
  const {username, name, password} = req.body;
  const hash=await bcrypt.hash(password, 10);
  users[username] ={
    name,
    password:hash
  };
  console.log('Users Object:', users);
  res.json({success:"true"});
});

app.post("/api/signin", async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) {
    res.status(403).json({
      token:"",
      error:{
        message:"Error Signing in. Invalid username."
      }
    })
  }

  const isValid = await bcrypt.compare(password, users[username].password);
  if (!isValid) {
    res.status(403).json({
      token: "",
      error: {
        message: "Error Signing in. Invalid password.",
      },
    });
  }

  console.log('Found user:', user);
  res.json({token: jwt.sign({name: user.name}, jsonSecretKey)});
});

app.get("/api/profile" , (req, res)=> {
  res.json(req.decode);
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is rinning on port ${PORT} 🏖`);
});
