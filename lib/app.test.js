const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const rewire = require("rewire");
const request = require("supertest");

const sandbox = sinon.createSandbox();

let app = rewire("./app");
const users = require("./users");
const auth = require("./auth");

describe("App Test", () => {
  afterEach(() => {
    app = rewire("./app");
    sandbox.restore();
  });

  context("get / test", () => {
    it("should get /", (done) => {
      request(app).get("/")
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.have.property("name").to.equal("Foo Bar");
          done(err);
        });
    });
  });

  context("post /user test", () => {
    let createStub, errorStub;

    it("should call user.create", (done) => {
      createStub = sandbox.stub(users, "create").resolves({ name: "Foo" });

      request(app).post("/user")
        .expect(200)
        .end((err, response) => {
          expect(createStub).to.have.been.calledOnce;
          expect(response.body).to.have.property("name").to.equal("Foo");
          done(err);
        });
    });

    it("should call handleError on error", (done) => {
      createStub = sandbox.stub(users, "create").rejects(new Error("fake_error"));

      errorStub = sandbox.stub().callsFake((res, error) => {
        return res.status(400).json({ errors: "Fake" });
      });

      app.__set__("handleError", errorStub);

      request(app).post("/user")
        .send({ name: "Fake" })
        .expect(400)
        .end((err, response) => {
          expect(createStub).to.have.been.calledOnce;
          expect(errorStub).to.have.been.calledOnce;
          expect(response.body).to.have.property("errors").to.equal("Fake");
          done(err);
        });
    });
  });

  context("delete /user/:id test", () => {
    let authStub, deleteStub;

    beforeEach(() => {
      fakeAuth = (req, res, next) => {
        return next();
      };
      authStub = sandbox.stub(auth, "isAuthorized").callsFake(fakeAuth);

      app = rewire("./app");
    });

    it("should call auth check function and users.delete on success", (done) => {
      deleteStub = sandbox.stub(users, "delete").resolves("fake_delete");

      request(app).delete("/user/123")
        .expect(200)
        .end((err, response) => {
          expect(authStub).to.have.been.calledOnce;
          expect(deleteStub).to.have.been.calledWithMatch({ id: "123" });
          expect(response.body).to.equal("fake_delete");
          done(err);
        });
    });

    it("should call handleError on error", (done) => {
      deleteStub = sandbox.stub(users, "delete").rejects(new Error("fake_error"));

      errorStub = sandbox.stub().callsFake((res, error) => {
        return res.status(400).json({ errors: "Fake" });
      });

      app.__set__("handleError", errorStub);

      request(app).delete("/user/123")
        .expect(400)
        .end((err, response) => {
          expect(authStub).to.have.been.calledOnce;
          expect(deleteStub).to.have.been.calledWithMatch({ id: "123" });
          expect(errorStub).to.have.been.calledOnce;
          expect(response.body).to.have.property("errors").to.equal("Fake");
          done(err);
        });
    });
  });

  context("handleError test", () => {
    let handleError, res, statusStub, jsonStub;

    beforeEach(() => {
      jsonStub = sandbox.stub().returns("done");
      statusStub = sandbox.stub().returns({ json: jsonStub });
      res = { status: statusStub };

      handleError = app.__get__("handleError");
    });

    it("should check error instance and format message", (done) => {
      const result = handleError(res, new Error("Fake"));

      expect(statusStub).to.have.been.calledWith(400);
      expect(jsonStub).to.have.been.calledWith({ error: "Fake" });
      
      done();
    });

    it("should return object without changing it if not instance of error", (done) => {
      const result = handleError(res, { id: 1, message: "Fake error" });

      expect(statusStub).to.have.been.calledWith(400);
      expect(jsonStub).to.have.been.calledWith({ id: 1, message: "Fake error" });

      done();
    });
  });
});
