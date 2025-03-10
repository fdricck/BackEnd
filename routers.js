const express = require("express");
const routers = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const users = require("./users");

// 1. GET: /users
routers.get("/users", (req, res) => {
  res.status(200).json({
    status: "success",
    data: users,
  });
});

// 2. GET: /users/:name
routers.get("/users/:name", (req, res) => {
  const { name } = req.params; // Mengambil nama dari parameter URL
  const user = users.find(
    (user) => user.name.toLowerCase() === name.toLowerCase()
  );

  if (user) {
    res.status(200).json(user); // Kembalikan data user jika ditemukan
  } else {
    res.status(404).json({
      status: "error",
      message: "Data user tidak ditemukan", // Pesan error jika user tidak ditemukan
    });
  }
});

// 3. POST: /users
routers.post("/users", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Masukkan data yang akan diubah",
    });
  }

  res.status(201).json({
    status: "success",
    message: "User berhasil ditambahkan",
  });
});

// 4. GET: /download untuk mendownload/preview file di folder assets
routers.get("/download", (req, res) => {
  const filename = "mantap.png";
  res.sendFile(path.join(__dirname, "/assets", filename), {
    headers: {
      "Content-Disposition": 'attachment; filename="mantap.png"',
    },
  });
});

// File upload middleware, hanya menerima gambar
const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(null, false);
  }
  cb(null, true);
};

const upload = multer({ dest: "public", fileFilter: imageFilter });

// 5. POST: /upload untuk menerima file gambar
routers.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (file) {
    const target = path.join(__dirname, "public", file.originalname);
    fs.renameSync(file.path, target);
    res.status(200).send("File berhasil diupload");
  } else {
    res.status(400).send("File gagal diupload");
  }
});

// 6. PUT: /users/:name untuk mengupdate data pengguna berdasarkan name
routers.put("/users/:name", (req, res) => {
  const { name } = req.body;
  const { name: paramName } = req.params;

  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Data user tidak ditemukan atau data request body tidak ada",
    });
  }

  const user = users.find(
    (user) => user.name.toLowerCase() === paramName.toLowerCase()
  );

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "Data user tidak ditemukan",
    });
  }

  user.name = name; // Update name

  res.status(200).json({
    status: "success",
    message: "User berhasil diupdate",
    data: user,
  });
});

// 7. DELETE: /users/:name untuk menghapus user berdasarkan name
routers.delete("/users/:name", (req, res) => {
  const { name } = req.params;

  const userIndex = users.findIndex(
    (user) => user.name.toLowerCase() === name.toLowerCase()
  );

  if (userIndex === -1) {
    return res.status(404).json({
      status: "error",
      message: "Data user tidak ditemukan",
    });
  }

  users.splice(userIndex, 1);

  res.status(200).json({
    status: "success",
    message: "User berhasil dihapus",
  });
});

module.exports = routers;
