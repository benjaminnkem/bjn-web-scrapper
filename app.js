const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 8000;

const scraper = require("./routes/scraper");

// app.use(express.json())
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use("public/images/", express.static("images"));
app.use(express.static("public"));
app.use(express.static("dist"));
app.use(express.static("node_modules/remixicon/fonts/"));
app.use(scraper);

app.get("/", async (req, res) => {
  res.status(200).render("home");
});

app.use(function (req, res) {
  res.status(404).render("404");
});

app.use(function (error, req, res, next) {
  res.status(500).render("500");
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
