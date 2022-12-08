const express = require("express");
const router = express.Router();

const path = require("node:path");

const jokesJSONFile = path.join(__dirname, "../data/joke.json");
const jokes = require(jokesJSONFile);

router.get("/", (_req, res) => {
  try {
    res.status(200).json(jokes);
  } catch (err) {
    console.log("Error retrieving the videos", err);
  }
});

module.exports = router;
