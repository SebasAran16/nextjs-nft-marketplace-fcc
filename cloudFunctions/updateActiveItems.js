// Create a new table called "ActiveItem"
// Add items when they are listed on the marketplace
// Remove them when they are bought or cancelled

Moralis.Cloud.afterSave("ItemListed", async function (request) {
    // Every event gets triggered twice, once on unconfirmed, again on confirmed
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Looking for confirmed Tx");
    if (confirmed) {
        logger.info("Found Item!");
        //If "ActiveItem exist, grab it, if not, create it"
        const ActiveItem = Moralis.Object.extend("ActiveItem");

        const activeItem = new ActiveItem();
        activeItem.set("marketplaceAddress", request.object.get("address"));
        activeItem.set("nftAddress", request.object.get("nftAddresss"));
        activeItem.set("price", request.object.get("price"));
        activeItem.set("tokenId", request.object.get("tokenId"));
        activeItem.set("seller", request.object.get("seller"));
        logger.info(
            `Adding Address: ${request.object.get("address")}, Token ID: ${request.object.get(
                "tokenId"
            )}`
        );
        logger.info("Saving...");
        await activeItem.save();
    }
});

Moralis.Cloud.afterSave("ItemCanceled", async function (request) {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query: ${query}`);
        const canceledItem = await query.first();
        logger.info(`Marketplace | CanceledItem: ${canceledItem}`);
        if (canceledItem) {
            logger.info(
                `Deleting token ${request.object.get("tokenId")} at address ${request.object.get(
                    "address"
                )} since it was canceled...`
            );
            await canceledItem.destroy();
        } else {
            logger.info(
                `No item found with address ${request.object.get(
                    "address"
                )} and token ${request.object.get("tokenId")}`
            );
        }
    }
});

Moralis.Cloud.afterSave("ItemBought", async function (request) {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        query.equalTo("price", request.object.get("price"));
        logger.info(`Marketplace | Query: ${query}`);
        const boughtItem = await query.first();
        logger.info(`Marketplace | ItemBought: ${boughtItem}`);
        if (boughtItem) {
            logger.info(
                `Deleting token ${request.object.get("tokenId")} at address ${request.object.get(
                    "address"
                )} since it was bought...`
            );
            await boughtItem.destroy();
            logger.info("Deleted!");
        } else {
            logger.info(
                `No item found with address ${request.object.get(
                    "address"
                )} and token ${request.object.get("tokenId")}`
            );
        }
    }
});

Moralis.Cloud.afterSave("PriceUpdated", async function (request) {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        logger.info("Market Address");
        query.equalTo("marketplaceAddress", request.object.get("address"));
        logger.info("Token Id...");
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info("Seller...");
        query.equalTo("seller", request.object.get("changer"));
        logger.info(`Marketplace | Query: ${query}`);
        const itemToUpdate = await query.first();
        logger.info(`Marketplace | Item to update: ${itemToUpdate}`);
        if (itemToUpdate) {
            logger.info("Updating price...");
            itemToUpdate.save().then((itemToUpdate) => {
                itemToUpdate.set("price", request.object.get("newPrice"));
                itemToUpdate.save();
            });
            logger.info("Price Updated!");
        } else {
            logger.info(
                `Found no item to update with token ${request.object.get(
                    "tokenId"
                )} on contract ${request.object.get("address")}...`
            );
        }
    }
});
