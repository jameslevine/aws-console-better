# AWS Console Better — Tools & Technology Decisions

## Language & Runtime

| Technology | Version | Purpose |
|-----------|---------|---------|
| **TypeScript** | 5.x | Primary language for both extension and backend |
| **Node.js** | 20.x LTS | Backend runtime (Lambda) |
| **Chrome Extension APIs** | Manifest V3 | Extension platform |

---

## Chrome Extension (Frontend)

### Core Framework

| Technology | Version | Justification |
|-----------|---------|---------------|
| **React** | 18.x | Component-based UI, large ecosystem, excellent for complex UIs. Used for popup, side panel, and injected content components. |
| **TypeScript** | 5.x | Type safety, better developer experience, catches errors at compile time |
| **Vite** | 5.x | Fast build tool with HMR, excellent plugin ecosystem |
| **CRXJS Vite Plugin** | Latest | Vite plugin specifically designed for Chrome Extension development. Handles manifest processing, HMR in extensions, and multi-entry builds. |

### Styling

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Tailwind CSS** | 3.x | Utility-first CSS framework. Lightweight, no runtime overhead, perfect for extensions where bundle size matters. Scoped styles prevent conflicts with AWS Console CSS. |
| **PostCSS** | Latest | Required by Tailwind CSS for processing |

### State Management & Data Fetching

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Zustand** | Latest | Lightweight state management (< 1KB). Simple API, no boilerplate. Perfect for extension where bundle size matters. |
| **TanStack Query** | Latest | Server state management with caching, background refetching, and optimistic updates. Handles API call lifecycle elegantly. |

### Utilities

| Technology | Version | Justification |
|-----------|---------|---------------|
| **dayjs** | Latest | Lightweight date utility (2KB vs moment.js 67KB). Used for formatting timestamps. |
| **uuid** | Latest | Generate unique IDs for local operations |

---

## Backend API

### Core Framework

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Express** | 4.x | Mature, well-documented web framework. Pairs well with serverless-http for Lambda deployment. Per project conventions. |
| **serverless-http** | Latest | Wraps Express app for AWS Lambda compatibility. Enables local development with standard Express while deploying to Lambda. |
| **TypeScript** | 5.x | Type safety for API contracts and AWS SDK interactions |

### Validation

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Joi** | Latest | Schema-based validation for request bodies, params, and query strings. Per project conventions. |

### AWS Integration

| Technology | Version | Justification |
|-----------|---------|---------------|
| **AWS SDK v3** | Latest | Modular SDK — import only the service clients needed. Tree-shakeable, smaller bundle size than v2. |
| **@aws-sdk/client-ec2** | Latest | EC2 operations |
| **@aws-sdk/client-s3** | Latest | S3 operations |
| **@aws-sdk/client-lambda** | Latest | Lambda operations |
| **@aws-sdk/client-dynamodb** | Latest | DynamoDB operations (for user's tables) |
| **@aws-sdk/lib-dynamodb** | Latest | DynamoDB Document Client (for our own tables) |
| **@aws-sdk/client-iam** | Latest | IAM operations |
| **@aws-sdk/client-cloudformation** | Latest | CloudFormation operations |
| **@aws-sdk/client-sts** | Latest | STS for credential verification |
| **@aws-sdk/client-kms** | Latest | KMS for credential encryption/decryption |
| **@aws-sdk/client-cognito-identity-provider** | Latest | Cognito user management |

### Authentication

| Technology | Version | Justification |
|-----------|---------|---------------|
| **aws-jwt-verify** | Latest | Verify Cognito JWT tokens. Official AWS library, handles JWKS caching. |
| **Amazon Cognito** | - | Managed user authentication service. Handles registration, login, MFA, password reset. Per project conventions. |

### Utilities

| Technology | Version | Justification |
|-----------|---------|---------------|
| **uuid** | Latest | Generate unique IDs for database records |
| **dayjs** | Latest | Date formatting and manipulation |
| **cors** | Latest | CORS middleware for Express |

---

## Infrastructure

| Technology | Version | Justification |
|-----------|---------|---------------|
| **AWS SAM CLI** | Latest | Infrastructure as Code tool for serverless applications. Simplifies Lambda + API Gateway deployment. Per project conventions. |
| **CloudFormation** | - | Underlying IaC engine used by SAM. YAML templates for all resources. |
| **API Gateway (REST)** | - | HTTP endpoint with built-in throttling, CORS, and Cognito authorizer integration |
| **AWS Lambda** | Node.js 20.x | Serverless compute for the Express monolith |
| **DynamoDB** | - | NoSQL database for users, accounts, history. On-demand capacity. Per project conventions. |
| **Amazon Cognito** | - | User pool for extension user authentication |
| **AWS KMS** | - | Customer-managed key for encrypting stored AWS credentials |
| **CloudWatch** | - | Logging and monitoring for Lambda and API Gateway |
| **IAM** | - | Least-privilege roles for Lambda execution |

---

## Development Tools

### Linting & Formatting

| Tool | Version | Configuration |
|------|---------|---------------|
| **ESLint** | Latest | TypeScript + React rules for extension, TypeScript rules for backend |
| **Prettier** | Latest | Code formatting with consistent style |
| **eslint-config-airbnb-typescript** | Latest | Airbnb style guide for TypeScript (extension) |

### Git Hooks & Commit Standards

| Tool | Version | Purpose |
|------|---------|---------|
| **Husky** | Latest | Git hooks for pre-commit and pre-push |
| **commitlint** | Latest | Enforce conventional commit messages |
| **lint-staged** | Latest | Run linters on staged files only |

### Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | Latest | Unit and integration testing for both extension and backend |
| **React Testing Library** | Latest | Component testing for React UI |
| **ts-jest** | Latest | TypeScript support for Jest |
| **supertest** | Latest | HTTP assertion library for Express API testing |

### Infrastructure Validation

| Tool | Version | Purpose |
|------|---------|---------|
| **cfn-lint** | Latest | CloudFormation template linting |
| **cfn_nag** | Latest | CloudFormation security scanning |

---

## External Services

| Service | Purpose | Tier |
|---------|---------|------|
| **Chrome Web Store** | Extension distribution | Developer account ($5 one-time) |
| **AWS Account** | Backend infrastructure hosting | Pay-as-you-go |
| **GitHub** | Source code repository | Free tier |

---

## CI/CD

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | Automated testing, linting, and deployment |
| **SAM CLI** | Backend deployment to AWS |
| **Chrome Web Store API** | Automated extension publishing (future) |

---

## Environment Setup

### Prerequisites

1. **Node.js 20.x** — Install via nvm: `nvm install 20`
2. **npm** — Comes with Node.js
3. **AWS CLI** — `brew install awscli`
4. **SAM CLI** — `brew install aws-sam-cli`
5. **Chrome Browser** — For extension development and testing
6. **Git** — Version control

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/aws-console-better.git
cd aws-console-better

# Install extension dependencies
cd extension
npm install

# Install backend dependencies
cd ../backend
npm install

# Start extension development (with HMR)
cd ../extension
npm run dev

# Start backend locally
cd ../backend
npm run dev

# Load extension in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension/dist folder
```

### Environment Variables

#### Backend (.env)
```
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/xxxxx
USERS_TABLE=aws-console-better-users
ACCOUNTS_TABLE=aws-console-better-accounts
HISTORY_TABLE=aws-console-better-history
BOOKMARKS_TABLE=aws-console-better-bookmarks
```

#### Extension (.env)
```
VITE_API_BASE_URL=http://localhost:3000/v1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxx
VITE_COGNITO_REGION=us-east-1
```
