// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// solhint-disable-next-line no-console
import "hardhat/console.sol";

// Errors ----------------------------------

contract BasicNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_counter;

    constructor() ERC721("BasicNFT", "BNFT") {
        s_counter = 0;
    }

    function mint() public returns (uint256) {
        ++s_counter;
        _safeMint(msg.sender, s_counter);
        return s_counter;
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_counter;
    }
}
