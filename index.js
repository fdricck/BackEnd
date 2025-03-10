const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const routers = require("./routers"); // Mengimpor routers.js
const app = express();

// Middleware Log
app.use(morgan("tiny"));

// Middleware Body Parser (JSON)
app.use(express.json()); // Untuk parsing JSON di request body

// Middleware CORS
app.use(cors({ origin: "http://127.0.0.1:5500" })); // Menangani CORS

// Middleware untuk Akses File Statis
app.use(express.static(path.join(__dirname, "public"))); // Akses file statis dari folder 'public'

// Gunakan router.js untuk menangani rute-rute yang ada
app.use(routers);

// Penanganan Routing 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "resource tidak ditemukan",
  });
});

// Penanganan Error
app.use((err, req, res, next) => {
  console.error(err); // Log error ke console
  res.status(500).json({
    status: "error",
    message: "terjadi kesalahan pada server",
  });
});

const hostname = "127.0.0.1";
const port = 3000;
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
