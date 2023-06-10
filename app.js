const path = require("path");

const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

// app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.static("dist"));
app.use("public/images/", express.static("images"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  res.status(200).render("home");
});

app.get("/scrape", async (req, res) => {
  async function crawler(domain) {
    const allLinks = new Set();
    const links = new Set();

    try {
      // Initial request
      const request = await axios.get(domain);
      const htmlBody = request.data;

      const $ = cheerio.load(htmlBody);
      $("a").each(function () {
        const linkUrl = $(this).attr("href");
        console.log(linkUrl);
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  await crawler("http://localhost:3000/");

  res.status(200).render("scrape");
});

app.use(function (req, res) {
  res.status(404).render("404");
});

app.use(function (error, req, res, next) {
  res.status(500).render("500");
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
