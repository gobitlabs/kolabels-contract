// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./LabelNFT.sol";

contract LabelFactory is Initializable, OwnableUpgradeable {
    event LabelCreated(address indexed creator, string indexed platform, string indexed account, string labelName, address labelAddress);
    event LabelRemoved(string platform, string account, string labelName, address labelAddress);
    event PlatformAdded(string platform);
    event PlatformRemoved(string platform);
    
    // Save the relative platform
    string[] public platforms;
    mapping(string => bool) public isPlatformSupported;
    
    // Save the platform, account and LabelNFT address map
    mapping(bytes32 => mapping(bytes32 => address[])) public accountToLabels;

    constructor() {
        _disableInitializers();
    }

    
    function initialize(address initialOwner) initializer virtual public {
        __Ownable_init(initialOwner);
    }

    function addPlatform(string memory platform) virtual public onlyOwner {
        require(!isPlatformSupported[platform], "Platform already exists");
        platforms.push(platform);
        isPlatformSupported[platform] = true;
        emit PlatformAdded(platform);
    }

    function removePlatform(string memory platform) virtual public onlyOwner {
        bytes32 platformBytes = keccak256(abi.encodePacked(platform));
        require(isPlatformSupported[platform], "Platform does not exist");
        for (uint i = 0; i < platforms.length; i++) {
            if (keccak256(abi.encodePacked(platforms[i])) == platformBytes) {
                platforms[i] = platforms[platforms.length - 1];
                platforms.pop();
                break;
            }
        }
        isPlatformSupported[platform] = false;
        emit PlatformRemoved(platform);
    }

    function createLabel(string memory platform, string memory account, string memory labelName) virtual public returns (address) {
        bytes32 platformBytes = keccak256(abi.encodePacked(platform));
        require(isPlatformSupported[platform], "Platform not supported");
        bytes32 accountBytes = keccak256(abi.encodePacked(account));
        bytes32 labelNameBytes = keccak256(abi.encodePacked(labelName));
        address[] storage existingLabels = accountToLabels[platformBytes][accountBytes];
        for (uint i = 0; i < existingLabels.length; i++) {
            LabelNFT existingLabel = LabelNFT(existingLabels[i]);
            (string memory existingPlatform, string memory existingAccount, string memory existingName) = existingLabel.getInfo();
            if (keccak256(abi.encodePacked(existingPlatform)) == platformBytes &&
              keccak256(abi.encodePacked(existingAccount)) == accountBytes &&
              keccak256(abi.encodePacked(existingName)) == labelNameBytes) {
              revert("Label already exists");
            }
        }
        
        LabelNFT newLabel = new LabelNFT(platform, account, labelName);
        // Mint the first label to current msg.sender
        newLabel.mintLabel(msg.sender);

        accountToLabels[platformBytes][accountBytes].push(address(newLabel));
        emit LabelCreated(msg.sender, platform, account, labelName, address(newLabel));
        return address(newLabel);
    }

    function removeLabel(string memory platform, string memory account, string memory labelName) virtual public onlyOwner {
        bytes32 platformBytes = keccak256(abi.encodePacked(platform));
        require(isPlatformSupported[platform], "Platform not supported");
        bytes32 accountBytes = keccak256(abi.encodePacked(account));
        bytes32 labelNameBytes = keccak256(abi.encodePacked(labelName));
        address[] storage labels = accountToLabels[platformBytes][accountBytes];
        for (uint i = 0; i < labels.length; i++) {
            LabelNFT label = LabelNFT(labels[i]);
            (string memory existingPlatform, string memory existingAccount, string memory existingName) = label.getInfo();
            if (keccak256(abi.encodePacked(existingPlatform)) == platformBytes &&
              keccak256(abi.encodePacked(existingAccount)) == accountBytes &&
              keccak256(abi.encodePacked(existingName)) == labelNameBytes) {
                labels[i] = labels[labels.length - 1];
                labels.pop();
                emit LabelRemoved(platform, account, labelName, address(label));
                return;
            }
        }
        revert("Label not found");
    }

    function getLabelsByPlatformAndAccount(string memory platform, string memory account) public view returns (address[] memory) {
        bytes32 platformBytes = keccak256(abi.encodePacked(platform));
        bytes32 accountBytes = keccak256(abi.encodePacked(account));
        return accountToLabels[platformBytes][accountBytes];
    }

    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }
}
