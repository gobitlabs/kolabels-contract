const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const DeployModule = require("../ignition/modules/deploy");

describe("testLabelFactory", function () {
  async function deployFixture() {
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);

    return { labelFactoryProxy };
  }

  describe("Deployment", function () {
    it("Should set the right version", async function () {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      const version = await proxy.version()
      expect(version).to.equal("1.0.0");
    });

  });

  describe("Platform function", function () {

    async function afterEach() {
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      // clear the platform
      await proxy.removePlatform("X-test")
    }

    it("Should add and remove supported platform", async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);

      await proxy.addPlatform("X-test")

      let supportX = await proxy.isPlatformSupported("X-test");
      expect(supportX).to.equal(true);

      await proxy.removePlatform("X-test")
      supportX = await proxy.isPlatformSupported("X-test");
      expect(supportX).to.equal(false);
    })

    it("Shouldn't add the same platform twice", async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      // add platform the first time
      await proxy.addPlatform("X-test")
      // add platform the second time
      await expect(proxy.addPlatform("X-test")).to.be.revertedWith("Platform already exists");
    })

    it("Shouldn't remove the platform which not exist", async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      
      await expect(proxy.removePlatform("X-test")).to.be.revertedWith("Platform does not exist");
    })
  })

});
