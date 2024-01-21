// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./library/PriceCalculator.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error Doesnt__Match__Required__Eth();
error Err__Withdrawal__Failed();
error Err__Occured__In__Finding__Index(uint256 chanceNumber);

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Importing Libraries
    using PriceCalculator for uint256;
    // Variable
    AggregatorV3Interface private immutable i_PriceFeed;
    uint256 private immutable i_Nft_Price_In_Dollar;

    VRFCoordinatorV2Interface private immutable COORDINATOR;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private immutable i_requestConfirmations;
    uint32 private constant numWords = 1;
    uint64 private immutable i_SubscriptionId;
    uint8 private constant MAX_CHANCE_VALUE = 100;

    mapping(uint256 => address) private s_Request_For_Minting;
    uint256 private s_tokenId;
    string[3] private s_IPFS_Uri;

    // Events
    event Evt__Request_Id(uint256 requestId);
    event NftMinted(address minterAddress, uint256 s_tokenId, string uri);

    constructor(
        address priceFeedAddress,
        uint256 nftPriceInDollar,
        address vrfAddress,
        uint64 subscriptionId,
        bytes32 keyHash,
        uint16 requestConfirmations,
        uint32 cbLimit,
        string[3] memory IPFS_Uri
    )
        VRFConsumerBaseV2(vrfAddress)
        ERC721("RandomNFT", "RINFT")
        Ownable(msg.sender)
    {
        i_PriceFeed = AggregatorV3Interface(priceFeedAddress);
        i_Nft_Price_In_Dollar = nftPriceInDollar;
        COORDINATOR = VRFCoordinatorV2Interface(vrfAddress);
        i_SubscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_requestConfirmations = requestConfirmations;
        i_callbackGasLimit = cbLimit;
        s_tokenId = 0;
        s_IPFS_Uri = IPFS_Uri;
    }

    function requestForMinting() public payable {
        uint256 eth_price = i_Nft_Price_In_Dollar.getParticipationEthPrice(
            i_PriceFeed
        );
        if (eth_price != msg.value) revert Doesnt__Match__Required__Eth();
        uint256 requestId = COORDINATOR.requestRandomWords(
            i_keyHash,
            i_SubscriptionId,
            i_requestConfirmations,
            i_callbackGasLimit,
            numWords
        );
        s_Request_For_Minting[requestId] = msg.sender;
        emit Evt__Request_Id(requestId);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        address minterAddress = s_Request_For_Minting[_requestId];
        s_tokenId += 1;
        uint256 chanceNumber = _randomWords[0] % MAX_CHANCE_VALUE;
        uint256 index = getRandomIPFSFileIndex(chanceNumber);
        _safeMint(minterAddress, s_tokenId);
        _setTokenURI(s_tokenId, s_IPFS_Uri[index]);
        emit NftMinted(minterAddress, s_tokenId, s_IPFS_Uri[index]);
    }

    function getRandomIPFSFileIndex(
        uint256 chanceNumber
    ) private view returns (uint256) {
        uint8[3] memory arrOfChance = [60, 90, MAX_CHANCE_VALUE];
        uint8 initial = 0;
        for (uint256 i = 0; i < s_IPFS_Uri.length; i++) {
            if (
                uint8(chanceNumber) >= initial &&
                uint8(chanceNumber) < arrOfChance[i]
            ) return i;
            initial = arrOfChance[i];
        }
        revert Err__Occured__In__Finding__Index(chanceNumber);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        if (success) revert Err__Withdrawal__Failed();
    }

    function currentBalanceInUSD() public view onlyOwner returns (uint256) {
        uint256 balanceInUSD = address(this).balance.getConversionRate(
            i_PriceFeed
        );
        return balanceInUSD;
    }

    function getNFTDetails() public view returns (uint256, uint256, address) {
        uint256 ethPrice = i_Nft_Price_In_Dollar.getParticipationEthPrice(
            i_PriceFeed
        );
        address ownerAddress = owner();
        return (ethPrice, i_Nft_Price_In_Dollar, ownerAddress);
    }

    fallback() external payable {
        requestForMinting();
    }

    receive() external payable {
        requestForMinting();
    }
}
