const chai = require("chai");
const expect = chai.expect;

const User = require("./user");

describe("User Model Test", () => {
  it("should return error is required ares are missing", (done) => {
    const user = new User();

    user.validate((err) => {
      expect(err.errors.name).to.exist;
      expect(err.errors.email).to.exist;
      expect(err.errors.age).to.not.exist;

      done();
    });
  });

  it("should have optional age field", (done) => {
    const user = new User({ name: "Foo", email: "foo@bar.com", age: 25 });

    expect(user).to.have.property("age").to.equal(25);
    
    done();
  });
});
