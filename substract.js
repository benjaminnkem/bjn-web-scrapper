function subtract(num1, num2) {
  return num1 - num2;
}

function getUserData() {
  return new Promise((resolve, reject) => {
    const userData = {
      name: "Benjamin Nkem",
      skills: ["Web Dev", "Freelancing", "Wordpress", "Game Dev"],
    };

    resolve(userData);
  });
}

module.exports = { subtract, getUserData };
