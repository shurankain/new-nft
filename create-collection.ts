import {createNft, fetchDigitalAsset, mplTokenMetadata} from "@metaplex-foundation/mpl-token-metadata"
import {airdropIfRequired, getExplorerLink, getKeypairFromFile} from "@solana-developers/helpers"
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults"
import {Connection, LAMPORTS_PER_SOL, clusterApiUrl} from "@solana/web3.js"
import {keypairIdentity, generateSigner, percentAmount} from "@metaplex-foundation/umi"

const connection = new Connection(clusterApiUrl('devnet'));
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user account", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up UMI instance for user");

const collectionMint = generateSigner(umi);

const transaction = createNft(umi, {
        mint: collectionMint,
        name: "My Collection",
        symbol: "MC",
        uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true
    }
);
await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);

console.log(`Created collection! Address is ${getExplorerLink("address", 
    createdCollectionNft.mint.publicKey, 
    "devnet")}`
);