import {
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1
} from "@metaplex-foundation/mpl-token-metadata"
import {airdropIfRequired, getExplorerLink, getKeypairFromFile} from "@solana-developers/helpers"
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults"
import {Connection, LAMPORTS_PER_SOL, clusterApiUrl} from "@solana/web3.js"
import {keypairIdentity, publicKey} from "@metaplex-foundation/umi"

const connection = new Connection(clusterApiUrl('devnet'));
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user account", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey(
    "65brGDFza2QNrTVGz3nvDCZTTz593jb6CYVj1Bv94fgY"
);

const nftAddress = publicKey(
    "9FMZMqqo4xzCKuiALxuSRJpP26JRubiNyeK9hJvzGPaA"
);

const transaction = verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, {mint: nftAddress}),
    collectionMint: collectionAddress,
    authority: umi.identity,
});

transaction.sendAndConfirm(umi);

console.log(`NFT ${nftAddress} verified, to be part of collection ${collectionAddress} ! 
See it at ${getExplorerLink("address", nftAddress, "devnet")}`);