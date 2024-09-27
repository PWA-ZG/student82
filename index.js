const express = require("express");
const path = require("path");
const cors = require("cors");
const httpPort = 80;

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/gallery", function (req, res) {
  res.sendFile(path.join(__dirname, "gallery.html"));
});

app.listen(httpPort, function () {
  console.log(`HTTP listening on port: ${httpPort}`);
});
