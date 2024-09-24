require("@nomicfoundation/hardhat-toolbox");
const DeployModule = require("../ignition/modules/deploy")

task("addPlatform", "Add a new platform")
  .addParam("platform", "The new platform name")
  .setAction(async args => {
    const [, factoryOwner] = await ethers.getSigners();
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);
    const proxy = labelFactoryProxy.connect(factoryOwner);

    await proxy.addPlatform(args.platform)
  })

task("removePlatform", "Remove a platform")
  .addParam("platform", "The platform name should be removed")
  .setAction(async args => {
    const [, factoryOwner] = await ethers.getSigners();
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);
    const proxy = labelFactoryProxy.connect(factoryOwner);

    await proxy.removePlatform(args.platform)
  })

task("supportPlatform", "Query if the specified platform is supported")
  .addParam("platform", "The platform name to query")
  .setAction(async args => {
    const [, , user1] = await ethers.getSigners();
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);
    const proxy = labelFactoryProxy.connect(user1);

    const isSuport = await proxy.isPlatformSupported(args.platform)
    console.log(`The ${args.platform} is ${isSuport ? "supported" : "unspported"}`)
  })

task("createLabel", "Create a new label for the specified account")
  .addParam("account", "The account name")
  .addParam("platform", "The platform of the account")
  .addParam("labelname", "The new label name")
  .setAction(async args => {
    const [, , user1] = await ethers.getSigners();
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);
    const proxy = labelFactoryProxy.connect(user1);

    await proxy.createLabel(args.platform, args.account, args.labelname)
    console.log("Create label success")
    const labelnfts = await proxy.getLabelsByPlatformAndAccount(args.platform, args.account)
    const lastlabel = labelnfts[labelnfts.length-1]
    console.log("The new label contract address is: ", lastlabel)

    const LabelNFT = await ethers.getContractFactory("LabelNFT", user1);
    let labelnft = LabelNFT.attach(lastlabel)
    const label = await labelnft.getInfo()
    console.log("The label platform:", label[0])
    console.log("The account:", label[1])
    console.log("The label name:", label[2])
  })

task("removeLabel", "Remove the specified label")
  .addParam("account", "The account name")
  .addParam("platform", "The platform of the account")
  .addParam("labelname", "The new label name")
  .setAction(async args => {
    const [, factoryOwner] = await ethers.getSigners();
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);
    const proxy = labelFactoryProxy.connect(factoryOwner);

    try {
      await proxy.removeLabel(args.platform, args.account, args.labelname)
      console.log("Remove label success")
    } catch (e) {
      console.error(e.message)
      console.log("Remove label failed or the label isn't exist")
    }
  })

task("listLabels", "List all of the labels of the specified account")
  .addParam("account", "The account name")
  .addParam("platform", "The platform of the account")
  .setAction(async args => {
    const [, , user1] = await ethers.getSigners();
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);
    const proxy = labelFactoryProxy.connect(user1);

    const labelnfts = await proxy.getLabelsByPlatformAndAccount(args.platform, args.account)
    const LabelNFT = await ethers.getContractFactory("LabelNFT", user1);
    for (let index = 0; index < labelnfts.length; index++) {
      const nft = labelnfts[index];
      let labelnft = LabelNFT.attach(nft)
      const label = await labelnft.getInfo()
      console.log(`==================== Label ${index +1} =====================`)
      console.log("The label platform:", label[0])
      console.log("The account:", label[1])
      console.log("The label name:", label[2])
    }
  })