import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled } = useMoralis();
    const [imageURI, setImageURI] = useState("");

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    });

    async function updateUI() {
        const tokenURI = await getTokenURI();
        console.log(`The token URI is: ${tokenURI}`);
        //Get the token URI
        //Using the image tag from the tokenURI. get image
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);
}
