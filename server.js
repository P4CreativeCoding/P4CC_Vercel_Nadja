const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const canvasWidth = 800;
const canvasHeight = 600;

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

io.on("connection", (socket) => {
  cars[socket.id] = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    width: 30,
    height: 30,
    color: getRandomColor(),
    dx: 0,
    dy: 0,
  };

  io.emit("refreshAll", cars);

  socket.on("disconnect", () => {
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

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
