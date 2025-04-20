const express = require("express");
const routers = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const client = require("./mongodb");
const upload = multer({ dest: "public" });

// jika ingin upload file image saja
// const imageFilter = (req, file, cb) => {
//   if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//     return cb(null, false);
//   }
//   cb(null, true);
// };

// const upload = multer({ dest: "public", fileFilter: imageFilter });

// Routing
routers.get("/users", async (req, res) => {
  try {
    const db = client.db("latihan");
    const users = await db.collection("users").find().toArray();
    res.json({
      status: "success",
      message: "list users",
      data: users,
    });
  } catch (error) {
    res.json({
      status: "error",
    });
  }
});

// Routing untuk mendapatkan detail user berdasarkan ID
routers.get("/users/:id", async (req, res) => {
  try {
    const db = client.db("latihan");
    const { id } = req.params;
    const ObjectId = require("mongodb").ObjectId;

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Detail user",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail user",
      error: error.message,
    });
  }
});

// Routing untuk insert user
routers.post("/users", async (req, res) => {
  try {
    const db = client.db("latihan");
    const { name, email } = req.body;

    // Validasi input
    if (!name || !email) {
      return res.status(400).json({
        status: "error",
        message: "Name dan email harus diisi",
      });
    }

    // Insert data ke MongoDB
    const result = await db.collection("users").insertOne({ name, email });

    // Kirim respons sukses
    res.status(201).json({
      status: "success",
      message: "User berhasil ditambahkan",
      data: result.ops[0],
    });
  } catch (error) {
    // Penanganan error
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menambahkan user",
      error: error.message,
    });
  }
});

// Routing untuk update user berdasarkan ID
// update user
routers.patch("/users/:id", async (req, res) => {
  try {
    const db = client.db("latihan");
    const user = await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: req.body,
      }
    );

    if (user.modifiedCount > 0) {
      res.status(200).json({
        status: "success",
        message: "Update User",
        data: user,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "User not found or no changes made",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update user",
    });
  }
});

// Routing untuk delete user berdasarkan ID
routers.delete("/users/:id", async (req, res) => {
  try {
    const db = client.db("latihan");
    const { id } = req.params;
    const ObjectId = require("mongodb").ObjectId;

    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus user",
      error: error.message,
    });
  }
});

// Routing untuk mendapatkan order user (join/aggregate)
routers.get("/order/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
      });
    }

    const db = client.db("latihan");

    const orders = await db
      .collection("order")
      .aggregate([
        {
          $match: {
            UserId: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "UserId",
            foreignField: "_id",
            as: "user_info",
          },
        },
        {
          $unwind: "$user_info",
        },
        {
          $project: {
            _id: 1,
            product: 1,
            price: 1,
            "user_info._id": 1,
            "user_info.name": 1,
            "user_info.age": 1,
            "user_info.status": 1,
          },
        },
      ])
      .toArray();

    res.status(200).json({
      status: "success",
      message: "Get Order by User",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to get order user",
    });
  }
});

// Routing
routers.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (file) {
    const target = path.join(__dirname, "public", file.originalname);
    fs.renameSync(file.path, target); //rename file agar sama dengan nama aslinya
    res.send("file berhasil diupload");
  } else {
    res.send("file gagal");
  }
});

routers.get("/download", (req, res) => {
  const filename = "unklab_logo.png";
  res.download(path.join(__dirname + "/download/" + filename), "mantap.png");
});

routers.post("/login", (req, res) => {
  const { username, password } = req.body;
  res.status(200).json({
    status: "success",
    message: "Login page",
    data: {
      username: username,
      password: password,
    },
  });
});
routers.get("/", (req, res) => res.send("Hello World"));
routers.get("/about", (req, res) =>
  res.status(200).json({
    status: "success",
    message: "About page",
    data: [],
  })
);
routers.post("/contoh", (req, res) => res.send("request method POST"));
routers.put("/contoh", (req, res) => res.send("Request method PUT"));
routers.delete("/contoh", (req, res) => res.send("Request method DELETE"));
routers.patch("/contoh", (req, res) => res.send("Request method PATCH"));

routers.all("/universal", (req, res) =>
  res.send(`Request method ${req.method}`)
);
// Routing dinamis
// 1. Menggunakan params
routers.get("/post/:id", (req, res) =>
  res.send(`Artikel ke - ${req.params.id}`)
);
// 2. Menggunakan Query String
routers.get("/post", (req, res) => {
  const { page, sort } = req.query;
  res.send(`Query string= page :${page}, sort : ${sort}`);
});

module.exports = routers;
