const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;

let password = "NADJA"; // Initialwert für das Passwort

app.use(express.json()); // Middleware zum Parsen von JSON-Daten

// Endpunkt zum Setzen des Passworts
app.post("/setPassword", (req, res) => {
  const { newPassword } = req.body;
  password = newPassword;
  res.sendStatus(200);
});

// Endpunkt zum Überprüfen des Passworts
app.post("/checkPassword", (req, res) => {
  const { enteredPassword } = req.body;
  if (enteredPassword === password) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Statische Dateien bereitstellen
app.use(express.static(__dirname + "/public"));

// WebSocket-Verbindung herstellen
io.on("connection", (socket) => {
  console.log("Ein Benutzer hat sich verbunden");

  // Event-Handler für Bewegungsdaten des roten Autos
  socket.on("redCarMovement", (movement) => {
    socket.broadcast.emit("redCarMovement", movement);
  });

  // Event-Handler für Bewegungsdaten des blauen Autos
  socket.on("blueCarMovement", (movement) => {
    socket.broadcast.emit("blueCarMovement", movement);
  });

  // Event-Handler für Verbindungsabbruch
  socket.on("disconnect", () => {
    console.log("Ein Benutzer hat die Verbindung getrennt");
  });
});

// Server starten
server.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
