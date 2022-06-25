// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EmissionNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => bool) private existingURIs;
    mapping(uint256 => string) private emissionStorage;

    constructor() ERC721("EmissionData", "ED") {
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function safeMint(address to, string memory uri, string memory encryptionKey) public onlyOwner returns (uint256) {
        uint256 newItemId = mintToken(to, uri);
        emissionStorage[newItemId] = encryptionKey;

        return newItemId;
    }

    function mintToken(address recipient, string memory uri) private returns (uint256) {
        uint256 newItemId = _tokenIdCounter.current();
        require(!existingURIs[newItemId], "NFT already minted!");

        existingURIs[newItemId] = true;

        _tokenIdCounter.increment();

        _mint(recipient, newItemId);
        _setTokenURI(newItemId, uri);

        return newItemId;
    }

    function count() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function isContentOwner(uint16 uri) public view returns (bool) {
        return existingURIs[uri];
    }

    function getEncryptionKey(uint256 tokenId) public view returns (string memory) {
        require(ownerOf(tokenId) == msg.sender, "User is not the owner!");

        return emissionStorage[tokenId];
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
