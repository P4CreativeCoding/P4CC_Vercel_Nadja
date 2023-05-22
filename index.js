const app = require("express")();
const { v4 } = require("uuid");

let wtfCounter = 0;
const wtfTimestamps = [];

let splendidCounter = 0;
const splendidTimestamps = [];

app.post("/api/wtf", (req, res) => {
  const now = Date.now();
  wtfCounter++;
  wtfTimestamps.push(now);
  res.status(200).send({ message: "WTF received" });
});
app.post("/api/splendid", (req, res) => {
  const now = Date.now();
  splendidCounter++;
  splendidTimestamps.push(now);
  res.status(200).send({ message: "Splendid received" });
});

app.get("/api/wtf-per-minute", (req, res) => {
  const oneMinuteAgo = Date.now() - 60 * 1000;

  // Remove outdated timestamps
  while (wtfTimestamps.length > 0 && wtfTimestamps[0] < oneMinuteAgo) {
    wtfTimestamps.shift();
  }

  res.status(200).send({ wtfPerMinute: wtfTimestamps.length });
});
app.get("/api/splendid-per-minute", (req, res) => {
  const oneMinuteAgo = Date.now() - 60 * 1000;

  // Remove outdated timestamps
  while (
    splendidTimestamps.length > 0 &&
    splendidTimestamps[0] < oneMinuteAgo
  ) {
    splendidTimestamps.shift();
  }

  res.status(200).send({ splendidPerMinute: splendidTimestamps.length });
});

app.get("/api/ratio", (req, res) => {
  const totalSubmits = splendidCounter + wtfCounter;
  const splendidPercentage =
    Math.round((splendidCounter / totalSubmits) * 100) || 0;
  const wtfPercentage = Math.round((wtfCounter / totalSubmits) * 100) || 0;
  const ratio = Math.round((wtfCounter / splendidCounter) * 100) / 100 || 0;
  res.status(200).send({
    wtfPercentage: `${wtfPercentage}%`,
    splendidPercentage: `${splendidPercentage}%`,
    wtfSplendidRatio: ratio,
  });
});

module.exports = app;
