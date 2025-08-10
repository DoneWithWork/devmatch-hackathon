module devmatch_nft::certificate {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::table::{Self, Table};
    use sui::event;
    use std::option::{Self, Option};
    use std::vector;
    use sui::bcs;
    use sui::hash;

    // Import from issuer module
    use devmatch_nft::issuer::{Self, IssuerCap};

    /// Error codes
    const E_ISSUER_NOT_APPROVED: u64 = 1;
    const E_TEMPLATE_OWNERSHIP: u64 = 2;
    const E_TEMPLATE_INACTIVE: u64 = 3;
    const E_FIELD_MISMATCH: u64 = 4;
    const E_ALREADY_MINTED: u64 = 5;
    const E_NOT_RECIPIENT: u64 = 6;
    const E_TOO_MANY_FIELDS: u64 = 7;
    const E_EMPTY_FIELD_NAME: u64 = 8;
    const E_EMPTY_FIELD_VALUE: u64 = 9;
    const E_ALREADY_REVOKED: u64 = 10;
    const E_REVOKED_CANNOT_MINT: u64 = 11;
    const E_NOT_MINTED: u64 = 12; // used for update_mint_tx_id assertion
        const E_LABEL_ALREADY_FINALIZED: u64 = 13; // update_mint_tx_id called more than once

    const MAX_TEMPLATE_FIELDS: u64 = 64; // production safety limit

    /// Certificate template - defines what an issuer can issue
    public struct CertificateTemplate has key, store {
        id: UID,
        issuer_cap_id: ID,
        template_name: String,
        description: String,
        image_template_url: String,
        certificate_type: String, // e.g., "completion", "achievement", "skill"
        fields: vector<String>, // Required fields for this cert type
        issuer_name: String,
        created_at: u64,
        is_active: bool,
    }

    /// Issued Certificate record - stored before minting
    public struct IssuedCertificate has key, store {
        id: UID,
        template_id: ID,
        issuer_address: address,
        recipient_address: address,
        certificate_data: Table<String, String>, // Field name -> value
        issued_at: u64,
        expiry_date: Option<u64>, // Some certificates might expire
        is_minted: bool,
        mint_transaction_id: Option<String>,
        certificate_hash: String, // For verification
        is_revoked: bool,
        revoked_at: Option<u64>,
    }

    /// Certificate Registry - tracks all certificates
    public struct CertificateRegistry has key {
        id: UID,
        total_certificates: u64,
        total_templates: u64,
    }

    // ===== Events =====
    
    public struct TemplateCreatedEvent has copy, drop {
        template_id: ID,
        issuer_address: address,
        template_name: String,
        certificate_type: String,
        timestamp: u64,
    }

    public struct CertificateIssuedEvent has copy, drop {
        certificate_id: ID,
        template_id: ID,
        issuer: address,
        recipient: address,
        certificate_type: String,
    client_provided_id: String,
        timestamp: u64,
    }

    public struct CertificateMintedEvent has copy, drop {
        certificate_id: ID,
        nft_id: ID,
        recipient: address,
        mint_transaction_id: String,
        timestamp: u64,
    }

        public struct UpdateMintTxIdEvent has copy, drop {
            certificate_id: ID,
            nft_id: ID,
            new_label: String,
            timestamp: u64,
        }

    /// NFT representation of a certificate (lightweight metadata holder)
    public struct CertificateNFT has key, store {
        id: UID,
        certificate_id: ID,
        template_id: ID,
        issuer: address,
        recipient: address,
        issued_at: u64,
        certificate_hash: String,
    }

    public struct CertificateRevokedEvent has copy, drop {
        certificate_id: ID,
        template_id: ID,
        issuer: address,
        recipient: address,
        timestamp: u64,
    }

    public struct TemplateDeactivatedEvent has copy, drop {
        template_id: ID,
        issuer_address: address,
        timestamp: u64,
    }

    // ===== Initialize =====

    fun init(ctx: &mut TxContext) {
        let registry = CertificateRegistry {
            id: object::new(ctx),
            total_certificates: 0,
            total_templates: 0,
        };
        
        transfer::share_object(registry);
    }

    // ===== Template Functions =====

    /// Create a certificate template (only approved issuers)
    public entry fun create_certificate_template(
        issuer_cap: &IssuerCap,
        template_name: vector<u8>,
        description: vector<u8>,
        image_template_url: vector<u8>,
        certificate_type: vector<u8>,
        fields: vector<vector<u8>>, // Field names as bytes
        registry: &mut CertificateRegistry,
        ctx: &mut TxContext
    ) {
        // Verify issuer is approved
        assert!(issuer::is_approved_issuer(issuer_cap), E_ISSUER_NOT_APPROVED);
        assert!((vector::length(&fields) as u64) <= MAX_TEMPLATE_FIELDS, E_TOO_MANY_FIELDS);

        // Convert field names to strings
        let mut field_strings = vector::empty<String>();
        let mut i = 0;
        while (i < vector::length(&fields)) {
            let raw = *vector::borrow(&fields, i);
            let s = string::utf8(raw);
            // Basic validation: disallow empty field names
            assert!(string::length(&s) > 0, E_EMPTY_FIELD_NAME);
            vector::push_back(&mut field_strings, s);
            i = i + 1;
        };

        // Cache commonly used values
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);

        let template_id = object::new(ctx);
        let template = CertificateTemplate {
            id: template_id,
            issuer_cap_id: object::id(issuer_cap),
            template_name: string::utf8(template_name),
            description: string::utf8(description),
            image_template_url: string::utf8(image_template_url),
            certificate_type: string::utf8(certificate_type),
            fields: field_strings,
            issuer_name: *issuer::get_issuer_name(issuer_cap),
            created_at: timestamp,
            is_active: true,
        };

        // Update registry
        registry.total_templates = registry.total_templates + 1;

        // Emit event using earlier cached values
        event::emit(TemplateCreatedEvent {
            template_id: object::id(&template),
            issuer_address: sender,
            template_name: template.template_name,
            certificate_type: template.certificate_type,
            timestamp,
        });

        transfer::public_transfer(template, sender);
    }

    public entry fun deactivate_template(
        issuer_cap: &IssuerCap,
        template: &mut CertificateTemplate,
        _ctx: &mut TxContext
    ) {
        assert!(template.issuer_cap_id == object::id(issuer_cap), 1);
        template.is_active = false;
        event::emit(TemplateDeactivatedEvent { 
            template_id: object::id(template), 
            issuer_address: issuer::get_issuer_address(issuer_cap), 
            timestamp: tx_context::epoch_timestamp_ms(_ctx) 
        });
    }

    // ===== Certificate Issuance =====

    /// Issue a certificate to a user
    public entry fun issue_certificate(
        issuer_cap: &IssuerCap,
        template: &CertificateTemplate,
        recipient: address,
        field_names: vector<vector<u8>>,
        field_values: vector<vector<u8>>,
        expiry_date: Option<u64>, // Optional expiry timestamp
    client_provided_id: vector<u8>,
        registry: &mut CertificateRegistry,
        ctx: &mut TxContext
    ) {
        // Cache commonly used values
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        let template_id_ref = object::id(template);
        let issuer_cap_id = object::id(issuer_cap);

        // Validations
    assert!(issuer::is_approved_issuer(issuer_cap), E_ISSUER_NOT_APPROVED);
    assert!(template.issuer_cap_id == issuer_cap_id, E_TEMPLATE_OWNERSHIP);
    assert!(template.is_active, E_TEMPLATE_INACTIVE);
    assert!(vector::length(&field_names) == vector::length(&field_values), E_FIELD_MISMATCH);
    assert!((vector::length(&field_names) as u64) <= MAX_TEMPLATE_FIELDS, E_TOO_MANY_FIELDS);

        // Create field data table
        let mut certificate_data = table::new(ctx);
        let mut i = 0;
        while (i < vector::length(&field_names)) {
            let raw_name = *vector::borrow(&field_names, i);
            let raw_val = *vector::borrow(&field_values, i);
            let fn_s = string::utf8(raw_name);
            let fv_s = string::utf8(raw_val);
            assert!(string::length(&fn_s) > 0, E_EMPTY_FIELD_NAME);
            assert!(string::length(&fv_s) > 0, E_EMPTY_FIELD_VALUE);
            table::add(&mut certificate_data, fn_s, fv_s);
            i = i + 1;
        };

        // Generate certificate hash for verification (includes field data)
        let certificate_hash = generate_certificate_hash(
            template_id_ref,
            sender,
            recipient,
            timestamp,
            &field_names,
            &field_values
        );

        let certificate_id = object::new(ctx);
        let certificate = IssuedCertificate {
            id: certificate_id,
            template_id: template_id_ref,
            issuer_address: sender,
            recipient_address: recipient,
            certificate_data,
            issued_at: timestamp,
            expiry_date,
            is_minted: false,
            mint_transaction_id: option::none(),
            certificate_hash,
            is_revoked: false,
            revoked_at: option::none(),
        };

        // Update registry
        registry.total_certificates = registry.total_certificates + 1;

        // Emit event
        event::emit(CertificateIssuedEvent {
            certificate_id: object::id(&certificate),
            template_id: template_id_ref,
            issuer: sender,
            recipient,
            certificate_type: template.certificate_type,
            client_provided_id: string::utf8(client_provided_id),
            timestamp,
        });

        // Transfer to recipient (they can later authorize minting)
        transfer::public_transfer(certificate, recipient);
    }

    /// Mark certificate as minted (called after successful NFT mint)
    public entry fun mark_certificate_minted(
        certificate: &mut IssuedCertificate,
        nft_id: ID,
        mint_tx_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Only the recipient can mark as minted
    assert!(certificate.recipient_address == tx_context::sender(ctx), E_NOT_RECIPIENT);
    assert!(!certificate.is_minted, E_ALREADY_MINTED); // Prevent double minting
    assert!(!certificate.is_revoked, E_REVOKED_CANNOT_MINT);

        certificate.is_minted = true;
        certificate.mint_transaction_id = option::some(string::utf8(mint_tx_id));

        // Emit minted event
        event::emit(CertificateMintedEvent {
            certificate_id: object::id(certificate),
            nft_id,
            recipient: certificate.recipient_address,
            mint_transaction_id: string::utf8(mint_tx_id),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // ===== View Functions =====

    public fun get_certificate_template_info(template: &CertificateTemplate): (String, String, String, bool) {
        (template.template_name, template.description, template.certificate_type, template.is_active)
    }

    public fun get_certificate_info(certificate: &IssuedCertificate): (address, address, u64, bool, bool) {
        (certificate.issuer_address, certificate.recipient_address, certificate.issued_at, certificate.is_minted, certificate.is_revoked)
    }

    public fun is_certificate_expired(certificate: &IssuedCertificate, current_time: u64): bool {
        if (option::is_some(&certificate.expiry_date)) {
            let expiry = *option::borrow(&certificate.expiry_date);
            current_time > expiry
        } else {
            false
        }
    }

    public fun get_certificate_hash(certificate: &IssuedCertificate): &String {
        &certificate.certificate_hash
    }

    public fun get_registry_stats(registry: &CertificateRegistry): (u64, u64) {
        (registry.total_certificates, registry.total_templates)
    }

    // ===== Helper Functions =====

    /// Revoke a certificate (issuer only)
    public entry fun revoke_certificate(
        issuer_cap: &IssuerCap,
        certificate: &mut IssuedCertificate,
        ctx: &mut TxContext
    ) {
        assert!(certificate.issuer_address == issuer::get_issuer_address(issuer_cap), E_TEMPLATE_OWNERSHIP);
        assert!(!certificate.is_revoked, E_ALREADY_REVOKED);
        certificate.is_revoked = true;
        certificate.revoked_at = option::some(tx_context::epoch_timestamp_ms(ctx));
        event::emit(CertificateRevokedEvent {
            certificate_id: object::id(certificate),
            template_id: certificate.template_id,
            issuer: certificate.issuer_address,
            recipient: certificate.recipient_address,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Mint NFT for a certificate (issuer or recipient may initiate). Marks certificate minted.
    public entry fun mint_certificate_nft(
        certificate: &mut IssuedCertificate,
        recipient: address,
        mint_label: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Only intended recipient may mint (prevents issuer-controlled mint without recipient)
        let sender = tx_context::sender(ctx);
        assert!(certificate.recipient_address == recipient, E_NOT_RECIPIENT);
        assert!(sender == recipient, E_NOT_RECIPIENT);
        assert!(!certificate.is_revoked, E_REVOKED_CANNOT_MINT);
        assert!(!certificate.is_minted, E_ALREADY_MINTED);

        let nft = CertificateNFT {
            id: object::new(ctx),
            certificate_id: object::id(certificate),
            template_id: certificate.template_id,
            issuer: certificate.issuer_address,
            recipient: certificate.recipient_address,
            issued_at: certificate.issued_at,
            certificate_hash: certificate.certificate_hash,
        };

        // Mark minted & set tx id label
        certificate.is_minted = true;
        certificate.mint_transaction_id = option::some(string::utf8(mint_label));

        event::emit(CertificateMintedEvent {
            certificate_id: object::id(certificate),
            nft_id: object::id(&nft),
            recipient: certificate.recipient_address,
            mint_transaction_id: string::utf8(mint_label),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        // Transfer NFT to recipient
        transfer::public_transfer(nft, recipient);
    }

    /// One-time update of mint transaction id label (e.g., replace placeholder with real digest)
    public entry fun update_mint_tx_id(
        certificate: &mut IssuedCertificate,
        updater: address,
        new_label: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Must already be minted
        assert!(certificate.is_minted, E_NOT_MINTED);
        // Authorization: only issuer or recipient can update
        assert!(updater == certificate.recipient_address || updater == certificate.issuer_address, E_NOT_RECIPIENT);
        // Only allow update if currently set to placeholder "pending"
        if (option::is_some(&certificate.mint_transaction_id)) {
            let s_ref = option::borrow(&certificate.mint_transaction_id);
            let bytes = string::as_bytes(s_ref);
            // allow update only if bytes == b"pending"
            let mut allow = true;
            if (vector::length(bytes) != 7) {
                allow = false;
            } else {
                if (!(bytes == &b"pending")) { allow = false; }
            };
            assert!(allow, E_LABEL_ALREADY_FINALIZED); // reuse error for disallowing re-update
        } else {
            // Should not happen if minted path set placeholder
            assert!(false, E_ALREADY_MINTED);
        };
        certificate.mint_transaction_id = option::some(string::utf8(new_label));
        event::emit(UpdateMintTxIdEvent {
            certificate_id: object::id(certificate),
            nft_id: object::id(certificate),
            new_label: string::utf8(new_label),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    public fun some_expiry(val: u64): Option<u64> { option::some(val) }
    public fun none_expiry(): Option<u64> { option::none<u64>() }

    fun generate_certificate_hash(
        template_id: ID,
        issuer: address,
        recipient: address,
        timestamp: u64,
        field_names: &vector<vector<u8>>,
        field_values: &vector<vector<u8>>,
    ): String {
        let mut data = vector::empty<u8>();
        vector::append(&mut data, object::id_to_bytes(&template_id));
        vector::append(&mut data, bcs::to_bytes(&issuer));
        vector::append(&mut data, bcs::to_bytes(&recipient));
        vector::append(&mut data, bcs::to_bytes(&timestamp));
        let mut i = 0;
        while (i < vector::length(field_names)) {
            vector::append(&mut data, *vector::borrow(field_names, i));
            vector::append(&mut data, *vector::borrow(field_values, i));
            i = i + 1;
        };
        let digest = hash::blake2b256(&data);
        string::utf8(bcs::to_bytes(&digest))
    }

    /// Direct issue and mint certificate as NFT in one transaction
    /// This bypasses the two-step process and directly creates an NFT
    public entry fun issue_and_mint_certificate(
        issuer_cap: &IssuerCap,
        template: &CertificateTemplate,
        recipient: address,
        field_names: vector<vector<u8>>,
        field_values: vector<vector<u8>>,
        expiry_date: Option<u64>,
        client_provided_id: vector<u8>,
        registry: &mut CertificateRegistry,
        ctx: &mut TxContext
    ) {
        // Cache commonly used values
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        let template_id_ref = object::id(template);
        let issuer_cap_id = object::id(issuer_cap);

        // Validations
        assert!(issuer::is_approved_issuer(issuer_cap), E_ISSUER_NOT_APPROVED);
        assert!(template.issuer_cap_id == issuer_cap_id, E_TEMPLATE_OWNERSHIP);
        assert!(template.is_active, E_TEMPLATE_INACTIVE);
        assert!(vector::length(&field_names) == vector::length(&field_values), E_FIELD_MISMATCH);
        assert!((vector::length(&field_names) as u64) <= MAX_TEMPLATE_FIELDS, E_TOO_MANY_FIELDS);

        // Generate certificate hash for verification
        let certificate_hash = generate_certificate_hash(
            template_id_ref,
            sender,
            recipient,
            timestamp,
            &field_names,
            &field_values
        );

        // Create the NFT directly
        let nft_id = object::new(ctx);
        let nft_object_id = object::uid_to_inner(&nft_id);
        let nft = CertificateNFT {
            id: nft_id,
            certificate_id: nft_object_id, // Self-reference since it's the certificate
            template_id: template_id_ref,
            issuer: sender,
            recipient: recipient,
            issued_at: timestamp,
            certificate_hash,
        };

        // Update registry
        registry.total_certificates = registry.total_certificates + 1;

        // Emit issuance event
        event::emit(CertificateIssuedEvent {
            certificate_id: nft_object_id,
            template_id: template_id_ref,
            issuer: sender,
            recipient,
            certificate_type: template.certificate_type,
            client_provided_id: string::utf8(client_provided_id),
            timestamp,
        });

        // Emit minting event
        event::emit(CertificateMintedEvent {
            certificate_id: nft_object_id,
            nft_id: nft_object_id,
            recipient: recipient,
            mint_transaction_id: string::utf8(client_provided_id),
            timestamp,
        });

        // Transfer NFT directly to recipient
        transfer::public_transfer(nft, recipient);
    }
}
