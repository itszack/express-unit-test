const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const crypto = require("crypto");
const sandbox = sinon.createSandbox();

const config = require("./config");
const utils = require("./utils");

describe("Utils Test", () => {
  let secretStub, digestStub, updateStub, createHashStub, hash;

  beforeEach(() => {
    secretStub = sandbox.stub(config, "secret").returns("fake_secret");
    digestStub = sandbox.stub().returns("ABC123");
    updateStub = sandbox.stub().returns({ digest: digestStub });
    createHashStub = sandbox.stub(crypto, "createHash").returns({ update: updateStub });
    hash = utils.getHash("Foo");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return null if invalid string is passed", () => {
    sandbox.reset();

    const hash2 = utils.getHash(null);
    const hash3 = utils.getHash(123);
    const hash4 = utils.getHash({ name: "bar" });

    expect(hash2).to.be.null;
    expect(hash3).to.be.null;
    expect(hash4).to.be.null;

    expect(createHashStub).to.not.have.been.called;
  });

  it("should get secret form config", () => {
    expect(secretStub).to.have.been.called;
  });

  it("should call crypto with correct settings and return hash", () => {
    expect(createHashStub).to.have.been.calledWith("md5");
    expect(updateStub).to.have.been.calledWith("Foo_fake_secret");
    expect(digestStub).to.have.been.calledWith("hex");
    expect(hash).to.equal("ABC123");
  });
});
