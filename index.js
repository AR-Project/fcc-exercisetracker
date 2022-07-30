require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const User = require('./src/userSchema');

mongoose.connect(process.env.MONGO_URI, () => {
  console.log(`Database Connected`);
})
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// GET list all users in array
app.get("/api/users", async (req, res) => {
  const users = await User.find().select({username: 1, _id: 1})
  res.json(users)
})

// create new users
app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username,
    })
    // const validation = await User.find({username: req.body.username})
    //   .select({username: 1})
    // console.log(user)
    // console.log(validation);
    res.json({
      username: user.username,
      _id: user._id})
    // res.json(validation)
  } catch (e) {
    res.json(e.message)
  }
})

app.get("/api/users/:_id/exercises", async (req, res) =>{
  try {
    // console.log(req.params);
    const user = await User.findById(req.params._id);
    const wrap = {
      username: user.username,
      count: user.log.length,
      _id: user._id,
      log: user.log
    }
    res.json(wrap);
  } catch (e) {
    res.json(e.message)
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    // Function for filling date in exercise
    // const datevalue = (str) => {
    //   if (str == "") return new Date();
    //   return str;
    // }
    
    let validDate;
    if (req.body.date === undefined) {
      validDate = new Date().toDateString();
    } else {
      validDate = new Date(req.body.date).toDateString();
    }

    console.log(`${req.body.date} ==> ${validDate}`)

    // console.log(validDate)

    // Wrap object to be pushed in user.log
    const exercise = {
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: validDate,
    }

    // Fetch user from database
    const user = await User.findById(req.params._id);

    // Push exercise object into log Array in user models
    user.log.push(exercise);
    await user.save();

    
    const result = await User.findById(req.params._id).select({username: 1})
    // Wrap object to be use in respond json
    const resultWrapper = {
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      // date: new Date(exercise.date).toDateString(),
      date: validDate,
      _id: user._id
    }
    // Push updated data in database
    result.duration = exercise.duration;
    result.date = exercise.date;
    result.description = exercise.description;
    // Debug
    // console.log(user);
    
    // Respond json 
    // res.json(resultWrapper);
    res.json(result);
  } catch (e) {
    res.json(e.message);
  }
})

// Fetch user logs in arrays
app.get("/api/users/:_id/logs", async (req, res) =>{
  // console.log(req.query);
  const { from, to, limit } = req.query;
  
  try {
    // console.log(req.params);
    const user = await User.findById(req.params._id)
      .select({ username: 1, count: 1, log: 1 });
    user.count = user.log.length;

    if (from !== undefined){
      const queryTime = new Date(from).getTime();
      const temp = user.log.filter( element => {
        let exerciseTime = new Date(element['date']).getTime();
        if (exerciseTime >= queryTime) return true
      })
      user.log = temp;
    }

    if (to !== undefined) {
      const queryTime = new Date(to).getTime();
      const temp = user.log.filter( element => {
        let exerciseTime = new Date(element['date']).getTime();
        if (exerciseTime <= queryTime) return true
      })
      user.log = temp;
    }

    if (limit !== undefined) {
      const temp = [];
      for (let i = 0; i < limit; i ++){
        temp.push(user.log[i])
      }
      user.log = temp;
    }

    // user.log.forEach(element => {
    //   const temp = new Date(element['date']).toDateString();
    //   element['date'] = temp;
    // });
    res.json(user);
  } catch (e) {
    res.json(e.message)
  }
  // if (queryChecker(from, to, limit)) {
  // } else if (from !== undefined || to !== undefined) {
  //   try {
  //     //TODO fetch data base
  //   } catch (e) {
  //     res.json(e.message)
  //   }
  // } 
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
