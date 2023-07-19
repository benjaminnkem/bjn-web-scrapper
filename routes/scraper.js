const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const router = express.Router();

router.get("/scrape", async (req, res) => {
  res.status(200).render("scrape");
});

router.get("/scrape/:protocol/:domain/go", async (req, res) => {
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
    // Initial request...
    const $ = cheerio.load(await sendRequests(mainUrl));
    $("a").each(function () {
      const linkUrl = $(this).attr("href");
      cleanUrls(linkUrl, allLinks);
    });
  } catch (error) {
    console.log(error.message);
  }

  try {
    async function crawlOtherLinks(links) {
      const gottenLinks = new Set();
      async function repeatCrawling(links) {
        for (const link of links) {
          if (visitedLinks.has(link)) return;

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

      let timeLimit = 0;
      while (timeLimit < 100 && gottenLinks.size <= 5000) {
        timeLimit++;
        console.log(timeLimit);
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
    const directory = "./sitemaps";
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

module.exports = router;
