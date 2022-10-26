/* import moralis */
const Moralis = require("moralis-v1/node");
require("dotenv").config();
const contractAddresses = require("./constants/networkMapping.json");

let chainId = process.env.chainId || 31337;

/* Moralis init code */
const contractAddressArray = contractAddresses[chainId]["NftMarketplace"];
const contractAddress = contractAddressArray[contractAddressArray.length - 1];
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
const moralisChainId = chainId == "31337" ? "1337" : chainId;
const moralisSecret = process.env.NEXT_PUBLIC_MORALIS_SECRET;
const masterKey = process.env.masterKey;

async function main() {
    await Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID, masterKey });
    console.log(`Working with contract address: ${contractAddress}...`);

    let itemListedOptions = {
        //Moralis undestands that a local chain is 1337
        chainId: moralisChainId,
        sync_historical: true,
        topic: "ItemList(address,address,uint256,uint256)",
        address: contractAddress,
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemList",
            type: "event",
        },
        tableName: "ItemListed",
    };

    console.log(`First got: ${JSON.stringify(itemListedOptions)}`);
    console.log("------------------");

    let itemBoughtOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        topic: "ItemBought(address,address,uint256,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "buyer",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemBought",
            type: "event",
        },
        tableName: "ItemBought",
    };

    console.log(`Second got: ${JSON.stringify(itemBoughtOptions)}`);
    console.log("------------------");

    let itemCanceledOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        topic: "ItemCanceled(address,address,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "owner",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "tokenAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            name: "ItemCanceled",
            type: "event",
        },
        tableName: "ItemCanceled",
    };

    console.log(`Third got ${JSON.stringify(itemCanceledOptions)}`);
    console.log("------------------");

    // let priceUpdatedOptions = {
    //     chainId: moralisChainId,
    //     sync_historical: true,
    //     address: contractAddress,
    //     topic: "PriceUpdated(address, address, uint256, uint256)",
    //     abi: {
    //         anonymous: false,
    //         inputs: [
    //             {
    //                 indexed: false,
    //                 internalType: "address",
    //                 name: "changer",
    //                 type: "address",
    //             },
    //             {
    //                 indexed: false,
    //                 internalType: "address",
    //                 name: "tokenAddress",
    //                 type: "address",
    //             },
    //             {
    //                 indexed: false,
    //                 internalType: "uint256",
    //                 name: "tokenId",
    //                 type: "uint256",
    //             },
    //             {
    //                 indexed: false,
    //                 internalType: "uint256",
    //                 name: "newPrice",
    //                 type: "uint256",
    //             },
    //         ],
    //         name: "PriceUpdated",
    //         type: "event",
    //     },
    //     tableName: "PriceUpdated",
    // };

    // let withdrawalOptions = {
    //     chainId: moralisChainId,
    //     sync_historical: true,
    //     address: contractAddress,
    //     topic: "Withdrawal(address, uint256)",
    //     abi: {
    //         anonymous: false,
    //         inputs: [
    //             {
    //                 indexed: true,
    //                 internalType: "address",
    //                 name: "owner",
    //                 type: "address",
    //             },
    //             {
    //                 indexed: true,
    //                 internalType: "uint256",
    //                 name: "proceeds",
    //                 type: "uint256",
    //             },
    //         ],
    //         name: "Withdrawal",
    //         type: "event",
    //     },
    //     tableName: "Withdrawal",
    // };

    console.log("Trying listed syncing...");

    const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
        useMasterKey: true,
    });

    console.log("Trying bought syncing...");

    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
        useMasterKey: true,
    });

    console.log("Trying canceled syncing...");

    const canceledResponse = await Moralis.Cloud.run("watchContractEvent", itemCanceledOptions, {
        useMasterKey: true,
    });

    if (listedResponse.success && boughtResponse.success && canceledResponse.success) {
        console.log("Success! Database Updated with watching events!");
    } else {
        console.log("Something went wrong...");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
