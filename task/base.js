require("@nomicfoundation/hardhat-toolbox");
const DeployModule = require("../ignition/modules/deploy")

task("accountlist", "Show the account list about the running environment")
  .setAction(async args => {
    const [proxyAdminOwner, factoryOwner, user1, user2] = await ethers.getSigners();

    console.log("Proxy Admin Owner: ", proxyAdminOwner.address)
    console.log("Factory Owner: ", factoryOwner.address)
    console.log("User1: ", user1.address)
    console.log("User2: ", user2.address)

    // const result = ethers.keccak256(ethers.toUtf8Bytes("mintLabel|getInfo"));
    // console.log(result);
  })

task("proxyInfo", "Show the upgradable proxy information")
  .setAction(async args => {
    const [, factoryOwner] = await ethers.getSigners();
    const {labelFactoryProxy} = await ignition.deploy(DeployModule);
    const proxy = labelFactoryProxy.connect(factoryOwner);
    const version = await proxy.version()
    console.log("Version: ", version)
    console.log("Proxy Address: ", proxy.target)
    const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxy.target);
    console.log("Implementation Address: ", implementationAddress);
    const proxyAdminAddress = await hre.upgrades.erc1967.getAdminAddress(proxy.target);
    console.log("ProxyAdmin Address: ", proxyAdminAddress);
  })