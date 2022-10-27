import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Form, useNotification, Information, Button } from "web3uikit";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNft.json";
import networkMapping from "../constants/networkMapping.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { useEffect, useState } from "react";

export default function Home() {
    const { chainId, isWeb3Enabled, account } = useMoralis();
    //The useMoralis() chainId return is 0x...
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddressArray = networkMapping[chainString]["NftMarketplace"];
    const marketplaceAddress =
        networkMapping[chainString].NftMarketplace[marketplaceAddressArray.length - 1];
    const dispatch = useNotification();
    const [proceeds, setProceeds] = useState("");

    const { runContractFunction } = useWeb3Contract();

    async function approveAndList(data) {
        console.log("Approving...");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId,
            },
        };

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => console.log(error),
        });
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Time to list!");
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress,
                tokenId,
                price,
            },
        };
        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        });
    }

    async function handleListSuccess(tx) {
        await tx.wait(1);
        dispatch({
            type: "success",
            title: "Item Listed Successfully!",
            message: "NFT Listed",
            position: "topR",
        });
    }

    async function handleWithdrawSuccess(tx) {
        await tx.wait(1);
        dispatch({
            type: "success",
            title: "Withdrawal Successful!",
            message: "Funds withdrew correctly",
            position: "topR",
        });
    }

    //Proceeds constants:
    async function updateUI() {
        const proceedsOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "getProceeds",
            params: {},
        };

        const proceed = await runContractFunction({
            params: proceedsOptions,
            onError: (error) => console.log(error),
        });
        if (proceed) {
            setProceeds(ethers.utils.formatUnits(proceed, "ether"));
        }
    }

    const { runContractFunction: withdrawProceeds } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "withdraw",
        params: {},
    });

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [proceeds, account, isWeb3Enabled, chainId]);

    return (
        <div className={styles.container}>
            <Form
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        inputWidth: "50%",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price",
                        type: "number",
                        inputWidth: "50%",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Sell your NFT!"
                id="Main Form"
                onSubmit={approveAndList}
            />
            <hr class="border-dashed" />
            <h1 className="py-4 px-4 font-bold text-2xl">Proceeds:</h1>
            <div className="flex">
                {proceeds != 0 ? (
                    <div>
                        <Information topic="You can withdraw:" information={`${proceeds} ETH`} />
                        <Button
                            text="Withdraw"
                            id="withdrawButton"
                            size="large"
                            theme="colored"
                            color="green"
                            onClick={async function () {
                                withdrawProceeds({
                                    onError: (error) => console.log(error),
                                    onSuccess: handleWithdrawSuccess,
                                });
                            }}
                        />
                    </div>
                ) : (
                    <div>No proceeds found</div>
                )}
            </div>
        </div>
    );
}
