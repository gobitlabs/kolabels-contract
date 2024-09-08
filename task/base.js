require("@nomicfoundation/hardhat-toolbox");

task("basicInfo", "Show the basic information about the running environment")
  .setAction(async args => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
      console.log(account.address);
    }
  })