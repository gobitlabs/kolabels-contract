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
      expect(version).to.equal("2.0.0");
    });

  });

});
