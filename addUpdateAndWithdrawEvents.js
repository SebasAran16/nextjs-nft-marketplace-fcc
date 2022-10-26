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

    let updateOptions = {
        chainId: moralisChainId,
        address: contractAddress,
        topic: "PriceUpdated(address,address,uint256,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "address",
                    name: "changer",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "tokenAddress",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "newPrice",
                    type: "uint256",
                },
            ],
            name: "PriceUpdated",
            type: "event",
        },
        sync_historical: true,
        tableName: "PriceUpdated",
    };

    let withdrawOptions = {
        chainId: moralisChainId,
        address: contractAddress,
        topic: "Withdrawal(address,uint256)",
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
                    internalType: "uint256",
                    name: "proceeds",
                    type: "uint256",
                },
            ],
            name: "Withdrawal",
            type: "event",
        },
        sync_historical: true,
        tableName: "Withdrawals",
    };

    const updateWatch = await Moralis.Cloud.run("watchContractEvent", updateOptions, {
        useMasterKey: true,
    });
    const withdrawWatch = await Moralis.Cloud.run("watchContractEvent", withdrawOptions, {
        useMasterKey: true,
    });

    if (updateWatch.success && withdrawWatch.success) {
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
