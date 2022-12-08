require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("node:path");

const app = express();

const jokeRouter = require("./routes/jokes");

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/jokes", jokeRouter);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// app.get("*", function (_req, res) {
//   res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
// });

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is rinning on port ${PORT} 🏖`);
});
