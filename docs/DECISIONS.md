# AWS Console Better — Architecture Decision Records (ADRs)

## ADR-001: Chrome Extension as Delivery Mechanism

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: We needed to decide how to deliver the AWS Console enhancement tool. Options included a standalone web app, VS Code extension, CLI tool with web UI, or a Chrome browser extension.
- **Decision**: Build as a Chrome Extension (Manifest V3) that injects UI directly into AWS Console pages.
- **Alternatives considered**:
  - **Standalone Web App**: Would require users to switch between tabs. Loses the "augmented console" experience.
  - **VS Code Extension**: Limited to IDE users. Doesn't enhance the console directly.
  - **CLI Tool with Web UI**: Requires local installation. Not accessible from any browser.
- **Consequences**:
  - ✅ Seamless integration with AWS Console — users don't leave their workflow
  - ✅ Can detect context (which service/resource user is viewing)
  - ✅ Can inject UI elements directly into console pages
  - ⚠️ Limited to Chrome browser initially (Firefox/Edge can be added later)
  - ⚠️ Must comply with Chrome Web Store policies
  - ⚠️ Content script injection requires careful DOM manipulation to avoid breaking AWS Console

---

## ADR-002: Backend API Instead of Client-Side SDK

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Initially considered running AWS SDK directly in the Chrome Extension (client-side). User feedback indicated a preference for a backend API that handles AWS operations, with the extension acting as a UI layer.
- **Decision**: Build a backend API (Express + Lambda) that executes AWS SDK operations on behalf of users. The extension communicates with this API for all AWS operations.
- **Alternatives considered**:
  - **Client-side AWS SDK**: Run AWS SDK v3 directly in the extension's background service worker.
    - Pros: No backend needed, simpler architecture, lower latency
    - Cons: Credentials stored client-side only, harder to audit, no server-side logging, CORS issues with some AWS services
  - **Hybrid approach**: Some operations client-side, some server-side.
    - Pros: Flexibility
    - Cons: Inconsistent architecture, harder to maintain
- **Consequences**:
  - ✅ Credentials stored securely server-side (encrypted with KMS)
  - ✅ Server-side audit logging of all operations
  - ✅ Can add rate limiting, validation, and security controls
  - ✅ Easier to add complex multi-step operations
  - ⚠️ Adds latency (extension → API → AWS → API → extension)
  - ⚠️ Requires hosting and maintaining a backend
  - ⚠️ Users must create an account with our service

---

## ADR-003: Cognito for User Authentication

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: The extension needs its own user authentication system (separate from users' AWS credentials) to manage accounts, preferences, and history.
- **Decision**: Use Amazon Cognito User Pools for user authentication.
- **Alternatives considered**:
  - **Auth0**: Mature auth platform with excellent developer experience.
    - Pros: Feature-rich, easy to implement
    - Cons: Additional cost, external dependency, not AWS-native
  - **Custom JWT implementation**: Build our own auth with bcrypt + JWT.
    - Pros: Full control, no external dependency
    - Cons: Security risk (rolling own auth), more development time
  - **Firebase Auth**: Google's auth service.
    - Pros: Easy to implement, generous free tier
    - Cons: Not AWS-native, mixing cloud providers
- **Consequences**:
  - ✅ AWS-native — integrates seamlessly with API Gateway authorizer
  - ✅ Managed service — handles password hashing, MFA, email verification
  - ✅ Per project conventions (consistent with other projects)
  - ✅ Free tier covers up to 50,000 MAUs
  - ⚠️ Cognito has some UX limitations (error messages, customization)

---

## ADR-004: KMS for Credential Encryption

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Users store their AWS credentials (Access Key ID, Secret Access Key) in our system. These must be encrypted at rest.
- **Decision**: Use AWS KMS (Key Management Service) with a customer-managed key to encrypt/decrypt credentials before storing in DynamoDB.
- **Alternatives considered**:
  - **Application-level encryption (AES-256)**: Encrypt with a key stored in environment variables.
    - Pros: Simpler, no additional AWS service
    - Cons: Key management is our responsibility, key rotation is manual
  - **Secrets Manager**: Store each user's credentials as a secret.
    - Pros: Built for secrets, automatic rotation
    - Cons: Cost ($0.40/secret/month × N users = expensive at scale), not designed for per-user secrets
  - **DynamoDB encryption at rest**: Rely on DynamoDB's built-in encryption.
    - Pros: Zero effort
    - Cons: Only encrypts at rest on disk — data is decrypted when read, so anyone with DynamoDB access sees plaintext
- **Consequences**:
  - ✅ Industry-standard encryption with AWS-managed key infrastructure
  - ✅ Automatic key rotation available
  - ✅ IAM-controlled access — only Lambda execution role can decrypt
  - ✅ Audit trail via CloudTrail
  - ⚠️ Adds ~50ms latency per encrypt/decrypt operation
  - ⚠️ KMS costs ($1/month per key + $0.03 per 10,000 API calls)

---

## ADR-005: Monorepo Structure

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: The project has three distinct components: Chrome Extension, Backend API, and Infrastructure. Need to decide on repository structure.
- **Decision**: Use a monorepo with three top-level directories: `extension/`, `backend/`, `infrastructure/`.
- **Alternatives considered**:
  - **Separate repositories**: One repo per component.
    - Pros: Independent versioning, separate CI/CD
    - Cons: Harder to share types, more repos to manage, cross-repo changes are painful
  - **npm workspaces monorepo**: Use npm workspaces for shared packages.
    - Pros: Shared dependencies, linked packages
    - Cons: Overkill for this project size, adds complexity
- **Consequences**:
  - ✅ Shared TypeScript types between extension and backend
  - ✅ Single PR for cross-cutting changes
  - ✅ Easier to maintain and review
  - ⚠️ Larger repository size
  - ⚠️ CI/CD needs to detect which component changed

---

## ADR-006: Vite + CRXJS for Extension Build

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Chrome Extensions with React require a build tool that can handle multiple entry points (background, content scripts, popup, side panel) and the manifest.json.
- **Decision**: Use Vite with the CRXJS plugin for Chrome Extension development.
- **Alternatives considered**:
  - **Webpack + custom config**: Traditional bundler with manual Chrome Extension configuration.
    - Pros: Mature, well-documented
    - Cons: Complex configuration, slow builds, no HMR in extensions
  - **Plasmo Framework**: Dedicated Chrome Extension framework.
    - Pros: Purpose-built, handles many extension concerns automatically
    - Cons: Opinionated, less flexibility, smaller community
  - **Parcel**: Zero-config bundler.
    - Pros: Simple setup
    - Cons: Limited Chrome Extension support, less plugin ecosystem
- **Consequences**:
  - ✅ Fast builds with Vite's esbuild-powered dev server
  - ✅ HMR support in Chrome Extensions (via CRXJS)
  - ✅ Automatic manifest.json processing
  - ✅ React Fast Refresh in popup and side panel
  - ⚠️ CRXJS plugin may have breaking changes with Chrome updates

---

## ADR-007: Tailwind CSS for Extension Styling

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: The extension injects UI into AWS Console pages. Styling must not conflict with AWS Console's existing CSS, and bundle size must be minimal.
- **Decision**: Use Tailwind CSS with scoped styles for the extension.
- **Alternatives considered**:
  - **MUI (Material UI)**: Full component library.
    - Pros: Rich component set, consistent design
    - Cons: Large bundle size (~300KB), runtime CSS-in-JS overhead, potential style conflicts with AWS Console
  - **CSS Modules**: Scoped CSS with unique class names.
    - Pros: No conflicts, zero runtime overhead
    - Cons: More verbose, no utility classes, slower development
  - **Styled Components / Emotion**: CSS-in-JS.
    - Pros: Dynamic styles, scoped by default
    - Cons: Runtime overhead, larger bundle, potential conflicts with AWS Console's styled-components
- **Consequences**:
  - ✅ Tiny bundle size (only used utilities are included, typically < 10KB)
  - ✅ No runtime overhead
  - ✅ Utility classes are unique enough to avoid conflicts with AWS Console CSS
  - ✅ Rapid UI development with utility-first approach
  - ⚠️ Need to use Shadow DOM or prefixed classes to fully isolate from AWS Console styles
  - ⚠️ Less "component library" feel — need to build components from scratch

---

## ADR-008: DynamoDB for Data Storage

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Need a database to store user profiles, AWS account credentials (encrypted), action history, bookmarks, and preferences.
- **Decision**: Use DynamoDB with on-demand capacity mode.
- **Alternatives considered**:
  - **PostgreSQL (RDS)**: Relational database.
    - Pros: Rich querying, joins, ACID transactions
    - Cons: Requires VPC, always-on cost, more complex infrastructure
  - **MongoDB Atlas**: Document database.
    - Pros: Flexible schema, good developer experience
    - Cons: External service, not AWS-native, additional cost
  - **S3 + JSON files**: Simple file-based storage.
    - Pros: Cheapest option, simple
    - Cons: No querying, no transactions, not suitable for user data
- **Consequences**:
  - ✅ Serverless — scales to zero, pay per request
  - ✅ AWS-native — integrates with IAM, KMS, CloudWatch
  - ✅ Per project conventions
  - ✅ On-demand capacity handles unpredictable traffic
  - ⚠️ Limited querying capabilities (need to design access patterns upfront)
  - ⚠️ No joins — need to denormalize data

---

## ADR-009: Two-Tier Action Model (Client-Side vs Server-Side)

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Some extension features (like copying an ARN to clipboard) don't need a backend call, while others (like copying a resource to another region) require AWS SDK operations.
- **Decision**: Implement a two-tier action model:
  - **Client-side actions**: Quick copy (ARN, ID, endpoint), UI enhancements, context detection, keyboard shortcuts — handled entirely in the extension
  - **Server-side actions**: AWS operations (list, describe, create, copy, delete) — handled via backend API
- **Alternatives considered**:
  - **All server-side**: Route everything through the backend.
    - Pros: Consistent architecture, full audit trail
    - Cons: Unnecessary latency for simple operations, backend dependency for basic features
  - **All client-side**: Run everything in the extension.
    - Pros: No backend dependency, lower latency
    - Cons: Security concerns, no audit trail, credential management issues
- **Consequences**:
  - ✅ Fast response for simple operations (no network round-trip)
  - ✅ Extension works partially even if backend is down (quick copy still works)
  - ✅ Reduced backend load
  - ⚠️ Two different code paths to maintain
  - ⚠️ Need clear documentation on which actions are client vs server

---

## ADR-010: Chrome-Only for MVP

- **Date**: 2026-03-09
- **Status**: Accepted
- **Context**: Browser extensions can target Chrome, Firefox, Edge, Safari, and others. Each has different APIs and distribution channels.
- **Decision**: Target Chrome only for MVP. Use Manifest V3 (Chrome's latest extension platform).
- **Alternatives considered**:
  - **Cross-browser from start**: Use WebExtension API polyfill for Chrome + Firefox + Edge.
    - Pros: Wider audience from day one
    - Cons: More testing, different store submissions, API differences
  - **Firefox first**: Firefox has more permissive extension policies.
    - Pros: Easier approval process
    - Cons: Smaller market share for developer tools
- **Consequences**:
  - ✅ Simpler development — one platform to target
  - ✅ Chrome has ~65% browser market share
  - ✅ Manifest V3 is the future standard (Firefox is adopting it too)
  - ⚠️ Excludes Firefox and Safari users initially
  - ⚠️ Manifest V3 has some limitations (service worker lifecycle, limited background processing)
