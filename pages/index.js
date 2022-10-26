import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useMoralisQuery } from "react-moralis";
import NFTBox from "../components/NFTBox";

export default function Home() {
    //We will index the events off-chain and the read it from our database
    //Setup a server to listen for those events to be fired, and we will add them to a database to query ✅

    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        "ActiveItem",
        (query) => query.limit(10).descending("tokenId")
    );
    console.log(listedNfts);

    return (
        <div className={styles.container}>
            {fetchingListedNfts ? (
                <div>Loading...</div>
            ) : (
                listedNfts.map((nft) => {
                    console.log(nft.attributes);
                    const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                        nft.attributes;
                    return (
                        <div>
                            Price: {price}. NftAddress: {nftAddress}. Token ID: {tokenId}.
                            Marketplace Address: {marketplaceAddress}. Seller: {seller}
                            <NFTBox
                                price={price}
                                nftAddress={nftAddress}
                                tokenId={tokenId}
                                marketplaceAddress={marketplaceAddress}
                                seller={seller}
                                key={`${nftAddress}${tokenId}`}
                            />
                        </div>
                    );
                })
            )}
        </div>
    );
}
