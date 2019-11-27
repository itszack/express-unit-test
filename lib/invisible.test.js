const chai = require("chai");
const expect = chai.expect;

const invisible = require("./invisible");

describe("Invisible Test", () => {
  context("test function test", () => {
    it("should do nothing", () => {
      invisible.test();
      expect("this is a useless test").to.be.a("string");
    });
  });
});
