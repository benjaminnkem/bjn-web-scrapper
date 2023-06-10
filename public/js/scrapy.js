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
  e.preventDefault();
  const domain = domainInput.value;

  loader.classList.remove("hidden");
  const response = await fetch(domain);
  const data = await response.json();

  console.log(data);

  if (!response.ok) {
    loader.classList.add("hidden");
  }

  loader.classList.add("hidden");
});
