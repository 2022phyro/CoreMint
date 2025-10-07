# CoreMint

A production-ready NFT minting platform built on Stacks blockchain with Next.js, featuring wallet authentication, smart contract integration, and modern UI components.

## 🎯 Project Goals

- **🎨 NFT Creation**: Enable users to create, mint, and manage NFTs on Stacks blockchain
- **🔗 Wallet Integration**: Seamless Stacks wallet connection and authentication
- **📱 Modern UX**: Beautiful, responsive interface with intuitive user flows
- **🔐 Security**: Secure authentication with wallet signatures and JWT tokens
- **⚡ Performance**: Fast, optimized platform with proper error handling

## 🚫 Non-Goals

- Multi-chain support (Stacks only)
- Complex marketplace features (focus on minting)
- Advanced trading functionality
- Mobile app development (web-first)

## 🚀 Features

- **🎨 NFT Minting**: Create, mint, and manage NFTs on Stacks blockchain
- **🔗 Wallet Integration**: Seamless Stacks wallet connection using `@stacks/connect`
- **🔐 JWT Authentication**: Secure authentication with wallet signatures
- **📱 Modern UI**: Beautiful, responsive interface with Tailwind CSS and Radix UI
- **🗄️ Database Ready**: MongoDB integration with Prisma ORM for NFT metadata
- **📝 Type Safety**: Full TypeScript support with proper type definitions
- **🛠️ Smart Contracts**: Clarinet integration for Stacks smart contract development
- **🎨 Component Library**: Pre-built UI components following design system patterns
- **📊 API Routes**: RESTful API endpoints for authentication, NFT management, and user data
- **🔧 Developer Experience**: Biome for linting/formatting, hot reload, and more

## 🏗️ Project Structure

```
├── app/                    # Next.js 13+ app router
│   ├── api/auth/          # Authentication API endpoints
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main wallet connection page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── wallet-connection.tsx
├── hooks/                # Custom React hooks
│   ├── wallet.ts         # Wallet connection and auth
│   └── api-client.ts     # API client with auth
├── lib/                  # Utility libraries
│   ├── auth/            # JWT and authentication utilities
│   ├── db/              # Database operations
│   ├── config/          # Configuration files
│   └── types/           # TypeScript type definitions
├── providers/           # React context providers
├── contracts/           # Stacks smart contracts
├── prisma/             # Database schema and migrations
└── _docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database
- Stacks wallet (Hiro Wallet, Xverse, etc.)

### Target Networks

- **Development**: Stacks Devnet (default)
- **Testing**: Stacks Testnet  
- **Production**: Stacks Mainnet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/2022phyro/CoreMint.git
   cd CoreMint
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/coremint"
   
   # JWT Secret (change this in production)
   SECRET_KEY="your-super-secret-jwt-key-change-this-in-production"
   
   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   NEXT_PUBLIC_APP_NAME="CoreMint"
   NEXT_PUBLIC_STACKS_NETWORK="devnet"
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome
pnpm typecheck        # Run TypeScript type checking

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes to database
pnpm db:reset         # Reset database (development only)
pnpm db:studio        # Open Prisma Studio
```

## 🔐 Authentication Flow

The template implements a complete wallet-based authentication system:

1. **Wallet Connection**: Users connect their Stacks wallet
2. **Nonce Generation**: Server generates a unique nonce for signing
3. **Message Signing**: User signs an authentication message
4. **JWT Token**: Server verifies signature and issues JWT token
5. **Session Management**: Client stores session and includes token in API requests

### API Endpoints

- `POST /api/auth/nonce` - Generate authentication nonce
- `POST /api/auth/login` - Authenticate with wallet signature  
- `GET /api/auth/me` - Get current user profile

See [`_docs/API_ENDPOINTS.md`](_docs/API_ENDPOINTS.md) for detailed API documentation.

## 🎨 UI Components

The template includes a comprehensive set of UI components:

- **Button**: Multiple variants and sizes
- **Card**: Content containers with header, body, and footer
- **Input**: Form input components
- **Wallet Connection**: Complete wallet connection interface

All components follow design system patterns and support dark mode.

## 🗄️ Database Schema

CoreMint uses MongoDB with Prisma ORM. The main entities include:

```prisma
model User {
  id                 String   @id @default(auto()) @map("_id") @db.ObjectId
  walletAddress      String   @unique
  username          String?
  bio               String?
  avatar            String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?
  loginCount        Int      @default(0)
  connectionHistory Json
  nfts              NFT[]
  collections       Collection[]
  transactions      Transaction[]
  @@map("users")
}

model NFT {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  image       String
  metadata    Json
  tokenId     String?
  contractAddress String?
  isMinted    Boolean  @default(false)
  mintedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ownerId     String
  collectionId String?
  @@map("nfts")
}

model Collection {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  image       String?
  banner      String?
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ownerId     String
  nfts        NFT[]
  @@map("collections")
}
```

## 🔗 Smart Contract Integration

CoreMint includes Clarinet configuration for Stacks smart contract development:

- **Clarinet.toml**: Project configuration
- **contracts/**: Smart contract source files
- **tests/**: Contract test files
- **settings/**: Network-specific settings (Devnet, Testnet, Mainnet)

## 🛠️ Development Guidelines

### Code Quality
- Use Biome for linting and formatting
- Follow TypeScript best practices
- Implement proper error handling
- Use semantic commit messages

### Component Development
- Use existing UI components from `components/ui/`
- Follow the patterns in `components/wallet-connection.tsx`
- Implement proper loading and error states
- Use TypeScript for all props and state

### API Development
- Follow RESTful patterns
- Use Zod for request validation
- Implement proper error responses
- Use the authentication middleware for protected routes

## 📚 Documentation

- [`_docs/API_ENDPOINTS.md`](_docs/API_ENDPOINTS.md) - Complete API documentation
- [`.cursor/rules/coremint.md`](.cursor/rules/coremint.md) - Development guidelines and patterns

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

CoreMint works with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Stacks Documentation](https://docs.stacks.co/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](_docs/)
2. Search existing [GitHub Issues](https://github.com/2022phyro/CoreMint/issues)
3. Create a new issue with detailed information

---

**Happy building! 🚀**
