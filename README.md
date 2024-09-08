# Kolabels Contract Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

Before executing scripts or deploying contracts, you need to set the value of INFURA_API_KEY in the Hardhat vars configuration. Use the following command:

```shell
npx hardhat vars set INFURA_API_KEY \<Your Infura API Key\>
```