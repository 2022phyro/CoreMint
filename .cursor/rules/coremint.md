# CoreMint Development Rules

## Project Overview
CoreMint is a production-ready NFT minting platform built on Stacks blockchain with Next.js, featuring wallet authentication, smart contract integration, and modern UI components.

## Core Principles

### 1. Security First
- Never commit secrets or API keys to version control
- Use environment variables for all configuration
- Validate all user inputs with Zod schemas
- Implement proper JWT token handling
- Use HTTPS in production

### 2. Type Safety
- Use TypeScript for all code
- Define proper interfaces for all data structures
- Use Zod for runtime validation
- Avoid `any` types - use proper typing

### 3. Error Handling
- Always handle errors gracefully
- Provide meaningful error messages to users
- Log errors for debugging (but not in production)
- Use try-catch blocks for async operations
- Never leave console.log statements in production code

### 4. Database Best Practices
- Use Prisma for all database operations
- Validate inputs before database operations
- Use transactions for multi-step operations
- Implement proper indexing for performance
- Use MongoDB ObjectId for all IDs

### 5. API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement consistent error responses
- Use authentication middleware for protected routes
- Validate request bodies with Zod schemas

### 6. UI/UX Standards
- Use Shadcn UI components consistently
- Implement proper loading states
- Handle error states gracefully
- Ensure accessibility compliance
- Use Tailwind CSS for styling
- Support dark mode

### 7. Stacks Blockchain Integration
- Use @stacks/connect for wallet integration
- Implement proper network configuration (mainnet/testnet/devnet)
- Handle transaction states properly
- Validate blockchain responses
- Implement proper error handling for blockchain operations

## File Structure Guidelines

### Components
- Place reusable UI components in `components/ui/`
- Create feature-specific components in `components/`
- Use proper TypeScript props interfaces
- Implement proper loading and error states

### Hooks
- Place custom hooks in `hooks/`
- Use proper dependency arrays in useEffect
- Implement proper error handling
- Return consistent hook interfaces

### API Routes
- Place API routes in `app/api/`
- Use proper HTTP methods
- Implement authentication middleware
- Validate request bodies
- Return consistent response formats

### Database Operations
- Place database operations in `lib/db/`
- Use Prisma client properly
- Implement proper error handling
- Use transactions when needed

### Types
- Place TypeScript types in `lib/types/`
- Use proper naming conventions
- Export types properly
- Use Zod schemas for validation

## Code Quality Standards

### Linting and Formatting
- Use Biome for linting and formatting
- Run `pnpm lint` before committing
- Run `pnpm format` to format code
- Fix all linting errors

### Testing
- Write tests for critical functionality
- Test API endpoints
- Test database operations
- Test UI components

### Performance
- Use proper React patterns (useCallback, useMemo)
- Implement proper loading states
- Use proper async/await patterns
- Avoid unnecessary re-renders

## Environment Configuration

### Required Environment Variables
- `DATABASE_URL`: MongoDB connection string
- `SECRET_KEY`: JWT secret key (min 32 characters)
- `NEXT_PUBLIC_API_URL`: API base URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_STACKS_NETWORK`: Stacks network (mainnet/testnet/devnet)

### Optional Environment Variables
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID
- `SENTRY_DSN`: Sentry error tracking
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET`: S3 bucket name
- `RESEND_API_KEY`: Email service API key
- `FROM_EMAIL`: From email address

## Deployment Guidelines

### Production Checklist
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificate configured
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented

### Security Checklist
- [ ] No secrets in code
- [ ] Proper authentication implemented
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Security headers configured

## Common Patterns

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUser } from '@/lib/auth/middleware';

const schema = z.object({
  // Define schema
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const body = await request.json();
    const validatedData = schema.parse(body);
    
    // Process request
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 400 }
    );
  }
}
```

### Component Pattern
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  // Define props
}

export function Component({ ...props }: ComponentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setLoading(true);
      setError(null);
      // Perform action
    } catch (err) {
      setError('Error message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Database Operation Pattern
```typescript
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const schema = z.object({
  // Define schema
});

export async function createRecord(data: unknown) {
  try {
    const validatedData = schema.parse(data);
    
    const record = await prisma.record.create({
      data: validatedData,
    });
    
    return record;
  } catch (error) {
    throw new Error('Failed to create record');
  }
}
```

