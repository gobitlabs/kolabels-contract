const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const DeployModule = require("../ignition/modules/deploy");

describe("testLabelFactory", function () {

  const testPlatformName = "X-test";
  const testAccount = "UserAccount";
  const testLabelName = "UserAccount is a test account";

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

    afterEach(async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      const supportX = await proxy.isPlatformSupported(testPlatformName);
      if (supportX) {
        // clear the platform
        await proxy.removePlatform(testPlatformName)
      }
    })

    it("Should add and remove supported platform", async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);

      await proxy.addPlatform(testPlatformName)

      let supportX = await proxy.isPlatformSupported(testPlatformName);
      expect(supportX).to.equal(true);

      await proxy.removePlatform(testPlatformName)
      supportX = await proxy.isPlatformSupported(testPlatformName);
      expect(supportX).to.equal(false);
    })

    it("Shouldn't add the same platform twice", async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      // add platform the first time
      await proxy.addPlatform(testPlatformName)
      // add platform the second time
      await expect(proxy.addPlatform(testPlatformName)).to.be.revertedWith("Platform already exists");
    })

    it("Shouldn't remove the platform which not exist", async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      
      await expect(proxy.removePlatform(testPlatformName)).to.be.revertedWith("Platform does not exist");
    })

    it("Should forbit the normal user to add or remove platform", async () => {
      const { labelFactoryProxy } = await loadFixture(deployFixture);
      const [, , user1] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(user1);
      
      await expect(proxy.addPlatform(testPlatformName)).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount").withArgs(user1.address);
      await expect(proxy.removePlatform(testPlatformName)).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount").withArgs(user1.address);
    })
  })

  describe("Label Factory function", function () {

    let labelFactoryProxy;

    before(async () => {
      const deployed = await loadFixture(deployFixture);
      labelFactoryProxy = deployed.labelFactoryProxy;
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      // add the platform
      await proxy.addPlatform(testPlatformName)
    })

    after(async () => {
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      const supportX = await proxy.isPlatformSupported(testPlatformName);
      if (supportX) {
        // clear the platform
        await proxy.removePlatform(testPlatformName)
      }
    })

    // afterEach(async () => {
    //   const [, factoryOwner] = await ethers.getSigners();
    //   const proxy = labelFactoryProxy.connect(factoryOwner);
    //   await proxy.removeLabel(testPlatformName, testAccount, testLabelName)
    // })

    it("Should create and remove a label NFT success", async () => {
      const [, factoryOwner, user1] = await ethers.getSigners();
      let proxy = labelFactoryProxy.connect(user1);

      await proxy.createLabel(testPlatformName, testAccount, testLabelName)
      const labelnfts = await proxy.getLabelsByPlatformAndAccount(testPlatformName, testAccount)
      const lastlabel = labelnfts[labelnfts.length-1]

      const LabelNFT = await ethers.getContractFactory("LabelNFT", user1);
      let labelnft = LabelNFT.attach(lastlabel)
      const label = await labelnft.getInfo()
      expect(label[2]).to.equal(testLabelName);
      const balance = await labelnft.balanceOf(user1)
      expect(balance).to.equal(1)

      proxy = labelFactoryProxy.connect(factoryOwner);
      await proxy.removeLabel(testPlatformName, testAccount, testLabelName)
      const newlabelnfts = await proxy.getLabelsByPlatformAndAccount(testPlatformName, testAccount)
      expect(labelnfts.length-1).to.equal(newlabelnfts.length)
    })

    it("Shouldn't create the same label twice", async () => {
      const [, factoryOwner, user1] = await ethers.getSigners();
      let proxy = labelFactoryProxy.connect(user1);

      await proxy.createLabel(testPlatformName, testAccount, testLabelName)
      await expect(proxy.createLabel(testPlatformName, testAccount, testLabelName)).to.be.revertedWith("Label already exists");

      proxy = labelFactoryProxy.connect(factoryOwner);
      await proxy.removeLabel(testPlatformName, testAccount, testLabelName)
    })

    it("Shouldn't remove a label which not exist", async () => {
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);

      await expect(proxy.removeLabel(testPlatformName, testAccount, testLabelName)).to.be.revertedWith("Label not found");
    })
    
  })

  describe("Label NFT function", function () {

    let labelFactoryProxy;
    let testlabelnft;

    before(async () => {
      const deployed = await loadFixture(deployFixture);
      labelFactoryProxy = deployed.labelFactoryProxy;
      const [, factoryOwner, user1] = await ethers.getSigners();

      let proxy = labelFactoryProxy.connect(factoryOwner);
      // add the platform
      await proxy.addPlatform(testPlatformName)

      proxy = labelFactoryProxy.connect(user1);
      await proxy.createLabel(testPlatformName, testAccount, testLabelName)
      const labelnfts = await proxy.getLabelsByPlatformAndAccount(testPlatformName, testAccount)
      testlabelnft = labelnfts[labelnfts.length-1]
    })

    after(async () => {
      const [, factoryOwner] = await ethers.getSigners();
      const proxy = labelFactoryProxy.connect(factoryOwner);
      await proxy.removeLabel(testPlatformName, testAccount, testLabelName)
      const supportX = await proxy.isPlatformSupported(testPlatformName);
      if (supportX) {
        // clear the platform
        await proxy.removePlatform(testPlatformName)
      }
    })

    it("Should be the right label owner", async function () {
      const [, , user1] = await ethers.getSigners();
      const LabelNFT = await ethers.getContractFactory("LabelNFT", user1);
      let labelnft = LabelNFT.attach(testlabelnft)

      const nftOwner = await labelnft.owner()
      expect(nftOwner).to.equal(user1)
    })

    it("Should mint a new label", async function () {
      const [, , , user2] = await ethers.getSigners();

      const LabelNFT = await ethers.getContractFactory("LabelNFT", user2);
      let labelnft = LabelNFT.attach(testlabelnft)
      await labelnft.mintLabel(user2)
      const balance = await labelnft.balanceOf(user2)
      expect(balance).to.equal(1)
    });

    it("Should mint multiple labels", async function () {
      const [, , user1] = await ethers.getSigners();

      const LabelNFT = await ethers.getContractFactory("LabelNFT", user1);
      let labelnft = LabelNFT.attach(testlabelnft)
      await labelnft.mintLabel(user1)
      await labelnft.mintLabel(user1)
      const balance = await labelnft.balanceOf(user1)
      expect(balance).to.equal(3)
    });

    it("Should set the right extro URL", async function () {
      const [, , user1] = await ethers.getSigners();

      const LabelNFT = await ethers.getContractFactory("LabelNFT", user1);
      let labelnft = LabelNFT.attach(testlabelnft)

      const url = "https://xxx.com/abc"
      await labelnft.setExtroUrl(url)
      const extroUrl = await labelnft.extroUrl()
      expect(extroUrl).to.equal(url)
    })

  });

});
