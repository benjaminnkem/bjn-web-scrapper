const path = require("path");

const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

// app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use("public/images/", express.static("images"));
app.use(express.static("public"));
app.use(express.static("dist"));
app.use(express.static("node_modules/remixicon/fonts/"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  res.status(200).render("home");
});

app.get("/scrape", async (req, res) => {
  res.status(200).render("scrape");
});

app.get("/scrape/:protocol/:domain/go", async (req, res) => {
  const { protocol, domain } = req.params;
  const mainUrl = `${protocol}://${domain}`;

  const allLinks = new Set();

  try {
    async function sendRequests(url) {
      const request = await axios.get(url);
      const htmlBody = request.data;

      return htmlBody;
    }

    function cleanUrls(url) {
      if (url.startsWith(`${protocol}://${domain}`)) {
        allLinks.add(url);
      } else if (url.startsWith("/") && !url.endsWith("/")) {
        allLinks.add(`${protocol}://${domain}${url}`);
      } else {
        return;
      }
    }

    // Initial request.........
    const $ = cheerio.load(await sendRequests(mainUrl));
    $("a").each(function () {
      const linkUrl = $(this).attr("href");
      cleanUrls(linkUrl);
    });

    let currentListIndex = 0;
    let nextListIndex = 5;
    // Consecutive requests
    const convertedList = Array.from(allLinks).slice(currentListIndex, nextListIndex);
    async function crawlOtherLinks(allLinks) {
      for (const link of convertedList) {
        const $ = cheerio.load(await sendRequests(link));
        $("a").each(function () {
          const linkUrl = $(this).attr("href");
          cleanUrls(linkUrl);
        });
      }
    }
  } catch (error) {
    throw new Error(error);
  }

  res.status(200).json(Array.from(allLinks));
});

app.use(function (req, res) {
  res.status(404).render("404");
});

app.use(function (error, req, res, next) {
  res.status(500).render("500");
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
