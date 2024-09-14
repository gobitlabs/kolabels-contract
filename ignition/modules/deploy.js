const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployModule = buildModule("DeployModule", (m) => {
  const proxyAdminOwner = m.getAccount(0)
  const factoryOwner = m.getAccount(1)

  // Deploy LabelFactory implement contract
  const labelFactoryImpl = m.contract("LabelFactory", [], {from: factoryOwner, id: "LabelFactoryImpl"});

  // Deploy the TransparentUpgradeableProxy contract
  const proxy = m.contract("TransparentUpgradeableProxy", [
    labelFactoryImpl,
    proxyAdminOwner,
    "0x"
  ], {
    from: proxyAdminOwner,
    after: [labelFactoryImpl]
  });

  // We need to get the address of the ProxyAdmin contract that was created by the TransparentUpgradeableProxy
  // so that we can use it to upgrade the proxy later.
  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  // Create a contract instance for the ProxyAdmin that we can interact with later to upgrade the proxy.
  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  // Call the initialize function in LabelFactory contract
  const labelFactoryProxy = m.contractAt("LabelFactory", proxy)
  m.call(labelFactoryProxy, "initialize", [factoryOwner], {from: factoryOwner})

  return { labelFactoryImpl, proxyAdmin, labelFactoryProxy };
});

module.exports = DeployModule;