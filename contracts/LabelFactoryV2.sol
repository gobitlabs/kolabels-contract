// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./LabelFactory.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract LabelFactoryV2 is LabelFactory, PausableUpgradeable {
    
    constructor() {
        _disableInitializers();
    }

    function reinitialize() public reinitializer(2) {
        __Pausable_init();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Override createLabel function
    function createLabel(string memory platform, string memory account, string memory labelName) virtual public override whenNotPaused returns (address) {
        return super.createLabel(platform, account, labelName);
    }

    // Override removeLabel function
    function removeLabel(string memory platform, string memory account, string memory labelName) virtual public override whenNotPaused onlyOwner {
        super.removeLabel(platform, account, labelName);
    }

    // Override addPlatform function
    function addPlatform(string memory platform) public override whenNotPaused onlyOwner {
        super.addPlatform(platform);
    }

    // Override removePlatform function
    function removePlatform(string memory platform) public override whenNotPaused onlyOwner {
        super.removePlatform(platform);
    }

    // Update version number
    function version() public pure override returns (string memory) {
        return "2.0.0";
    }
}