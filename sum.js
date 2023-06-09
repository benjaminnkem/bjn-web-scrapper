function sum(a, b) {
  return a + b;
}

function checkArr(array) {
  const result = array.reduce((prevValue, num) => {
    return prevValue + num;
  }, 0);
  return result;
}

function junk() {
  const fruits = ["apple", "mango", "pawpaw", "cherry", "pear", "banana", "coconut"];
  const filteredFruits = fruits.filter((fruit) => fruit.length > 4);
  filteredFruits.pop();

  const isHigh = filteredFruits.every((item) => item.length > 6);
  console.log(filteredFruits, isHigh);
}

module.exports = { sum, checkArr };
