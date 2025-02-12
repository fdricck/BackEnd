const express = require("express");
const moment = require("moment");
const { users } = require("./users");

const app = express();
const hostname = "127.0.0.1";
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).send("This is the home page");
});

app.get("/about", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Response Success",
    description: "Exercise #03",
    date: moment().format(),
  });
});

app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.get("/:id", (req, res) => {
  res.status(404).json({
    status: "not found",
    message: "Route tidak ditemukan",
  });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});