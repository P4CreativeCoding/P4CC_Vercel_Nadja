// Größe der Spielfläche
const canvasWidth = 800;
const canvasHeight = 600;

// Autos
const cars = [];

// Erstellen des Canvas-Elements
const canvas = document.getElementById("gameCanvas");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const context = canvas.getContext("2d");

// Hinzufügen eines neuen Autos
function addCar() {
  const car = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    width: 30,
    height: 30,
    color: getRandomColor(),
    dx: 0,
    dy: 0,
  };
  cars.push(car);
}

// Zufällige Farbe generieren
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Tastatursteuerung
window.addEventListener("keydown", handleKeyDown);

function handleKeyDown(event) {
  const car = cars.find((car) => car.color === event.key);
  if (car) {
    switch (event.keyCode) {
      case 37: // Links
        car.dx = -1;
        break;
      case 38: // Hoch
        car.dy = -1;
        break;
      case 39: // Rechts
        car.dx = 1;
        break;
      case 40: // Runter
        car.dy = 1;
        break;
    }
  }
}

window.addEventListener("keyup", handleKeyUp);

function handleKeyUp(event) {
  const car = cars.find((car) => car.color === event.key);
  if (car) {
    switch (event.keyCode) {
      case 37: // Links
      case 39: // Rechts
        car.dx = 0;
        break;
      case 38: // Hoch
      case 40: // Runter
        car.dy = 0;
        break;
    }
  }
}

// Kollisionserkennung
function checkCollision(car1, car2) {
  return (
    car1.x < car2.x + car2.width &&
    car1.x + car1.width > car2.x &&
    car1.y < car2.y + car2.height &&
    car1.y + car1.height > car2.y
  );
}

// Spiel-Update
function update() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // Autos bewegen
  cars.forEach((car) => {
    car.x += car.dx;
    car.y += car.dy;

    // Kollision mit Spielfeldrändern
    if (car.x < 0 || car.x + car.width > canvasWidth) {
      car.dx *= -1;
    }
    if (car.y < 0 || car.y + car.height > canvasHeight) {
      car.dy *= -1;
    }

    // Kollision mit anderen Autos
    cars.forEach((otherCar) => {
      if (car !== otherCar && checkCollision(car, otherCar)) {
        car.dx *= -1;
        car.dy *= -1;
      }
    });

    // Auto zeichnen
    context.fillStyle = car.color;
    context.fillRect(car.x, car.y, car.width, car.height);
  });

  requestAnimationFrame(update);
}

// Spiel starten
addCar();
update();
