# HashCred - Blockchain Certificate Verification Platform

## 🚀 Overview

HashCred is a comprehensive blockchain-based certificate verification platform built with Next.js, Sui blockchain, and modern web technologies. The platform enables institutions to issue tamper-proof certificates and allows instant verification of their authenticity.

## ✨ Features

### 🔐 **Authentication & Security**
- **ZkLogin Integration**: Secure authentication using zero-knowledge proofs
- **Role-based Access Control**: Admin, Issuer, and User roles
- **Session Management**: Secure server-side sessions with Iron Session

### 📜 **Certificate Management**
- **Template Creation**: Issuers can create customizable certificate templates
- **Certificate Issuance**: Mint certificates as NFTs on Sui blockchain
- **Instant Verification**: Verify any certificate using blockchain technology
- **Multi-chain Support**: Built on Sui with future multi-chain compatibility

### 👥 **User Roles**

#### **Users**
- View and manage received certificates
- Apply to become certificate issuers
- Verify any certificate authenticity

#### **Issuers**
- Create certificate templates
- Issue certificates to recipients
- Manage issued certificates
- Upload supporting documents

#### **Admins**
- Approve/reject issuer applications
- Monitor gas usage and system health
- Manage platform settings

## 🏗️ Architecture

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React hooks and server components

### **Backend**
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: UploadThing for document management
- **Blockchain**: Sui Network integration
- **APIs**: RESTful API routes with TypeScript

### **Blockchain**
- **Network**: Sui Devnet/Testnet
- **Smart Contracts**: Move language contracts
- **Gas Optimization**: Chainbase Gas Tracker integration
- **NFT Standards**: Sui Move NFT implementation

## 🚦 Available Routes

### **Public Routes**
- `/` - Landing page with features and hero section
- `/verify` - Certificate verification portal
- `/apply` - Application form to become an issuer
- `/auth` - Authentication callback page

### **Protected Routes**
- `/dashboard` - User dashboard (role-based content)
- `/certificates` - View user's certificates
- `/issue` - Issue certificates (issuer role only)
- `/admin` - Admin panel (admin role only)
- `/issuer` - Issuer-specific dashboard

### **API Endpoints**

#### **Authentication**
- `POST /api/auth` - Handle ZkLogin authentication
- `POST /api/auth/delete` - Logout and destroy session

#### **Admin Endpoints**
- `GET /api/admin/applications` - Get pending issuer applications
- `POST /api/admin/approve-issuer` - Approve issuer application
- `POST /api/admin/reject-issuer` - Reject issuer application
- `GET /api/admin/balance` - Check gas balance
- `GET /api/admin/address` - Get admin wallet address

#### **Issuer Endpoints**
- `GET /api/issuer/templates` - Get issuer's templates
- `POST /api/issuer/create-template` - Create certificate template
- `POST /api/issuer/issue-certificate` - Issue a certificate
- `GET /api/issuer/certificates` - Get issued certificates

#### **User Endpoints**
- `GET /api/user/certificates` - Get user's certificates
- `POST /api/user/mint-certificate` - Mint certificate NFT

#### **Utility Endpoints**
- `POST /api/zkp` - Generate ZK proofs
- `GET /api/utils/dns/[domain]` - DNS verification
- `POST /api/test/config` - Test configuration (development)
- `POST /api/test/create-template` - Test template creation (development)

## 🛠️ Setup Instructions

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- Sui CLI
- Git

### **1. Clone and Install**
```bash
git clone <repository-url>
cd devmatch-hackathon
npm install
```

### **2. Environment Configuration**
Create `.env.local` file with:
```bash
# Database
DATABASE_URL="postgresql://..."

# Sui Blockchain
SUI_PRIVATE_KEY="suiprivkey1..."
SUI_WALLET_ADDRESS="0x..."
PACKAGE_ID="0x..."
ADMIN_CAP="0x..."
ISSUER_REGISTRY="0x..."
CERTIFICATE_REGISTRY="0x..."
SUI_ISSUER_CAP="0x..."
NETWORK="devnet"

# Session Security
SESSION_KEY="your-32-character-secret-key"

# UploadThing
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."

# DNS Verification
NEXT_PUBLIC_DNS_KEY="hashcred_verification_domain_key"
```

### **3. Database Setup**
```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

### **4. Smart Contract Deployment**
```bash
cd sui/contracts
sui client publish --gas-budget 100000000
```

### **5. Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🧪 Testing

### **Configuration Test**
```bash
curl -X POST http://localhost:3000/api/test/config
```

### **Page Navigation Test**
All routes are accessible through the responsive navigation bar:
- Click on navigation items to test routing
- Role-based navigation adapts based on user permissions
- Mobile-responsive hamburger menu

### **API Testing**
Use the provided API endpoints with tools like Postman or curl to test functionality.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin-only routes
│   ├── (user)/            # User routes
│   ├── api/               # API endpoints
│   ├── apply/             # Issuer application
│   ├── auth/              # Authentication
│   ├── certificates/      # Certificate viewing
│   ├── issue/             # Certificate issuance
│   ├── verify/            # Certificate verification
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── issuer/           # Issuer-specific components
│   ├── landing/          # Landing page components
│   ├── layouts/          # Layout components
│   ├── ui/               # shadcn/ui components
│   └── user/             # User-specific components
├── db/                   # Database configuration
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🔧 Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Drizzle ORM**: Type-safe database operations
- **Sui SDK**: Blockchain integration
- **Framer Motion**: Smooth animations
- **Iron Session**: Secure session management
- **UploadThing**: File upload service

## 🎯 Current Status

### ✅ **Working Features**
- Complete navigation system with role-based routing
- Landing page with hero, features, and footer
- Authentication flow (ZkLogin integration)
- Database schema and migrations
- API endpoints structure
- Certificate verification interface
- Admin dashboard with issuer management
- Responsive design across all pages
- File upload capabilities
- Session management

### 🔄 **In Progress**
- Sui blockchain integration (requires proper IssuerCap setup)
- Smart contract interaction optimization
- Gas fee optimization

### 📋 **Next Steps**
1. Configure proper Sui wallet credentials
2. Deploy and test smart contracts
3. Complete certificate minting flow
4. Add real-time notifications
5. Implement certificate templates
6. Add batch certificate issuance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is built for the DevMatch Hackathon and follows open-source principles.

---

**Built with ❤️ for the DevMatch Hackathon 2025**
