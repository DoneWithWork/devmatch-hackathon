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

    // Import from issuer module
    use devmatch_nft::issuer::{Self, IssuerCap};

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
        timestamp: u64,
    }

    public struct CertificateMintedEvent has copy, drop {
        certificate_id: ID,
        nft_id: ID,
        recipient: address,
        mint_transaction_id: String,
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
        assert!(issuer::is_approved_issuer(issuer_cap), 0);

        // Convert field names to strings
        let mut field_strings = vector::empty<String>();
        let mut i = 0;
        while (i < vector::length(&fields)) {
            vector::push_back(&mut field_strings, string::utf8(*vector::borrow(&fields, i)));
            i = i + 1;
        };

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
            created_at: tx_context::epoch_timestamp_ms(ctx),
            is_active: true,
        };

        // Update registry
        registry.total_templates = registry.total_templates + 1;

        // Emit event
        event::emit(TemplateCreatedEvent {
            template_id: object::id(&template),
            issuer_address: tx_context::sender(ctx),
            template_name: template.template_name,
            certificate_type: template.certificate_type,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        transfer::public_transfer(template, tx_context::sender(ctx));
    }

    public entry fun deactivate_template(
        issuer_cap: &IssuerCap,
        template: &mut CertificateTemplate,
        _ctx: &mut TxContext
    ) {
        assert!(template.issuer_cap_id == object::id(issuer_cap), 1);
        template.is_active = false;
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
        registry: &mut CertificateRegistry,
        ctx: &mut TxContext
    ) {
        // Validations
        assert!(issuer::is_approved_issuer(issuer_cap), 0);
        assert!(template.issuer_cap_id == object::id(issuer_cap), 1);
        assert!(template.is_active, 2);
        assert!(vector::length(&field_names) == vector::length(&field_values), 3);

        // Create field data table
        let mut certificate_data = table::new(ctx);
        let mut i = 0;
        while (i < vector::length(&field_names)) {
            let field_name = string::utf8(*vector::borrow(&field_names, i));
            let field_value = string::utf8(*vector::borrow(&field_values, i));
            table::add(&mut certificate_data, field_name, field_value);
            i = i + 1;
        };

        // Generate certificate hash for verification
        let certificate_hash = generate_certificate_hash(
            object::id(template),
            tx_context::sender(ctx),
            recipient,
            tx_context::epoch_timestamp_ms(ctx)
        );

        let certificate_id = object::new(ctx);
        let certificate = IssuedCertificate {
            id: certificate_id,
            template_id: object::id(template),
            issuer_address: tx_context::sender(ctx),
            recipient_address: recipient,
            certificate_data,
            issued_at: tx_context::epoch_timestamp_ms(ctx),
            expiry_date,
            is_minted: false,
            mint_transaction_id: option::none(),
            certificate_hash,
        };

        // Update registry
        registry.total_certificates = registry.total_certificates + 1;

        // Emit event
        event::emit(CertificateIssuedEvent {
            certificate_id: object::id(&certificate),
            template_id: object::id(template),
            issuer: tx_context::sender(ctx),
            recipient,
            certificate_type: template.certificate_type,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
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
        assert!(certificate.recipient_address == tx_context::sender(ctx), 0);
        assert!(!certificate.is_minted, 1); // Prevent double minting

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

    public fun get_certificate_info(certificate: &IssuedCertificate): (address, address, u64, bool) {
        (certificate.issuer_address, certificate.recipient_address, certificate.issued_at, certificate.is_minted)
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

    fun generate_certificate_hash(
        template_id: ID,
        issuer: address,
        recipient: address,
        timestamp: u64
    ): String {
        // Simple hash generation - in production, use proper cryptographic hash
        let mut hash_data = vector::empty<u8>();
        vector::append(&mut hash_data, object::id_to_bytes(&template_id));
        vector::append(&mut hash_data, bcs::to_bytes(&issuer));
        vector::append(&mut hash_data, bcs::to_bytes(&recipient));
        vector::append(&mut hash_data, bcs::to_bytes(&timestamp));
        
        // Convert to hex string (simplified)
        string::utf8(hash_data)
    }
}
