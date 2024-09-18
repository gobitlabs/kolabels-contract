// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./LabelNFT.sol";

contract LabelFactory is Initializable, OwnableUpgradeable {
    event LabelCreated(address indexed creator, string platform, string account, string labelName, address labelAddress);
    event LabelRemoved(string platform, string account, string labelName, address labelAddress);
    event PlatformAdded(string platform);
    event PlatformRemoved(string platform);
    
    // Save the relative platform
    string[] public platforms;
    mapping(string => bool) public isPlatformSupported;
    
    // Save the platform, account and LabelNFT address map
    mapping(string => mapping(string => address[])) public accountToLabels;

    constructor() {
        _disableInitializers();
    }

    
    function initialize(address initialOwner) initializer virtual public {
        __Ownable_init(initialOwner);
    }

    // 添加平台
    function addPlatform(string memory platform) virtual public onlyOwner {
        require(!isPlatformSupported[platform], "Platform already exists");
        platforms.push(platform);
        isPlatformSupported[platform] = true;
        emit PlatformAdded(platform);
    }

    // 移除平台
    function removePlatform(string memory platform) virtual public onlyOwner {
        require(isPlatformSupported[platform], "Platform does not exist");
        for (uint i = 0; i < platforms.length; i++) {
            if (keccak256(abi.encodePacked(platforms[i])) == keccak256(abi.encodePacked(platform))) {
                platforms[i] = platforms[platforms.length - 1];
                platforms.pop();
                break;
            }
        }
        isPlatformSupported[platform] = false;
        emit PlatformRemoved(platform);
    }

    // 创建新的 LabelNFT 合约
    function createLabel(string memory platform, string memory account, string memory labelName) virtual public returns (address) {
        require(isPlatformSupported[platform], "Platform not supported");
        address[] storage existingLabels = accountToLabels[platform][account];
        for (uint i = 0; i < existingLabels.length; i++) {
            LabelNFT existingLabel = LabelNFT(existingLabels[i]);
            (string memory existingPlatform, string memory existingAccount, string memory existingName) = existingLabel.getInfo();
            if (keccak256(abi.encodePacked(existingPlatform)) == keccak256(abi.encodePacked(platform)) &&
              keccak256(abi.encodePacked(existingAccount)) == keccak256(abi.encodePacked(account)) &&
              keccak256(abi.encodePacked(existingName)) == keccak256(abi.encodePacked(labelName))) {
              revert("Label already exists");
            }
        }
        
        LabelNFT newLabel = new LabelNFT(platform, account, labelName);
        
        accountToLabels[platform][account].push(address(newLabel));
        emit LabelCreated(msg.sender, platform, account, labelName, address(newLabel));
        return address(newLabel);
    }

    // 删除 Label，只能由 owner 执行
    function removeLabel(string memory platform, string memory account, string memory labelName) virtual public onlyOwner {
        require(isPlatformSupported[platform], "Platform not supported");
        address[] storage labels = accountToLabels[platform][account];
        for (uint i = 0; i < labels.length; i++) {
            LabelNFT label = LabelNFT(labels[i]);
            (string memory labelPlatform, , string memory existingName) = label.getInfo();
            if (keccak256(abi.encodePacked(existingName)) == keccak256(abi.encodePacked(labelName)) &&
                keccak256(abi.encodePacked(labelPlatform)) == keccak256(abi.encodePacked(platform))) {
                labels[i] = labels[labels.length - 1];
                labels.pop();
                emit LabelRemoved(platform, account, labelName, address(label));
                return;
            }
        }
        revert("Label not found");
    }

    // 获取支持的平台列表
    function getSupportedPlatforms() virtual public view returns (string[] memory) {
        return platforms;
    }

    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }
}
