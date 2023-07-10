//https://nodejs.dev/en/learn/how-to-read-environment-variables-from-nodejs/
//einsetzten um Passwort nicht über Repo einsichtig zu machen

/*

So hats bei mir funktioniert, probier das mal
io.on("connection", function (socket) {
  console.log("Neue Verbindung hergestellt");
  socket.on("login", function (data) {
    const password = data.password;
    const requiredPassword = process.env.PASSWORD; // Umgebungsvariable laden

    if (password !== requiredPassword) {
      // Passwort ist nicht korrekt
      socket.emit("loginError", "Falsches Passwort");
      return;
    }

    */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require("path");

const canvasWidth = 800;
const canvasHeight = 600;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

app.use(cors());
app.use(express.static(__dirname + "/public"));

// Zufällige Farbe generieren
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let cars = {};

const speed = 5;

const update = setInterval(() => {
  console.log("refresh");
  for (let id1 in cars) {
    for (let id2 in cars) {
      if (id1 !== id2 && isColliding(cars[id1], cars[id2])) {
        // Cars id1 and id2 are colliding
        console.log(`Cars ${id1} and ${id2} are colliding!`);

        // Invert dx and dy values for both cars
        cars[id1].dx *= -1;
        cars[id1].dy *= -1;
        cars[id2].dx *= -1;
        cars[id2].dy *= -1;
      }
    }
  }

  for (let id in cars) {
    cars[id].x += cars[id].dx * speed;
    cars[id].y += cars[id].dy * speed;

    if (cars[id].x < 0 || cars[id].x + cars[id].width > canvasWidth) {
      cars[id].dx *= -1;
    }
    if (cars[id].y < 0 || cars[id].y + cars[id].height > canvasHeight) {
      cars[id].dy *= -1;
    }
  }

  io.emit("refreshAll", cars);
}, 1000 / 30);

function isColliding(car1, car2) {
  return (
    car1.x < car2.x + car2.width &&
    car1.x + car1.width > car2.x &&
    car1.y < car2.y + car2.height &&
    car1.y + car1.height > car2.y
  );
}

// Passwortüberprüfungsfunktion
function passwort_ueberpruefen(eingegebenes_passwort) {
  const korrektes_passwort = "PASSWORT"; // das Passwort eintragen
  return eingegebenes_passwort === korrektes_passwort;
}

// Passwortseite anzeigen
app.get("/password", (req, res) => {
  res.sendFile(__dirname + "/public/password.html");
});

// Spielseite anzeigen (nur zugänglich, wenn das Passwort korrekt eingegeben wurde)
app.get("/", (req, res) => {
  const password = req.query.password;
  if (passwort_ueberpruefen(password)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(__dirname + "/public/index.html");
  } else {
    res.status(401).send("Unauthorized");
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("password", (password) => {
    const result = passwort_ueberpruefen(password);
    socket.emit("passwordResult", result);
  });

  // Passwortüberprüfung
  socket.on("authenticate", (password) => {
    console.log("auth");
    if (passwort_ueberpruefen(password)) {
      console.log("Client authenticated:", socket.id);
      cars[socket.id] = {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        width: 30,
        height: 30,
        color: getRandomColor(),
        dx: 0,
        dy: 0,
      };
      socket.emit("authenticated", true);
      io.emit("refreshAll", cars);
    } else {
      console.log("Client authentication failed:", socket.id);
      socket.emit("authenticated", false);
      socket.emit("passwordResult", false); // Neue Zeile: Senden Sie eine Nachricht, dass das Passwort falsch ist
      socket.disconnect();
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    delete cars[socket.id];
    io.emit("refreshAll", cars);
  });

  socket.on("move", (direction) => {
    switch (direction) {
      case "ArrowLeft": // Links
        cars[socket.id].dx = -1;
        console.log("left");
        break;
      case "ArrowUp": // Hoch
        cars[socket.id].dy = -1;
        break;
      case "ArrowRight": // Rechts
        cars[socket.id].dx = 1;
        break;
      case "ArrowDown": // Runter
        cars[socket.id].dy = 1;
        break;
    }
  });
});

server.listen(port, () => {
  console.log("Server is running on port 3000");
});
