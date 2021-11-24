const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const arrayOfUsers = [];
const arrayOfExercises = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// New user
app.post("/api/users", (req, res) => {
  const username = req.body.username;
  const user = {
    username,
    _id: (arrayOfUsers.length + 1).toString(),
  };
  arrayOfUsers.push(user);
  res.json(user);
});

// Get all users
app.get("/api/users", (req, res) => {
  res.json(arrayOfUsers);
});

// Add exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration } = req.body;
  const date = !!req.body.date ? new Date(req.body.date) : new Date();
  const { _id } = req.params;
  const user = arrayOfUsers.find((user) => parseInt(user._id) === +_id);
  if (user) {
    user.description = description;
    user.duration = parseInt(duration);
    user.date = date.toDateString();

    res.json(user);
    arrayOfExercises.push(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Get all logs
app.get("/api/users/:_id/logs?", (req, res) => {
  var query = require("url").parse(req.url, true).query;
  console.log(query);
  const from = query.from;
  const to = query.to;
  const limit = query.limit;

  const { _id } = req.params;
  console.log(from, to, limit, _id);
  const user = arrayOfUsers.find((user) => parseInt(user._id) === +_id);
  const logObj = {
    username: user.username,
    count: arrayOfExercises.filter(
      (exercise) => parseInt(exercise._id) === +_id
    ).length,
    _id: user._id,
    log: null,
  };

  if (user) {
    const filteredExercises = arrayOfExercises.filter(
      (exercise) => parseInt(exercise._id) === +_id
    );
    logObj.log = filteredExercises;
  }
  if (from && to) {
    logObj.log = arrayOfExercises
      .filter((exercise) => parseInt(exercise._id) === +_id)
      .filter(
        (exercise) =>
          new Date(exercise.date) >= new Date(from) &&
          new Date(exercise.date) <= new Date(to)
      );
  }
  if (limit) {
    logObj.log = arrayOfExercises
      .filter((exercise) => parseInt(exercise._id) === +_id)
      .slice(0, limit);
  }

  logObj.log = logObj.log.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    };
  });

  res.json(logObj);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
