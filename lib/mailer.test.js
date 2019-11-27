const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const rewire = require("rewire");

const sandbox = sinon.createSandbox();

let mailer = rewire("./mailer");

describe("Mailer Test", () => {
  let emailStub;

  beforeEach(() => {
    emailStub = sandbox.stub().resolves("done");
    mailer.__set__("sendEmail", emailStub);
  });

  afterEach(() => {
    sandbox.restore();
    mailer = rewire("./mailer");
  });

  context("sendWelcomEmail test", () => {
    it("should check for email and name", async () => {
      await expect(mailer.sendWelcomeEmail()).to.eventually.be.rejectedWith("Invalid input");
      await expect(mailer.sendWelcomeEmail("foo@bar.com")).to.eventually.be.rejectedWith("Invalid input");
    });

    it("should call sendEmail with email and message", async () => {
      await mailer.sendWelcomeEmail("foo@bar.com", "Foo");
      expect(emailStub).to.have.been.calledWith("foo@bar.com", "Dear Foo, welcome to our family!");
    });
  });

  context("sendPasswordResetEmail test", () => {
    it("should check for email", async () => {
      await expect(mailer.sendPasswordResetEmail()).to.eventually.be.rejectedWith("Invalid input");
    });

    it("should call sendEmail with email and message", async () => {
      await mailer.sendPasswordResetEmail("foo@bar.com");
      expect(emailStub).to.have.been.calledWith("foo@bar.com", "Please click http://some_link to reset your password.");
    });
  });

  context("sendEmail test", () => {
    let sendEmail;

    beforeEach(() => {
      mailer = rewire("./mailer");
      sendEmail = mailer.__get__("sendEmail");
    });

    it("should check for email and body", async () => {
      await expect(sendEmail()).to.eventually.be.rejectedWith("Invalid input");
      await expect(sendEmail("foo@bar.com")).to.eventually.be.rejectedWith("Invalid input");
    });

    it("should call sendEmail with email and message", async () => {
      //stub actual mailer
      let result = await (sendEmail("foo@bar.com", "Welcome"));

      expect(result).to.equal("Email sent");
    });
  });
});
