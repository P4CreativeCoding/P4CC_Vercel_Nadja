let socket = io.connect("localhost:3000");

document.getElementById("submitButton").addEventListener("click", (e) => {
  console.log("button clicked");
  const password = document.getElementById("passwordInput").value;
  socket.emit("authenticate", password);
});

socket.on("authenticated", (authenticated) => {
  if (authenticated) {
    alert("richtig");
    //window.location.href = "/"; // Weiterleitung zur Spielseite
  } else {
    alert("Falsches Passwort");
  }
});

socket.on("refreshAll", (data) => {
  cars = data;
  console.log("refreshed");
});

// Größe der Spielfläche
const canvasWidth = 800;
const canvasHeight = 600;

// Autos
let cars = {};

socket.on("passwordResult", (result) => {
  if (result) {
    socket.emit("authenticate", document.getElementById("passwordInput").value);
  } else {
    alert("Falsches Passwort");
  }
});

// Erstellen des Canvas-Elements
const canvas = document.getElementById("gameCanvas");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const context = canvas.getContext("2d");

// Tastatursteuerung
window.addEventListener("keydown", (event) => {
  if (
    event.code === "ArrowUp" ||
    event.code === "ArrowDown" ||
    event.code === "ArrowLeft" ||
    event.code === "ArrowRight"
  ) {
    socket.emit("move", event.code);
  }

  //const car = cars.find((car) => car.color === event.key);
  //if (car) {

  // switch (event.code) {
  //   case "ArrowLeft": // Links
  //     cars[0].dx = -1;
  //     break;
  //   case "ArrowUp": // Hoch
  //     cars[0].dy = -1;
  //     break;
  //   case "ArrowRight": // Rechts
  //     cars[0].dx = 1;
  //     break;
  //   case "ArrowDown": // Runter
  //     cars[0].dy = 1;
  //     break;
  // }
  //}
});

// Kollisionserkennung
/*function checkCollision(car1, car2) {
  return (
    car1.x < car2.x + car2.width &&
    car1.x + car1.width > car2.x &&
    car1.y < car2.y + car2.height &&
    car1.y + car1.height > car2.y
  );
}*/

// Spiel-Update
function update() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // Autos bewegen und Kollisionserkennung
  for (let id in cars) {
    const car = cars[id];
    car.x += car.dx * speed;
    car.y += car.dy * speed;

    if (car.x < 0 || car.x + car.width > canvasWidth) {
      car.dx *= -1;
    }
    if (car.y < 0 || car.y + car.height > canvasHeight) {
      car.dy *= -1;
    }

    for (let otherId in cars) {
      if (id !== otherId && isColliding(car, cars[otherId])) {
        car.dx *= -1;
        car.dy *= -1;
      }
    }

    context.fillStyle = car.color;
    context.fillRect(car.x, car.y, car.width, car.height);
  }

  // Autos bewegen
  // cars.forEach((car) => {
  //   car.x += car.dx;
  //   car.y += car.dy;

  //   // Kollision mit Spielfeldrändern
  //   if (car.x < 0 || car.x + car.width > canvasWidth) {
  //     car.dx *= -1;
  //   }
  //   if (car.y < 0 || car.y + car.height > canvasHeight) {
  //     car.dy *= -1;
  //   }

  //   // Kollision mit anderen Autos
  //   cars.forEach((otherCar) => {
  //     if (car !== otherCar && checkCollision(car, otherCar)) {
  //       car.dx *= -1;
  //       car.dy *= -1;
  //     }
  //   });

  //  Auto zeichnen
  if (cars) {
    for (let id in cars) {
      context.fillStyle = cars[id].color;
      context.fillRect(cars[id].x, cars[id].y, cars[id].width, cars[id].height);
    }
  }
  //
  // });
  // console.log(cars);
  requestAnimationFrame(update);
}

// Spiel starten
update();
