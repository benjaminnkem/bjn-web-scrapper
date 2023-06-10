function fibonacci(number) {
  let result = 1;
  for (let i = 1; i <= number; i++) {
    result *= i;
  }

  return result;
}



async function myCrawler(domain) {
  let allLinks = [];
  const links = [];

  function cleanTheUrl(url) {
    let cleanUrl = "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("/")) {
      cleanUrl = `${domain}${trimmedUrl.trim()}`;
    } else if (trimmedUrl.startsWith("#") || !trimmedUrl.startsWith(domain)) {
      return null;
    } else {
      cleanUrl = trimmedUrl.trim();
    }

    return cleanUrl;
  }

  // let uncleanLinks = []
  try {
    const response = await axios.get(domain);
    const html = response.data;

    const $ = cheerio.load(html);
    $("a", html).each(function () {
      const url = $(this).attr("href");
      console.log(url.trim());
      if (url.startsWith("/")) {
        links.push(`${domain}${url.trim()}`);
      } else if (url.startsWith("#") || !url.startsWith(domain)) {
        return null;
      } else {
        links.push(url.trim());
      }
      links.push(url.trim());
    });
  } catch (e) {
    throw new Error(e);
  }

  async function gottenLinks(freshLinks) {
    // console.log(freshLinks)
    const newLinksToCrawl = [];
    freshLinks.forEach((url) => {
      newLinksToCrawl.push(url);
    });

    const duplicateFreeLinks = [...new Set(newLinksToCrawl)];
    allLinks.push(duplicateFreeLinks);

    for (const readyLink of duplicateFreeLinks.slice(0, 5)) {
      try {
        const response = await axios.get(readyLink);
        const html = response.data;
        const $ = cheerio.load(html);

        const newLinkList = [];
        // const $linksFound =
        $("a", html).each(function () {
          const url = $(this).attr("href");
          if (!links.includes(cleanTheUrl(url)) && url.length > 0 && url !== "") {
            links.push(cleanTheUrl(url));
          }
        });
      } catch (e) {
        throw new Error(e);
      }
    }
  }

  await gottenLinks(links);
  return [...new Set(allLinks)];
}
