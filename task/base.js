require("@nomicfoundation/hardhat-toolbox");
const ethers = require('ethers');

task("basicInfo", "Show the basic information about the running environment")
  .setAction(async args => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
      console.log(account.address);
    }

    const result = ethers.keccak256(ethers.toUtf8Bytes("mintLabel|getInfo"));
    console.log(result);
  })