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