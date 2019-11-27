const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const mongoose = require("mongoose");
const rewire = require("rewire");

let users = require("./users");
const User = require("./models/user");
const mailer = require("./mailer");

const sandbox = sinon.createSandbox();

describe("Users Test", () => {
  let findStub;
  let deleteStub;
  let mailerStub;
  let user;

  beforeEach(() => {
    user = { id: 123, name: "Foo", email: "foo@bar.com", save: sandbox.stub().resolves() };

    findStub = sandbox.stub(mongoose.Model, "findById").resolves(user);
    deleteStub = sandbox.stub(mongoose.Model, "remove").resolves("fake_remove_result");
    mailerStub = sandbox.stub(mailer, "sendWelcomeEmail").resolves("fake_email");
  });

  afterEach(() => {
    // resets every spy, stub and call count
    sandbox.restore();
    users = rewire("./users");
  });

  context("get test", () => {
    it("should check for an id", (done) => {
      users.get(null, (err, result) => {
        expect(err).to.exist;
        expect(err.message).to.equal("Invalid user id");

        done();
      });
    });

    it("should call findUserById and return result", (done) => {
      sandbox.restore();

      const stub = sandbox.stub(mongoose.Model, "findById").yields(null, { name: "Foo" });

      users.get(123, (err, result) => {
        expect(err).to.not.exist;
        expect(stub).to.have.been.calledOnce;
        expect(stub).to.have.been.calledWith(123);
        expect(result).to.be.a("object");
        expect(result).to.have.property("name").to.equal("Foo");

        done();
      });
    });

    it("should catch error if error exist", (done) => {
      sandbox.restore();

      const stub = sandbox.stub(mongoose.Model, "findById").yields(new Error("Fake"));

      users.get(123, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.exist;
        expect(err).to.be.instanceOf(Error);
        expect(stub).to.have.been.calledWith(123);
        expect(err.message).to.equal("Fake");

        done();
      });
    });
  });

  context("delete test", () => {
    it("should check for an id", () => {
      return users.delete()
        .then((result) => {
          throw new Error("Unexpected sucess");
        }).catch((error) => {
          expect(error).to.be.instanceOf(Error);
          expect(error.message).to.equal("Invalid id");
        });
    });

    it("should check for error using eventually", () => {
      return expect(users.delete()).to.eventually.be.rejectedWith("Invalid id");
    });

    it("should call user.remove", async () => {
      const result = await users.delete(123);

      expect(result).to.equal("fake_remove_result");
      expect(deleteStub).to.have.been.calledWith({ _id: 123 });
    });
  });

  context("create test", () => {
    let FakeUserClass, saveStub, result;

    beforeEach(async () => {
      saveStub = sandbox.stub().resolves(user);
      FakeUserClass = sandbox.stub().returns({ save: saveStub });

      users.__set__("User", FakeUserClass);
      result = await users.create(user);
    });

    it("should reject invalid arguments", async () => {
      await expect(users.create()).to.eventually.be.rejectedWith("Invalid arguments");
      await expect(users.create({ name: "Foo" })).to.eventually.be.rejectedWith("Invalid arguments");
      await expect(users.create({ email: "foo@bar.com" })).to.eventually.be.rejectedWith("Invalid arguments");
    });

    it("should call User with new keyword", () => {
      expect(FakeUserClass).to.have.been.calledWithNew;
      expect(FakeUserClass).to.have.been.calledWith(user);
    });

    it("should save the user", () => {
      expect(saveStub).to.have.been.called;
    });

    it("shoudl call mailer with email and name", () => {
      expect(mailerStub).to.have.been.calledWith(user.email, user.name);
    });

    it("should reject errors", async () => {
      saveStub.rejects(new Error("Fake"));

      await expect(users.create(user)).to.eventually.be.rejectedWith("Fake");
    });
  });

  context("update test", () => {
    it("should find user by id", async () => {
      await users.update(123, { age: 25 });

      expect(findStub).to.have.been.calledWith(123);
    });

    it("should call user.save", async () => {
      await users.update(123, { age: 25 });

      expect(user.save).to.have.been.calledOnce;
    });

    it("shoudl reject if error exist", async () => {
      findStub.throws(new Error("Fake"));

      await expect(users.update(123, { age: 25 })).to.eventually.be.rejectedWith("Fake");
    });
  });

  context("resetPassword test", () => {
    let resetStub;

    beforeEach(() => {
      resetStub = sandbox.stub(mailer, "sendPasswordResetEmail").resolves("reset");
    });

    it("should check for email", async () => {
      await expect(users.resetPassword()).to.be.rejectedWith("Invalid email");
    });

    it("should call sendPasswordResetEmail", async () => {
      await users.resetPassword("foo@bar.com");

      expect(resetStub).to.have.been.calledWith("foo@bar.com");
    });
  });
});
