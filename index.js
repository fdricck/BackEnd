const express = require("express");
const moment = require("moment");
const morgan = require("morgan"); // Tambahkan morgan
const { users } = require("./users");

const app = express();
const hostname = "127.0.0.1";
const port = 3000;

// Middleware untuk logging dengan morgan
app.use(morgan("tiny"));

// Route untuk home page
app.get("/", (req, res) => {
  res.status(200).send("This is the home page");
});

// Route untuk about page
app.get("/about", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Response Success",
    description: "Exercise #04",
    date: moment().format(),
  });
});

// Route untuk mendapatkan semua data users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

// Route untuk mendapatkan data user berdasarkan nama (case-insensitive)
app.get("/users/:name", (req, res) => {
  const name = req.params.name.toLowerCase(); // Ubah ke lowercase untuk case-insensitive
  const user = users.find((u) => u.name.toLowerCase() === name);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({
      message: "data user tidak ditemukan",
    });
  }
});

// Route untuk penanganan 404 (tidak ditemukan)
app.get("/:id", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "resource tidak ditemukan",
  });
});

// Penanganan error sederhana
app.use((err, req, res, next) => {
  console.error(err); // Log error ke console
  res.status(500).json({
    status: "error",
    message: "terjadi kesalahan pada server",
  });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
