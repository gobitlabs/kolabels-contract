const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const DeployModule = require("./deploy");

const UpgradeModule = buildModule("UpgradeModule", (m) => {
  const proxyAdminOwner = m.getAccount(0)
  const factoryOwner = m.getAccount(1)

  // Get the deployed address of ProxyAdmin and TransparentUpgradeableProxy
  const {proxyAdmin, labelFactoryProxy} = m.useModule(DeployModule)

  // Deploy the new version of LabelFactoryV2 contract
  const labelFactoryV2Impl = m.contract("LabelFactoryV2", [], {from: factoryOwner, id: "LabelFactoryV2Impl"});

  // Get LabelFactoryV2 proxy after upgrade
  const labelFactoryV2 = m.contractAt("LabelFactoryV2", labelFactoryProxy);

  // init data
  const encodedFunctionCall = m.encodeFunctionCall(
    labelFactoryV2Impl,
    "reinitialize",
    []
  );

  // Upgrade to LabelFactoryV2 using ProxyAdmin
  m.call(proxyAdmin, "upgradeAndCall", [
    labelFactoryProxy,
    labelFactoryV2Impl,
    encodedFunctionCall
  ], {
    from: proxyAdminOwner,
    after: [labelFactoryV2Impl]
  });

  return { proxyAdmin, labelFactoryProxy, labelFactoryV2 };
});

module.exports = UpgradeModule;