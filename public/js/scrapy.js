const domainInput = document.getElementById("domain-input");
const scrapeGoBtn = document.getElementById("scrape-btn");
const loader = document.getElementById("loader");

domainInput.onkeyup = function (e) {
  const inputValue = e.target.value;
  if (inputValue.length > 4) {
    domainInput.classList.remove("focus:outline-red-500");
    scrapeGoBtn.disabled = false;
  } else {
    domainInput.classList.add("focus:outline-red-500");
    scrapeGoBtn.disabled = true;
  }
};

scrapeGoBtn.addEventListener("click", async function (e) {
  const domain = domainInput.value;
  loader.classList.remove("hidden");

  let mainDomainName = "";
  let protocolType = "";

  if (domain.startsWith("http://")) {
    protocolType = "http";
  } else if (domain.startsWith("https://")) {
    protocolType = "https";
  } else {
    protocolType = "https";
  }

  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    const domainNameIndex = domain.indexOf("://");
    mainDomainName = domain.substring(domainNameIndex + 3, domain.length);
    if (mainDomainName.endsWith("/")) {
      mainDomainName = mainDomainName.substring(0, mainDomainName.length - 1);
    }
  } else {
    mainDomainName = domain;
    if (mainDomainName.endsWith("/")) {
      mainDomainName = mainDomainName.substring(0, mainDomainName.length - 1);
    }
  }

  try {
    const response = await fetch(`/scrape/${protocolType}/${mainDomainName}/go`);
    const data = await response.json();

    const resultTextArea = document.getElementById("result-text");
    const resultElements = document.querySelectorAll(".result-items");
    resultElements.forEach((el) => el.classList.replace("hidden", "block"));

    if (data.length < 1) {
      resultTextArea.value = "No data available";
    } else {
      let xml = `
    <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      for (const link of data) {
        xml += `\n<url>
          <loc>${link}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <priority>1</priority>
        </url>`;
      }
      xml += `\n</urlset>`;
      resultTextArea.value = xml.trim();
    }
  } catch (error) {
    loader.classList.add("hidden");
    resultTextArea.value = "No data available";
    return;
  } finally {
    loader.classList.add("hidden");
  }
});

const copyButton = document.getElementById("copy-button");
copyButton.addEventListener("click", () => {
  const copyText = document.querySelector("#copy-button span");
  copyText.textContent = "Copied!";
  setTimeout(() => {
    copyText.textContent = "Copy";
  }, 4000);
  navigator.clipboard.writeText(document.getElementById("result-text").value);
});
