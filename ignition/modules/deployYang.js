const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployYangTokenModule = buildModule("DeployYangTokenModule", (m) => {
  const factoryOwner = m.getAccount(1)

  // Deploy YangToken
  const YangToken = m.contract("YangToken", [factoryOwner], {from: factoryOwner});

  return { YangToken };
});

module.exports = DeployYangTokenModule;