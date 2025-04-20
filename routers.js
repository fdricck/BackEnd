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
    const { name, email } = req.body; // Ambil data dari request body

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
      data: result.ops[0], // Data user yang baru ditambahkan
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
routers.put("/users/:id", async (req, res) => {
  try {
    const db = client.db("latihan");
    const { id } = req.params; // Ambil ID dari parameter URL
    const { name, email } = req.body; // Ambil data dari request body
    const ObjectId = require("mongodb").ObjectId;

    // Validasi input
    if (!name || !email) {
      return res.status(400).json({
        status: "error",
        message: "Name dan email harus diisi",
      });
    }

    // Update data di MongoDB
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) }, // Filter berdasarkan ID
      { $set: { name, email } } // Data yang akan diupdate
    );

    // Periksa apakah user ditemukan dan diupdate
    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User berhasil diperbarui",
    });
  } catch (error) {
    // Penanganan error
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui user",
      error: error.message,
    });
  }
});

// Routing untuk delete user berdasarkan ID
routers.delete("/users/:id", async (req, res) => {
  try {
    const db = client.db("latihan");
    const { id } = req.params; // Ambil ID dari parameter URL
    const ObjectId = require("mongodb").ObjectId;

    // Hapus data di MongoDB
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) });

    // Periksa apakah user ditemukan dan dihapus
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
    // Penanganan error
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus user",
      error: error.message,
    });
  }
});

// Routing untuk mendapatkan order user (join/aggregate)
routers.get("/users/:id/orders", async (req, res) => {
  try {
    const db = client.db("latihan");
    const { id } = req.params; // Ambil ID user dari parameter URL
    const ObjectId = require("mongodb").ObjectId;

    // Validasi apakah ID valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "ID tidak valid",
      });
    }

    // Gunakan aggregation untuk join antara koleksi users dan orders
    const orders = await db
      .collection("orders")
      .aggregate([
        {
          $match: { userId: new ObjectId(id) }, // Filter berdasarkan userId
        },
        {
          $lookup: {
            from: "users", // Koleksi yang akan di-join
            localField: "userId", // Field di koleksi orders
            foreignField: "_id", // Field di koleksi users
            as: "userDetails", // Nama field hasil join
          },
        },
        {
          $unwind: "$userDetails", // Mengurai array hasil join menjadi objek
        },
      ])
      .toArray();

    // Periksa apakah ada order untuk user tersebut
    if (orders.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order untuk user tidak ditemukan",
      });
    }

    // Kirim respons sukses
    res.status(200).json({
      status: "success",
      message: "Order user berhasil diambil",
      data: orders,
    });
  } catch (error) {
    // Penanganan error
    console.error("Error:", error); // Log error untuk debugging
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil order user",
      error: error.message,
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
