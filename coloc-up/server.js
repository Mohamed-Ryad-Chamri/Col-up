const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const db = new sqlite3.Database("./database.db");

app.use(bodyParser.json());
app.use(express.static("public"));

// DB setup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price TEXT,
    images TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    listing_id INTEGER,
    paid INTEGER
  )`);

  db.get("SELECT COUNT(*) as count FROM listings", (err, row) => {
    if (row.count === 0) {
      db.run(`
        INSERT INTO listings (title, price, images) VALUES
        ('Studio Casablanca', '2900 MAD', 'public/images/room1.jpg'),
        ('Colocation Kenitra', '1800 MAD', 'public/images/room2.jpg'),
        ('Appartement Rabat', '4800 MAD', 'public/images/room3.jpg'),
        ('Appartement Rabat', '3300 MAD', 'public/images/room4.jpg'),
        ('Chambre Impériale Rabat', '5300 MAD', 'public/images/room5.jpg'),
        ('Chambre Double Supérieur Rabat', '6700 MAD', 'public/images/room6.jpg'),
        ('Studio Casablanca CFC', '3300 MAD', 'public/images/room7.jpg'),
        ('Chambre Tanger luxueuse', '3100 MAD', 'public/images/room8.jpg'),
        ('Chambre Rabat Hay Riad', '8100 MAD', 'public/images/room9.jpg'),
        ('Chambre Rabat Agdal', '4800 MAD', 'public/images/room10.jpg'),
        ('Studio Double CFC', '2300 MAD', 'public/images/room11.jpg'),
        ('Chambre Villa Rabat', '10300 MAD', 'public/images/room12.jpg')
      `);
    }
  });
});

// AUTH
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
  res.send("User created");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username=? AND password=?", [username, password],
    (err, row) => {
      if (row) res.json(row);
      else res.status(401).send("Invalid");
    });
});

// DATA
app.get("/listings", (req, res) => {
  db.all("SELECT * FROM listings", (err, rows) => res.json(rows));
});

app.post("/book", (req, res) => {
  const { user_id, listing_id } = req.body;
  db.run(
    "INSERT INTO bookings (user_id, listing_id, paid) VALUES (?, ?, 0)",
    [user_id, listing_id],
    function () {
      res.json({ booking_id: this.lastID });
    }
  );
});

app.post("/pay", (req, res) => {
  const { booking_id } = req.body;
  db.run("UPDATE bookings SET paid=1 WHERE id=?", [booking_id]);
  res.send("Paid");
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));