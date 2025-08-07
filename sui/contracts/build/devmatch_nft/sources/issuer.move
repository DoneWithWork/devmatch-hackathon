module devmatch_nft::issuer {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use std::option::{Self, Option};

    /// Admin capability - only admin can approve issuers
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Issuer capability - approved issuers can create certificates
    public struct IssuerCap has key, store {
        id: UID,
        issuer_name: String,
        issuer_address: address,
        issuer_email: String,
        organization: String,
        approved: bool,
        created_at: u64,
        approved_at: Option<u64>,
    }

    /// Issuer Registry - tracks all issuers
    public struct IssuerRegistry has key {
        id: UID,
        total_applicants: u64,
        approved_issuers: u64,
    }

    /// One-Time-Witness for the module
    public struct ISSUER has drop {}

    // ===== Events =====
    
    public struct IssuerApplicationEvent has copy, drop {
        applicant: address,
        issuer_name: String,
        organization: String,
        timestamp: u64,
    }

    public struct IssuerApprovedEvent has copy, drop {
        issuer_address: address,
        issuer_name: String,
        organization: String,
        approved_by: address,
        timestamp: u64,
    }

    public struct IssuerRejectedEvent has copy, drop {
        issuer_address: address,
        issuer_name: String,
        rejected_by: address,
        timestamp: u64,
    }

    // ===== Initialize =====

    fun init(witness: ISSUER, ctx: &mut TxContext) {
        // Create admin capability for contract deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        // Create issuer registry
        let registry = IssuerRegistry {
            id: object::new(ctx),
            total_applicants: 0,
            approved_issuers: 0,
        };
        
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(registry);
    }

    // ===== Admin Functions =====

    /// Apply to become an issuer (anyone can apply)
    public entry fun apply_to_be_issuer(
        issuer_name: vector<u8>,
        issuer_email: vector<u8>,
        organization: vector<u8>,
        registry: &mut IssuerRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let name_string = string::utf8(issuer_name);
        let email_string = string::utf8(issuer_email);
        let org_string = string::utf8(organization);
        
        // Create pending issuer capability (not approved yet)
        let issuer_cap = IssuerCap {
            id: object::new(ctx),
            issuer_name: name_string,
            issuer_address: sender,
            issuer_email: email_string,
            organization: org_string,
            approved: false,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            approved_at: option::none(),
        };

        // Update registry
        registry.total_applicants = registry.total_applicants + 1;

        // Emit application event
        event::emit(IssuerApplicationEvent {
            applicant: sender,
            issuer_name: name_string,
            organization: org_string,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        transfer::public_transfer(issuer_cap, sender);
    }

    /// Admin approves an issuer application
    public entry fun approve_issuer(
        _admin_cap: &AdminCap,
        issuer_cap: &mut IssuerCap,
        registry: &mut IssuerRegistry,
        ctx: &mut TxContext
    ) {
        assert!(!issuer_cap.approved, 0); // Must not be already approved
        
        issuer_cap.approved = true;
        issuer_cap.approved_at = option::some(tx_context::epoch_timestamp_ms(ctx));
        
        // Update registry
        registry.approved_issuers = registry.approved_issuers + 1;
        
        event::emit(IssuerApprovedEvent {
            issuer_address: issuer_cap.issuer_address,
            issuer_name: issuer_cap.issuer_name,
            organization: issuer_cap.organization,
            approved_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Admin rejects an issuer application
    public entry fun reject_issuer(
        _admin_cap: &AdminCap,
        issuer_cap: IssuerCap,
        ctx: &mut TxContext
    ) {
        // Emit rejection event before destroying
        event::emit(IssuerRejectedEvent {
            issuer_address: issuer_cap.issuer_address,
            issuer_name: issuer_cap.issuer_name,
            rejected_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        // Destroy the issuer capability
        let IssuerCap { 
            id, 
            issuer_name: _, 
            issuer_address: _, 
            issuer_email: _, 
            organization: _, 
            approved: _, 
            created_at: _,
            approved_at: _
        } = issuer_cap;
        object::delete(id);
    }

    /// Admin can revoke an approved issuer
    public entry fun revoke_issuer(
        _admin_cap: &AdminCap,
        issuer_cap: &mut IssuerCap,
        registry: &mut IssuerRegistry,
        ctx: &mut TxContext
    ) {
        assert!(issuer_cap.approved, 0); // Must be approved to revoke
        
        issuer_cap.approved = false;
        registry.approved_issuers = registry.approved_issuers - 1;
        
        event::emit(IssuerRejectedEvent {
            issuer_address: issuer_cap.issuer_address,
            issuer_name: issuer_cap.issuer_name,
            rejected_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // ===== View Functions =====

    public fun is_approved_issuer(issuer_cap: &IssuerCap): bool {
        issuer_cap.approved
    }

    public fun get_issuer_name(issuer_cap: &IssuerCap): &String {
        &issuer_cap.issuer_name
    }

    public fun get_issuer_info(issuer_cap: &IssuerCap): (&String, &String, &String, bool) {
        (&issuer_cap.issuer_name, &issuer_cap.issuer_email, &issuer_cap.organization, issuer_cap.approved)
    }

    public fun get_registry_stats(registry: &IssuerRegistry): (u64, u64) {
        (registry.total_applicants, registry.approved_issuers)
    }
}
