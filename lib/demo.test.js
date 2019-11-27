const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const rewire = require("rewire");

// const demo = require("./demo");
const demo = rewire("./demo");

describe("Demo Test", () => {
    context("add test", () => {
        it("should add two numbers", () => {
            expect(demo.add(1, 2)).to.equal(3);
        });
    });

    context("addCallback test", () => {
        it("should test the callback", () => {
            demo.addCallback(1, 2, (err, result) => {
                expect(err).to.not.exist;
                expect(result).to.equal(3);
            });
        });
    });

    context("addPromise test", () => {
        it("should add with promise callback", (done) => {
            demo.addPromise(1, 2)
                .then((result) => {
                    expect(result).to.equal(3);
                   
                    done();
                }).catch((error) => {
                    done(error);
                });
        });

        it("should test a promise with return", () => {
            return demo.addPromise(1, 2)
                .then((result) => {
                    expect(result).to.equal(3);
                });
        });

        it("should test promise with asyn/await", async () => {
            const result = await demo.addPromise(1, 2);

            expect(result).to.equal(3);
        });

        it("should test promise with chai-as-promised", async () => {
            await expect(demo.addPromise(1, 2)).to.eventually.equal(3);
        });
    });

    context("test doubles", () => {
        it("should spy on log", () => {
            const spy = sinon.spy(console, "log");
            demo.foo();

            expect(spy.calledOnce).to.be.true;
            expect(spy).to.have.been.calledOnce;
            spy.restore();
        });

        it("should stub on warn", () => {
            const stub = sinon.stub(console, "warn").callsFake(() => {
                console.log("Message from stub");
            });
            demo.foo();

            expect(stub).to.have.been.calledOnce;
            expect(stub).to.have.been.calledWith("console.warn was called");
            stub.restore();
        });
    });

    context("stub private function", () => {
        it("should stub createFile", async () => {
            const createStub = sinon.stub(demo, "createFile").resolves("create_stub");
            const callStub = sinon.stub().resolves("calldb_stub");

            demo.__set__("callDB", callStub);

            const result = await demo.bar("test.txt");

            expect(result).to.equal("calldb_stub");
            expect(createStub).to.have.been.calledWith("test.txt");
            expect(callStub).to.have.been.calledOnce;
        });
    });
});
