const { assert } = require('chai');

const { checkForEmail, generateRandomString, idFromEmail, lookForCookie, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDB = {
  url1: {
    longURL: 'http://www.nbc.ca',
    userID: "userRandomID"
  },
  url2: {
    longURL: 'http://www.abc.com',
    userID:"userRandomID"
  },
  url3: {
    longURL: 'http://www.nfl.com',
    userID: "user2RandomID"
  }
}

//tests for idFromEmail
describe('idFromEmail', () => {
  it('should return a user with valid email', () => {
    const user = idFromEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.equal(user, expectedUserID);
  });
  it('should return undefined when no email is found', () => {
    const user = idFromEmail("user3@example.com", testUsers);
    const expectedUserID = undefined;

    assert.equal(user, expectedUserID);
  });
});

//tests for checkForEmail
describe("checkForEmail", () => {
  it('return true if email is in the database', () => {
    const email = checkForEmail("user@example.com", testUsers);

    assert.isTrue(email)
  });
  it('return false if email is not in the database', () => {
    const email = checkForEmail("user3@example.com", testUsers);

    assert.isFalse(email)
  });
});

// tests for lookForCookie
describe("lookForCookie", () => {
  it("should return true if cookie found", () => {
    const cookie = lookForCookie("userRandomID", testUsers);

    assert.isTrue(cookie);
  });
  it("should return false if no cookie found", () => {
    const cookie = lookForCookie("user3RandomID", testUsers);

    assert.isFalse(cookie);
  });
});

//tests for urlsForUser
describe("urlsForUser", () => {
  it("should return an object of the users urls", () => {
    const userURL = urlsForUser("userRandomID", testDB);
    const expected = {
      url1: {
        longURL: 'http://www.nbc.ca',
        userID: "userRandomID"
      },
      url2: {
        longURL: 'http://www.abc.com',
        userID:"userRandomID"
      }
    }

    assert.deepEqual(userURL, expected);
  });
  it("should return an empty object if user has no urls", () => {
    const userURL = urlsForUser("user5RandomID", testDB);
    const expected = {};

    assert.deepEqual(userURL, expected);
  });
});

// test generateRandomString
describe("generateRandomString", () => {
  it("should return a 6 character string", () => {
    const stringLength = generateRandomString().length;

    assert.equal(stringLength, 6);
  });
  it("should returntwo different strings", () => {
    const stringOne = generateRandomString();
    const stringTwo = generateRandomString();

    assert.notEqual(stringOne, stringTwo);
  });
});