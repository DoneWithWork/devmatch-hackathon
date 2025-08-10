# HashCred Platform - Complete Documentation

## 🚀 Overview

HashCred is a comprehensive blockchain-based certificate verification platform built with Next.js 15, Sui blockchain, and modern web technologies. The platform enables institutions to issue tamper-proof certificates with instant verification capabilities.

## 🏗️ Architecture & Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: ZkLogin + Google OAuth integration
- **State Management**: React hooks with Iron Session

### Backend

- **API**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM (hosted on Neon)
- **Blockchain**: Sui blockchain with Move smart contracts
- **File Storage**: UploadThing for template and asset management
- **Session Management**: Iron Session for secure server-side sessions

### Blockchain Integration

- **Network**: Sui Devnet
- **Smart Contracts**: Move-based certificate issuance system
- **Authentication**: Zero-knowledge proof authentication
- **NFT Support**: Certificate minting as blockchain NFTs

## 👥 User Roles & Access Control

### 🧑‍💼 **Regular Users**

**Access**: Single login button → "User Login" → Google OAuth

**Dashboard**: `/dashboard`

- View and manage received certificates
- Download certificates in various formats
- Apply to become an issuer
- Verify certificate authenticity

### 🏢 **Issuers (Approved)**

**Access**: Single login button → "Issuer Login" → Google OAuth + capability check

**Unified Dashboard**: `/issuer`
Three integrated tabs:

1. **Issue Certificates**: Template-based issuance with dynamic forms
2. **Manage & View**: Certificate tracking and management
3. **Templates**: Create and edit certificate templates

**Features**:

- Template-based certificate creation
- Bulk certificate issuance with CSV import
- Dynamic key-value form fields (no JSON required)
- Certificate tracking and management
- Blockchain minting capabilities

### 🛡️ **Administrators**

**Access**: Single login button → "Admin Login" → Admin key (`admin123`)

**Admin Dashboard**: `/admin`
Four main sections:

1. **System Status**: Real-time health monitoring
2. **Issuer Management**: Approve/create issuer capabilities
3. **Configuration**: Environment and blockchain settings
4. **Admin Tools**: Database testing, gas management

## 🎯 Quick Start Guide

### 1. Initial Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 2. Access the Platform

**URL**: `http://localhost:3000`

**Login**: Click "Login to HashCred" button on landing page

### 3. Role-Based Access

#### **For Users**:

1. Select "User Login" → Google OAuth
2. Complete authentication
3. Access dashboard at `/dashboard`

#### **For Issuers**:

1. Select "Issuer Login" → Google OAuth
2. System checks issuer capabilities
3. Access unified dashboard at `/issuer`

#### **For Admins**:

1. Select "Admin Login"
2. Enter admin key: `admin123`
3. Access admin panel at `/admin`

## 📜 Certificate Management Workflow

### Creating Certificate Templates

1. **Access**: Issuer dashboard → "Templates" tab
2. **Create**: Use dynamic form builder
3. **Configure**: Set fields, design, metadata
4. **Save**: Template becomes available for issuance

### Issuing Certificates

1. **Select Template**: From available options
2. **Fill Details**: Using dynamic key-value fields
3. **Generate**: Certificate with blockchain verification
4. **Deliver**: Recipient receives verifiable certificate

### Verification Process

1. **Public Access**: `/verify` route (no authentication required)
2. **Input**: Certificate ID or scan QR code
3. **Verification**: Blockchain-based authenticity check
4. **Result**: Instant verification status with details

## 🔐 Security & Authentication

### Multi-Layer Security

- **Google OAuth**: For user and issuer authentication
- **ZkLogin**: Zero-knowledge proof integration
- **Admin Key**: Separate authentication for administrators
- **Blockchain Verification**: Immutable certificate records

### Role-Based Access Control

- **Route Protection**: Middleware-enforced access control
- **Session Management**: Secure server-side session storage
- **Capability Verification**: Real-time role and permission checking

## 🛠️ Admin Operations

### Issuer Management

**Web-Based Operations** (no command-line required):

1. **Approve Existing Issuer**:

   - Admin dashboard → "Issuer Management"
   - Click "Approve Issuer"
   - Blockchain transaction executed automatically

2. **Create New Issuer**:
   - Admin dashboard → "Issuer Management"
   - Click "Create New Issuer"
   - New capability created and approved

### System Monitoring

**Real-Time Status Checks**:

- Address derivation verification
- Blockchain connectivity monitoring
- Database health checks
- Issuer approval status tracking

### Configuration Management

**Environment Tools**:

- Database connection testing
- Configuration backup and restore
- System health diagnostics
- Gas balance monitoring

## 📱 Platform Routes

### Public Routes

- `/` - Landing page with unified login
- `/verify` - Certificate verification (no auth)
- `/verify-cert` - Verify by certificate ID
- `/navigation` - Platform navigation hub

### Authenticated Routes

- `/dashboard` - User certificate management
- `/issuer` - Unified issuer dashboard
- `/admin` - Administrative control panel
- `/apply` - Apply to become issuer

## 🔧 Environment Configuration

### Critical Variables

```env
# Blockchain Configuration
ADMIN_PRIVATE_KEY=...                    # Ed25519 private key
ADMIN_WALLET_ADDRESS=...                 # Derived wallet address
CURRENT_ISSUER_CAP=...                   # Issuer capability ID
NEXT_PUBLIC_PACKAGE_ID=...               # Smart contract package

# Database
DATABASE_URL=postgresql://...            # Neon PostgreSQL connection

# Authentication
SESSION_KEY=...                          # Session encryption key
ADMIN_LOGIN_KEY=admin123                 # Admin login key (default)
```

### Backup Files

- `ADDRESSES_BACKUP.md` - Emergency recovery addresses
- `ENVIRONMENT_BACKUP.md` - Complete configuration backup
- `.env.local.backup` - Direct environment copy

## 🚨 Emergency Recovery

### If Environment is Lost

1. Check `ADDRESSES_BACKUP.md` for recovery instructions
2. Restore from `.env.local.backup`
3. Use admin dashboard "Reset to Backup" functionality

### If Database Connection Fails

1. Admin dashboard → "Admin Tools" → "Test Database"
2. Verify DATABASE_URL configuration
3. Check Neon dashboard status

### If Blockchain Operations Fail

1. Admin dashboard → "System Status" for diagnostics
2. Verify address and capability matching
3. Check Sui network status

## 🎯 Key Implementation Features

### Unified Login System

- **Single Entry Point**: One login button handles all user types
- **Role Detection**: Automatic capability checking and role assignment
- **Smart Routing**: Direct redirection to appropriate dashboards

### Consolidated Architecture

- **No Redundant Routes**: Cleaned up `/issue` and duplicate pages
- **Unified Dashboards**: Single portal for each user type
- **Streamlined Navigation**: Clear, role-based menu structure

### Production-Ready Admin Interface

- **Web-Based Operations**: No command-line tools required
- **Real-Time Monitoring**: Live system health dashboards
- **One-Click Management**: Simplified admin operations

## 🎨 UI/UX Features

### Landing Page

- Professional hero section with clear value proposition
- Prominent unified login button
- Feature highlights and platform benefits

### Dashboards

- **Responsive Design**: Works on all device sizes
- **Intuitive Navigation**: Tab-based organization
- **Real-Time Updates**: Live status and progress indicators

### Forms & Interactions

- **Dynamic Forms**: No JSON input required for certificates
- **Key-Value Fields**: User-friendly certificate creation
- **Bulk Operations**: CSV import for multiple certificates

## 📊 Performance & Monitoring

### Real-Time Tracking

- Gas balance monitoring and alerts
- Transaction history and audit trails
- System health diagnostics
- User activity tracking

### Optimization

- **Turbopack**: Fast development builds
- **Component Optimization**: Efficient rendering
- **Database Indexing**: Optimized query performance

## 🔄 Deployment & Maintenance

### Production Deployment

1. Set environment variables
2. Configure database connection
3. Deploy to hosting platform
4. Set up monitoring and alerts

### Ongoing Maintenance

- Monitor gas balances for blockchain operations
- Regular database maintenance
- Security updates and patches
- User feedback integration

## 📚 Additional Resources

### Documentation Files

- `README.md` - Project overview and setup
- `ADDRESSES_BACKUP.md` - Emergency recovery information
- `ENVIRONMENT_BACKUP.md` - Configuration backup

### Development Tools

- Admin dashboard for system management
- Real-time monitoring and diagnostics
- Automated testing and validation

---

## 🎉 Summary

HashCred provides a complete, production-ready certificate management platform with:

✅ **Unified Authentication**: Single login for all user types
✅ **Role-Based Access**: Automatic capability detection and routing  
✅ **Web-Based Admin**: No command-line tools required
✅ **Blockchain Integration**: Secure, immutable certificate records
✅ **Professional UI**: Modern, responsive design
✅ **Complete Documentation**: Ready for developer handoff

The platform is fully operational and ready for production deployment with comprehensive admin tools and emergency recovery procedures.
