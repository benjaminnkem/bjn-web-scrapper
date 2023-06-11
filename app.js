const path = require("path");
const fs = require("fs");

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
  const visitedLinks = new Set();

  async function sendRequests(url) {
    const request = await axios.get(url);
    const htmlBody = request.data;

    return htmlBody;
  }

  function hasVisited(link) {
    return visitedLinks.has(link);
  }

  function cleanUrls(url, setToAddTo) {
    if (url.startsWith(`${protocol}://${domain}`) && !url.endsWith("/")) {
      setToAddTo.add(url);
      visitedLinks.add(url);
    } else if (url.startsWith("/") && !url.endsWith("/")) {
      setToAddTo.add(`${protocol}://${domain}${url}`);
      visitedLinks.add(`${protocol}://${domain}${url}`);
    } else if (url.startsWith("/") && url.endsWith("/")) {
      setToAddTo.add(`${protocol}://${domain}${url.substring(0, url.length - 1)}`);
      visitedLinks.add(`${protocol}://${domain}${url.substring(0, url.length - 1)}`);
    } else {
      return;
    }
  }

  function retrieveCleanUrl(url) {
    if (url.startsWith(`${protocol}://${domain}`) && !url.endsWith("/")) {
      return url;
    } else if (url.startsWith("/") && !url.endsWith("/")) {
      return `${protocol}://${domain}${url}`;
    } else if (url.startsWith("/") && url.endsWith("/")) {
      return `${protocol}://${domain}${url.substring(0, url.length - 1)}`;
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
  } catch (error) {
    console.log(error.message);
  }

  try {
    // // Consecutive requests
    // let currentListIndex = 0;
    // let nextListIndex = 20;
    // let convertedList = Array.from(allLinks).slice(currentListIndex, nextListIndex);

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

    async function crawlOtherLinks(links) {
      const gottenLinks = new Set();
      // This just loops through the first links of the "allLinks" list
      async function repeatCrawling(links) {
        for (const link of links) {
          const $ = cheerio.load(await sendRequests(link));
          $("a").each(function () {
            const linkUrl = $(this).attr("href");
            if (!hasVisited(retrieveCleanUrl(linkUrl))) {
              cleanUrls(linkUrl, gottenLinks);
              cleanUrls(linkUrl, allLinks);
            }
          });
        }
      }

      // Initial crawl repeat results
      await repeatCrawling(links);

      while (gottenLinks.size <= 5000) {
        // This just loops through consecutive links of the "gottenLinks" list
        await repeatCrawling([...gottenLinks]);
      }

      console.log("Crawling completed!", visitedLinks.size, gottenLinks.size);

      for (const newLink of gottenLinks) {
        allLinks.add(newLink);
      }
    }

    await crawlOtherLinks([...allLinks]);

    // Creating the XML document

    const directory = './sitemaps'
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }

    const filePath = "./sitemaps/sitemap.xml";
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (const link of allLinks) {
      xml += `<url>
        <loc>${link}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1</priority>
      </url>`;
    }
    xml += "</urlset>";

    fs.writeFileSync(filePath, xml, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (error) {
    console.log(error);
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
