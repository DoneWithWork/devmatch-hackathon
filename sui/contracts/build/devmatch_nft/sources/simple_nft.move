module devmatch_nft::simple_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::display;
    use sui::package;

    /// An example NFT that can be minted by anyone
    public struct SimpleNFT has key, store {
        id: UID,
        /// Name for the token
        name: String,
        /// Description of the token
        description: String,
        /// URL for the token image
        image_url: String,
    }

    /// One-Time-Witness for the module.
    public struct SIMPLE_NFT has drop {}

    /// Issuer capability - only holders can mint NFTs
    public struct IssuerCap has key, store {
        id: UID,
    }

    /// Module initializer called only once on module publish
    fun init(witness: SIMPLE_NFT, ctx: &mut TxContext) {
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
        ];

        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{image_url}"),
        ];

        // Claim the `Publisher` for the package!
        let publisher = package::claim(witness, ctx);

        // Get a new `Display` object for the `SimpleNFT` type.
        let mut display = display::new_with_fields<SimpleNFT>(
            &publisher, keys, values, ctx
        );

        // Commit first version of `Display` to apply changes.
        display::update_version(&mut display);

        // Create issuer capability and give it to the deployer
        let issuer_cap = IssuerCap {
            id: object::new(ctx),
        };

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
        transfer::public_transfer(issuer_cap, tx_context::sender(ctx));
    }

    /// Mint a new SimpleNFT - only issuer can call this
    public entry fun mint_nft(
        _issuer_cap: &IssuerCap,  // Must have issuer capability
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let nft = SimpleNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
        };

        transfer::public_transfer(nft, recipient);
    }

    /// Create a new issuer capability - only existing issuer can do this
    public entry fun create_issuer(
        _issuer_cap: &IssuerCap,  // Must have issuer capability
        new_issuer: address,
        ctx: &mut TxContext
    ) {
        let new_issuer_cap = IssuerCap {
            id: object::new(ctx),
        };
        transfer::public_transfer(new_issuer_cap, new_issuer);
    }

    /// Transfer ownership of an NFT
    public entry fun transfer_nft(
        nft: SimpleNFT, 
        recipient: address, 
        _: &mut TxContext
    ) {
        transfer::public_transfer(nft, recipient)
    }

    /// Get the NFT's name
    public fun name(nft: &SimpleNFT): &String {
        &nft.name
    }

    /// Get the NFT's description
    public fun description(nft: &SimpleNFT): &String {
        &nft.description
    }

    /// Get the NFT's image URL
    public fun image_url(nft: &SimpleNFT): &String {
        &nft.image_url
    }
}
