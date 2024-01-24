// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
pragma solidity ^0.8.19;

contract DynamicSVG is ERC721 {
    uint256 private _tokenIds;

    string private svgOne;
    string private svgTwo;

    event NftMinted(address, uint256 tokenID);

    constructor(
        string memory svg1,
        string memory svg2
    ) ERC721("Dynamic SVG NFT", "DSNFT") {
        svgOne = svgConverter(svg1);
        svgTwo = svgConverter(svg2);
        _tokenIds = 0;
    }

    function svgConverter(
        string memory svg
    ) private pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    function mintNft() public {
        _safeMint(msg.sender, _tokenIds);
        _tokenIds += 1;
        emit NftMinted(msg.sender, _tokenIds - 1);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        bool reminder = tokenId % 2 == 0 ? true : false;
        string memory imageURI = svgOne;
        if (reminder) imageURI = svgTwo;
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            string(
                                abi.encodePacked(
                                    '{"name":"NFT"',
                                    "description",
                                    ':"An NFT based on modulus"',
                                    '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                    imageURI,
                                    '"}'
                                )
                            )
                        )
                    )
                )
            );
    }
}
