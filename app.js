const path = require("path");

const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8000;

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

  async function sendRequests(url) {
    const request = await axios.get(url);
    const htmlBody = request.data;

    return htmlBody;
  }

  function cleanUrls(url, setToAddTo) {
    if (url.startsWith(`${protocol}://${domain}`)) {
      setToAddTo.add(url);
    } else if (url.startsWith("/") && !url.endsWith("/")) {
      setToAddTo.add(`${protocol}://${domain}${url}`);
    } else {
      return;
    }
  }

  try {
    // Initial request.........
    const $ = cheerio.load(await sendRequests(mainUrl));
    $("a").each(function () {
      const linkUrl = $(this).attr("href");
      cleanUrls(linkUrl, allLinks);
    });

    // Consecutive requests
    let currentListIndex = 0;
    let nextListIndex = 20;
    let convertedList = Array.from(allLinks).slice(currentListIndex, nextListIndex);

    // async function crawlOtherLinks() {
    //   if (nextListIndex <= Array.from(allLinks).length) {
    //     for (let i = 0; i < nextListIndex; i += 5) {
    //       for (const link of convertedList) {
    //         currentListIndex += 5;
    //         nextListIndex += 5;

    //         convertedList = Array.from(allLinks).slice(currentListIndex, nextListIndex);
    //         const $ = cheerio.load(await sendRequests(link));
    //         $("a").each(function () {
    //           const linkUrl = $(this).attr("href");
    //           cleanUrls(linkUrl);
    //         });
    //       }
    //     }
    //   } else {
    //     const remainingNumberOfLinks = Array.from(allLinks).length - nextListIndex;
    //     currentListIndex += remainingNumberOfLinks;
    //     nextListIndex += remainingNumberOfLinks;
    //   }
    // }
  } catch (error) {
    console.log(error.message);
  }

  try {
    const gottenLinks = new Set();
    async function crawlOtherLinks(links) {
      for (const link of links) {
        console.log(link);
        const $ = cheerio.load(await sendRequests(link));
        $("a").each(function () {
          const linkUrl = $(this).attr("href");
          cleanUrls(linkUrl, gottenLinks);
        });
      }

      for (const newLink of gottenLinks) {
        allLinks.add(newLink);
      }
    }

    await crawlOtherLinks([...allLinks]);
  } catch (error) {
    console.log(error.message);
  }

  res.status(200).json([...allLinks]);
});

app.use(function (req, res) {
  res.status(404).render("404");
});

app.use(function (error, req, res, next) {
  res.status(500).render("500");
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
