import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Card, Button, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr;

    const separator = "...";
    const separatorLength = separator.length;
    const charsToShow = strLen - separatorLength;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    );
};

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis();
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const hideModal = () => setShowModal(false);

    const dispatch = useNotification();

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId,
        },
    });

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress,
            tokenId,
        },
    });

    const { runContractFunction: unlistItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "cancelListing",
        params: {
            nftAddress,
            tokenId,
        },
    });

    const hadnleBuyItemSuccess = async (tx) => {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "Item bougth correctly!",
            title: "Congrats!",
            position: "topR",
        });
    };

    const handleCanceledItemSuccess = async function (tx) {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "Item correctly unlisted",
            title: "Back to you...",
            position: "topR",
        });
    };

    async function updateUI() {
        const tokenURI = await getTokenURI();
        console.log(`The token URI is: ${tokenURI}`);
        if (tokenURI) {
            //As not everyone has a browser that supports IPFS, we will use...
            //IPFS Gateway: A server that will return IPFS file from a "noraml" URL.
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            //await for getting the response of the URL and then we await for it to convert into json...
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);
        }
        //Get the token URI
        //Using the image tag from the tokenURI. get image
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const isOwnedByUser = seller === account || seller === undefined;
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15);

    if (isOwnedByUser) {
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card title={tokenName} description={tokenDescription}>
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>Token ID: #{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                    {isOwnedByUser ? (
                                        <div className={"flex"}>
                                            <Button
                                                text="Change price"
                                                theme="outline"
                                                onClick={async function () {
                                                    setShowModal(true);
                                                }}
                                            />
                                            <Button
                                                text="Unlist"
                                                theme="outline"
                                                color="red"
                                                onClick={async function () {
                                                    unlistItem({
                                                        onError: (error) => console.log(error),
                                                        onSuccess: handleCanceledItemSuccess,
                                                    });
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <Button
                                            text="Buy"
                                            theme="outline"
                                            onClick={async function () {
                                                buyItem({
                                                    onError: (error) => console.log(error),
                                                    onSuccess: hadnleBuyItemSuccess,
                                                });
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div> Loading... </div>
                )}
            </div>
        </div>
    );
}
