// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

// Label NFT Contract
contract LabelNFT is ERC721, ERC721URIStorage, ERC721Burnable {
    uint256 private _nextNftId;

    string public platform;
    string public account;
    string public labelName;

    constructor(string memory _platform, string memory _account, string memory _labelName) ERC721(_labelName, string(abi.encodePacked("LABEL_", _generateRandomNumber()))) {
        platform = _platform;
        account = _account;
        labelName = _labelName;

        // Mint the first NFT to the creator
        _mintLabel(msg.sender);
    }

    function _generateRandomNumber() private view returns (string memory) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        return string(abi.encodePacked(Strings.toString(randomNumber)));
    }

    function _mintLabel(address to) internal returns (uint256) {
        uint256 tokenId = _nextNftId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function mintLabel(address to) public {
        _mintLabel(to);
    }

    function getInfo() public view returns (string memory, string memory, string memory) {
        return (platform, account, labelName);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        // keccak256(abi.encode(uint256(keccak256("mintLabel|getInfo"))));
        bytes32 id = 0xb97c06ce1a27418b31f7474f7bf31fc55ebaf5a4de64b614047e62de6d0cb336;
        return interfaceId == id || super.supportsInterface(interfaceId);
    }
}
