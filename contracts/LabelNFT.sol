// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Label NFT Contract
contract LabelNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _nextNftId;

    string public platform;
    string public account;
    string public extroUrl;

    constructor(string memory _platform, string memory _account, string memory _labelName, address initialOwner) ERC721(_labelName, string(abi.encodePacked("LABEL_", _generateRandomNumber()))) Ownable(initialOwner) {
        platform = _platform;
        account = _account;
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

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address acnt, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(acnt, value);
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

    function setExtroUrl(string memory url) external onlyOwner {
        extroUrl = url;
    }

    function tokensOfOwner(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokens;
    }

    function getInfo() public view returns (string memory, string memory, string memory, string memory) {
        return (platform, account, name(), extroUrl);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        // keccak256(abi.encode(uint256(keccak256("mintLabel|getInfo"))));
        bytes4 id = 0xb97c06ce;
        return interfaceId == id || super.supportsInterface(interfaceId);
    }
}
