# AWS Console Better ⚡

A Chrome Extension that augments the AWS Management Console with powerful features: cross-region operations, quick copy, context-aware actions, environment management, and more.

## Project Structure

```
aws-console-better/
├── docs/                → Project documentation (roadmap, architecture, API schema, etc.)
├── extension/           → Chrome Extension (React + Vite + Tailwind + CRXJS)
├── backend/             → Backend API (Express + TypeScript + Lambda)
├── infrastructure/      → AWS CloudFormation/SAM templates
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20.x
- npm
- AWS CLI
- SAM CLI
- Chrome Browser

### Extension Development

```bash
cd extension
cp .env.example .env
npm install
npm run dev
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/dist` folder

### Backend Development

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API will be available at `http://localhost:3000`.

### Infrastructure Deployment

```bash
cd infrastructure
sam build
sam deploy --guided
```

## Documentation

See the `docs/` folder for comprehensive documentation:

- [ROADMAP.md](docs/ROADMAP.md) — Full project roadmap with all AWS services
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture and design
- [API_SCHEMA.md](docs/API_SCHEMA.md) — Complete API documentation
- [TOOLS_AND_TECH.md](docs/TOOLS_AND_TECH.md) — Technology decisions
- [TASK_LOG.md](docs/TASK_LOG.md) — Current and completed tasks
- [DECISIONS.md](docs/DECISIONS.md) — Architecture Decision Records

## License

Private — All rights reserved.
