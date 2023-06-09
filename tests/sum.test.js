const subtractFunction = require("../substract");
const sumFunctions = require("../sum");

const { sum, checkArr } = sumFunctions;
const { subtract, getUserData } = subtractFunction;

describe("testing the sum functions", () => {
  test("should return the sum of the numbers", () => {
    expect(sum(1, 3)).toBe(4);
  });

  test("should return the sum of all numbers in the array", () => {
    expect(checkArr([1, 2, 3, 4])).toBe(10);
  });

  test("object assignment", () => {
    const obj = {};
    expect(obj).toEqual({});
  });
});

describe("truthy or falsy", () => {
  test("null", () => {
    const n = 0;
    expect(n).toBeFalsy();
    expect(n).not.toBeTruthy();
    // expect(n).not.toBeUndefined()
  });
});

describe("numbers", () => {
  test("two plus two", () => {
    const value = 2 + 2;
    expect(value).toBe(4);
    expect(value).toBeGreaterThan(3);
    expect(value).toBeLessThan(5);
    expect(value).toBeGreaterThanOrEqual(3);
    expect(value).toBeLessThanOrEqual(4);
  });

  test("adding floats", () => {
    const value = 0.1 + 0.2;
    expect(value).toBeCloseTo(0.299999999999999999);
  });
});

describe("strings", () => {
  test("there is no I in team", () => {
    expect("team").not.toMatch(/I/);
  });
});

describe("subtracting function", () => {
  test("validating subtracting function", () => {
    expect(subtract(4, 2)).toBe(2);
  });
});

describe("testing promises", () => {
  test("validating user data fetched", async () => {
    const data = await getUserData();

    const userData = {
      name: "Benjamin Nkem",
      skills: ["Web Dev", "Freelancing", "Wordpress", "Game Dev"],
    };

    expect(data).toEqual(userData);
  });
});
