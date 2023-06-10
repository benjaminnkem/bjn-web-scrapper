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

    console.log(data);
  } catch (error) {
    loader.classList.add("hidden");
    // throw new Error(error);
    return;
  } finally {
    loader.classList.add("hidden");
  }

  loader.classList.add("hidden");
});
