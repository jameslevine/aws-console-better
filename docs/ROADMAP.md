# AWS Console Better — Project Roadmap

## Project Overview

**AWS Console Better** is a Chrome Extension with a backend API that augments the AWS Management Console experience. It injects enhanced UI directly into AWS Console pages, providing developers and DevOps engineers with powerful features that don't exist natively — like one-click resource copying across regions, contextual quick actions, environment management, and seamless AWS CLI/SDK command execution through a backend service.

## Goals & Success Criteria

- **Goal**: Become the go-to Chrome Extension for AWS power users
- **Success Criteria**:
  - Published on Chrome Web Store
  - Supports all major AWS services (phased rollout)
  - Users can manage multiple AWS accounts
  - Cross-region operations work reliably
  - Sub-2-second response time for all API operations
  - 90%+ test coverage

---

## Milestones

### Phase 1: MVP — Core Platform + Top 6 Services
### Phase 2: Expanded Services (15 more services)
### Phase 3: Advanced Services + Power Features (15+ more services)
### Phase 4: Full Coverage + AI/Automation

---

## Phase 1: MVP (P0 — Must Have)

### Core Platform Features

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| User Authentication | P0 | 🔴 Not Started | Cognito-based register/login/forgot password for extension users |
| AWS Account Management | P0 | 🔴 Not Started | Add/edit/delete AWS accounts with encrypted credential storage (Access Key, Secret Key, Session Token). Multi-account support. |
| Service Context Detection | P0 | 🔴 Not Started | Auto-detect which AWS service/resource the user is viewing based on URL and DOM |
| Quick Copy Toolbar | P0 | 🔴 Not Started | Floating toolbar: one-click copy ARN, Resource ID, Region, Account ID, Endpoint URL, Resource Name |
| "Show as CLI" Command | P0 | 🔴 Not Started | Show the equivalent AWS CLI command for the current resource. One-click copy. |
| Cross-Region Resource View | P0 | 🔴 Not Started | Side panel showing the same resource type across all regions |
| Copy Resource to Region | P0 | 🔴 Not Started | Select a resource → choose target region → replicate config |
| Quick Actions (Context-Aware) | P0 | 🔴 Not Started | Service-specific action buttons injected into the console |
| Action/Command History | P0 | 🔴 Not Started | Searchable log of all actions performed through the extension |
| Extension Side Panel | P0 | 🔴 Not Started | Persistent side panel housing the main UI for actions, views, and management |
| Extension Popup | P0 | 🔴 Not Started | Quick access popup for account switching, settings, and shortcuts |
| Settings & Preferences | P0 | 🔴 Not Started | User preferences: default region, theme, keyboard shortcuts, notifications |

### Phase 1 AWS Services

#### EC2 (Elastic Compute Cloud)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Instance List (Cross-Region) | P0 | 🔴 Not Started | View all EC2 instances across all regions in one table |
| Copy Instance Config to Region | P0 | 🔴 Not Started | Replicate an instance's launch configuration to another region |
| Quick Actions: Start/Stop/Reboot | P0 | 🔴 Not Started | One-click instance state management |
| Quick Copy: Instance ID, Public IP, Private IP, DNS | P0 | 🔴 Not Started | Copy key identifiers with one click |
| SSH Command Generator | P0 | 🔴 Not Started | Generate and copy SSH command with correct key pair and IP |
| Security Group Copy to Region | P0 | 🔴 Not Started | Replicate security group rules to another region |
| Show CLI: describe-instances | P0 | 🔴 Not Started | Show equivalent CLI command for current view |
| Instance Comparison | P0 | 🔴 Not Started | Compare two instances side-by-side |

#### S3 (Simple Storage Service)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Bucket List (All Regions) | P0 | 🔴 Not Started | View all S3 buckets with region, size, and object count |
| Copy Bucket Config to Region | P0 | 🔴 Not Started | Replicate bucket policies, CORS, lifecycle rules to new bucket in another region |
| Quick Copy: Bucket ARN, URL, S3 URI | P0 | 🔴 Not Started | One-click copy of bucket identifiers |
| Quick Actions: Sync Command Generator | P0 | 🔴 Not Started | Generate `aws s3 sync` commands |
| Bucket Policy Copy | P0 | 🔴 Not Started | Copy bucket policy JSON with one click |
| Show CLI: list-buckets, get-bucket-policy | P0 | 🔴 Not Started | Show equivalent CLI commands |

#### Lambda
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Function List (Cross-Region) | P0 | 🔴 Not Started | View all Lambda functions across regions |
| Copy Function to Region | P0 | 🔴 Not Started | Replicate function config (code, env vars, layers) to another region |
| Quick Actions: Invoke with Payload | P0 | 🔴 Not Started | Quick invoke with test event payload |
| Quick Copy: Function ARN, Name | P0 | 🔴 Not Started | One-click copy identifiers |
| Recent Invocation Logs (Inline) | P0 | 🔴 Not Started | Show last N invocation logs without navigating to CloudWatch |
| Environment Variable Viewer/Editor | P0 | 🔴 Not Started | Quick view and edit env vars |
| Show CLI: get-function, invoke | P0 | 🔴 Not Started | Show equivalent CLI commands |

#### DynamoDB
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Table List (Cross-Region) | P0 | 🔴 Not Started | View all DynamoDB tables across regions with item count and size |
| Copy Table Schema to Region | P0 | 🔴 Not Started | Replicate table schema (keys, indexes, capacity) to another region |
| Quick Actions: Query Builder | P0 | 🔴 Not Started | Visual query builder that generates CLI query commands |
| Quick Copy: Table ARN, Name, Stream ARN | P0 | 🔴 Not Started | One-click copy identifiers |
| Table Schema Export | P0 | 🔴 Not Started | Export table schema as JSON |
| Show CLI: describe-table, query, scan | P0 | 🔴 Not Started | Show equivalent CLI commands |

#### IAM (Identity and Access Management)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Role/Policy List | P0 | 🔴 Not Started | View all IAM roles and policies with search |
| Copy Role/Policy Config | P0 | 🔴 Not Started | Copy IAM role (trust policy + permissions) for replication |
| Quick Copy: Role ARN, Policy ARN | P0 | 🔴 Not Started | One-click copy identifiers |
| Policy Document Viewer | P0 | 🔴 Not Started | Enhanced JSON viewer for policy documents |
| Show CLI: get-role, get-policy | P0 | 🔴 Not Started | Show equivalent CLI commands |

#### CloudFormation
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Stack List (Cross-Region) | P0 | 🔴 Not Started | View all stacks across regions with status |
| Copy Stack to Region | P0 | 🔴 Not Started | Deploy same template to another region |
| Quick Actions: Quick Rollback | P0 | 🔴 Not Started | One-click rollback to previous version |
| Stack Diff (Before Update) | P0 | 🔴 Not Started | Show what will change before updating a stack |
| Template Export | P0 | 🔴 Not Started | Download/copy stack template |
| Quick Copy: Stack ARN, Stack ID | P0 | 🔴 Not Started | One-click copy identifiers |
| Show CLI: describe-stacks, get-template | P0 | 🔴 Not Started | Show equivalent CLI commands |

---

## Phase 2: Expanded Services (P1 — Should Have)

### Platform Features (Phase 2)

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Resource Diff Across Regions | P1 | 🔴 Not Started | Side-by-side JSON diff of resource config in two regions |
| Environment Manager | P1 | 🔴 Not Started | Tag-based environment grouping. Clone entire environments. |
| Bulk Operations | P1 | 🔴 Not Started | Multi-select resources for bulk actions (delete, tag, copy) |
| Global Resource Search | P1 | 🔴 Not Started | Search across all regions and services simultaneously |
| Export as IaC | P1 | 🔴 Not Started | Export resource config as CloudFormation YAML or Terraform HCL |
| Keyboard Shortcuts | P1 | 🔴 Not Started | Customizable shortcuts (Cmd+K search, Cmd+T terminal, etc.) |
| Resource Bookmarks | P1 | 🔴 Not Started | Pin frequently accessed resources for quick navigation |

### Phase 2 AWS Services

#### API Gateway
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| API List (Cross-Region) | P1 | 🔴 Not Started | View all REST/HTTP APIs across regions |
| Copy API to Region | P1 | 🔴 Not Started | Replicate API configuration to another region |
| Quick Actions: Test Endpoint | P1 | 🔴 Not Started | Quick test any endpoint with custom payload |
| Export as OpenAPI/Swagger | P1 | 🔴 Not Started | Export API definition |
| Stage Comparison | P1 | 🔴 Not Started | Compare config between stages (dev/prod) |
| Quick Copy: API URL, API ID | P1 | 🔴 Not Started | One-click copy identifiers |

#### CloudFront
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Distribution List | P1 | 🔴 Not Started | View all distributions with status and domain |
| Quick Actions: Invalidate Cache | P1 | 🔴 Not Started | One-click cache invalidation with path input |
| Copy Distribution Config | P1 | 🔴 Not Started | Replicate distribution settings |
| Origin Health Check | P1 | 🔴 Not Started | Show origin server health status |
| Quick Copy: Distribution ID, Domain Name | P1 | 🔴 Not Started | One-click copy identifiers |

#### RDS (Relational Database Service)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Instance List (Cross-Region) | P1 | 🔴 Not Started | View all RDS instances across regions |
| Connection String Generator | P1 | 🔴 Not Started | Generate connection strings for various languages/frameworks |
| Quick Actions: Create Snapshot | P1 | 🔴 Not Started | One-click snapshot creation |
| Parameter Group Diff | P1 | 🔴 Not Started | Compare parameter groups between instances |
| Quick Copy: Endpoint, ARN, Instance ID | P1 | 🔴 Not Started | One-click copy identifiers |
| Cost/Hour Display | P1 | 🔴 Not Started | Show estimated hourly cost |

#### ECS (Elastic Container Service)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Cluster/Service List (Cross-Region) | P1 | 🔴 Not Started | View all clusters and services across regions |
| Quick Actions: Force New Deployment | P1 | 🔴 Not Started | One-click force deployment |
| Quick Actions: Restart Service | P1 | 🔴 Not Started | Quick service restart |
| Task Log Viewer | P1 | 🔴 Not Started | View recent task logs inline |
| Service Comparison | P1 | 🔴 Not Started | Compare service configs |
| Quick Copy: Cluster ARN, Service ARN | P1 | 🔴 Not Started | One-click copy identifiers |

#### EKS (Elastic Kubernetes Service)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Cluster List (Cross-Region) | P1 | 🔴 Not Started | View all EKS clusters across regions |
| Kubeconfig Generator | P1 | 🔴 Not Started | Generate kubeconfig command for cluster access |
| Node Group Overview | P1 | 🔴 Not Started | View node groups with status and capacity |
| Quick Copy: Cluster ARN, Endpoint | P1 | 🔴 Not Started | One-click copy identifiers |

#### Route 53
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Hosted Zone List | P1 | 🔴 Not Started | View all hosted zones with record counts |
| DNS Propagation Checker | P1 | 🔴 Not Started | Check DNS propagation status globally |
| Record Set Export | P1 | 🔴 Not Started | Export all records as JSON/CSV |
| Bulk Record Operations | P1 | 🔴 Not Started | Add/modify/delete multiple records at once |
| Quick Copy: Hosted Zone ID, Name Servers | P1 | 🔴 Not Started | One-click copy identifiers |

#### CloudWatch
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Quick Log Search | P1 | 🔴 Not Started | Search logs with simplified query syntax |
| Metric Graph Shortcuts | P1 | 🔴 Not Started | Quick access to common metric graphs |
| Alarm Quick-Create | P1 | 🔴 Not Started | Simplified alarm creation for common metrics |
| Cross-Region Log View | P1 | 🔴 Not Started | View logs from multiple regions |
| Quick Copy: Log Group ARN, Alarm ARN | P1 | 🔴 Not Started | One-click copy identifiers |

#### SQS (Simple Queue Service)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Queue List (Cross-Region) | P1 | 🔴 Not Started | View all queues across regions with message counts |
| Quick Actions: Send Message | P1 | 🔴 Not Started | Quick send test message to queue |
| Quick Actions: Purge Queue | P1 | 🔴 Not Started | One-click queue purge |
| Copy Queue Config to Region | P1 | 🔴 Not Started | Replicate queue settings to another region |
| Quick Copy: Queue URL, ARN | P1 | 🔴 Not Started | One-click copy identifiers |

#### SNS (Simple Notification Service)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Topic List (Cross-Region) | P1 | 🔴 Not Started | View all topics across regions |
| Quick Actions: Publish Message | P1 | 🔴 Not Started | Quick publish test message |
| Subscription Overview | P1 | 🔴 Not Started | View all subscriptions for a topic |
| Copy Topic Config to Region | P1 | 🔴 Not Started | Replicate topic settings |
| Quick Copy: Topic ARN | P1 | 🔴 Not Started | One-click copy identifiers |

#### Secrets Manager
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Secret List (Cross-Region) | P1 | 🔴 Not Started | View all secrets across regions |
| Quick Actions: Copy Secret Value | P1 | 🔴 Not Started | One-click copy current secret value |
| Version Comparison | P1 | 🔴 Not Started | Compare secret versions |
| Rotation Status Display | P1 | 🔴 Not Started | Show rotation configuration and status |
| Copy Secret to Region | P1 | 🔴 Not Started | Replicate secret to another region |
| Quick Copy: Secret ARN, Name | P1 | 🔴 Not Started | One-click copy identifiers |

#### Cognito
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| User Pool List (Cross-Region) | P1 | 🔴 Not Started | View all user pools across regions |
| User Search | P1 | 🔴 Not Started | Search users across pools |
| Quick Actions: Disable/Enable User | P1 | 🔴 Not Started | Quick user management |
| Pool Config Export | P1 | 🔴 Not Started | Export user pool configuration |
| Quick Copy: Pool ID, Client ID, ARN | P1 | 🔴 Not Started | One-click copy identifiers |

#### ACM (Certificate Manager)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Certificate List (Cross-Region) | P1 | 🔴 Not Started | View all certificates across regions with expiry dates |
| Expiry Alerts | P1 | 🔴 Not Started | Highlight certificates nearing expiry |
| Quick Copy: Certificate ARN, Domain | P1 | 🔴 Not Started | One-click copy identifiers |

#### Systems Manager (SSM)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Parameter Store List (Cross-Region) | P1 | 🔴 Not Started | View all parameters across regions |
| Quick Actions: Copy Parameter Value | P1 | 🔴 Not Started | One-click copy parameter value |
| Copy Parameters to Region | P1 | 🔴 Not Started | Bulk copy parameters to another region |
| Quick Copy: Parameter ARN, Name | P1 | 🔴 Not Started | One-click copy identifiers |

---

## Phase 3: Advanced Services + Power Features (P2 — Nice to Have)

### Platform Features (Phase 3)

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Inline Cost Annotations | P2 | 🔴 Not Started | Show estimated costs next to resources on list pages |
| Recent Changes Timeline | P2 | 🔴 Not Started | CloudTrail events for current resource in sidebar |
| Resource Relationship Map | P2 | 🔴 Not Started | Dependency graph visualization |
| Multi-Account Comparison | P2 | 🔴 Not Started | Compare resources across AWS accounts |
| Custom Workflows | P2 | 🔴 Not Started | Save multi-step action sequences as reusable workflows |
| Resource Notes/Annotations | P2 | 🔴 Not Started | Add personal/team notes to any resource |
| Enhanced JSON/YAML Viewer | P2 | 🔴 Not Started | Syntax-highlighted, collapsible, searchable viewers |
| Dark Mode Enhancement | P2 | 🔴 Not Started | Fix inconsistent dark mode across AWS services |

### Phase 3 AWS Services

#### ElastiCache
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Cluster List (Cross-Region) | P2 | 🔴 Not Started | View all Redis/Memcached clusters across regions |
| Connection String Generator | P2 | 🔴 Not Started | Generate connection strings |
| Quick Copy: Endpoint, ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### Kinesis
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Stream List (Cross-Region) | P2 | 🔴 Not Started | View all Kinesis streams across regions |
| Shard Overview | P2 | 🔴 Not Started | Visual shard distribution and throughput |
| Quick Copy: Stream ARN, Name | P2 | 🔴 Not Started | One-click copy identifiers |

#### Step Functions
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| State Machine List (Cross-Region) | P2 | 🔴 Not Started | View all state machines across regions |
| Quick Actions: Start Execution | P2 | 🔴 Not Started | Quick start with input payload |
| Execution History Overview | P2 | 🔴 Not Started | Recent executions with status |
| Copy State Machine to Region | P2 | 🔴 Not Started | Replicate state machine definition |
| Quick Copy: State Machine ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### EventBridge
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Rule List (Cross-Region) | P2 | 🔴 Not Started | View all rules across regions |
| Quick Actions: Test Event | P2 | 🔴 Not Started | Send test event to event bus |
| Copy Rules to Region | P2 | 🔴 Not Started | Replicate event rules |
| Quick Copy: Rule ARN, Event Bus ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### AppSync
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| API List (Cross-Region) | P2 | 🔴 Not Started | View all GraphQL APIs across regions |
| Schema Export | P2 | 🔴 Not Started | Export GraphQL schema |
| Quick Copy: API URL, API ID | P2 | 🔴 Not Started | One-click copy identifiers |

#### CodePipeline
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Pipeline List (Cross-Region) | P2 | 🔴 Not Started | View all pipelines across regions with status |
| Quick Actions: Release Change | P2 | 🔴 Not Started | One-click trigger pipeline |
| Quick Actions: Retry Failed Stage | P2 | 🔴 Not Started | Quick retry |
| Pipeline Status Overview | P2 | 🔴 Not Started | All pipeline statuses in one view |
| Quick Copy: Pipeline ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### CodeBuild
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Project List (Cross-Region) | P2 | 🔴 Not Started | View all build projects across regions |
| Quick Actions: Start Build | P2 | 🔴 Not Started | One-click start build |
| Recent Build Logs | P2 | 🔴 Not Started | View recent build logs inline |
| Quick Copy: Project ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### ECR (Elastic Container Registry)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Repository List (Cross-Region) | P2 | 🔴 Not Started | View all repositories across regions |
| Image List with Tags | P2 | 🔴 Not Started | View images with tags and sizes |
| Docker Pull Command Generator | P2 | 🔴 Not Started | Generate docker pull commands |
| Quick Copy: Repository URI, ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### ELB/ALB (Elastic Load Balancing)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Load Balancer List (Cross-Region) | P2 | 🔴 Not Started | View all load balancers across regions |
| Target Group Health | P2 | 🔴 Not Started | Quick view of target health status |
| Listener Rules Overview | P2 | 🔴 Not Started | View all listener rules in one place |
| Copy LB Config to Region | P2 | 🔴 Not Started | Replicate load balancer configuration |
| Quick Copy: DNS Name, ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### VPC (Virtual Private Cloud)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| VPC List (Cross-Region) | P2 | 🔴 Not Started | View all VPCs across regions |
| Subnet Overview | P2 | 🔴 Not Started | Visual subnet layout with CIDR blocks |
| Security Group Rule Viewer | P2 | 🔴 Not Started | Enhanced security group rule display |
| Copy VPC Config to Region | P2 | 🔴 Not Started | Replicate VPC structure (subnets, route tables, NACLs) |
| Quick Copy: VPC ID, Subnet IDs, CIDR | P2 | 🔴 Not Started | One-click copy identifiers |

#### WAF (Web Application Firewall)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Web ACL List | P2 | 🔴 Not Started | View all Web ACLs with associated resources |
| Rule Group Overview | P2 | 🔴 Not Started | View all rules in a rule group |
| Copy Web ACL to Region | P2 | 🔴 Not Started | Replicate WAF rules |
| Quick Copy: Web ACL ARN | P2 | 🔴 Not Started | One-click copy identifiers |

#### SES (Simple Email Service)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Identity List (Cross-Region) | P2 | 🔴 Not Started | View all verified identities across regions |
| Quick Actions: Send Test Email | P2 | 🔴 Not Started | Quick send test email |
| Sending Statistics | P2 | 🔴 Not Started | View sending stats inline |
| Quick Copy: Identity ARN | P2 | 🔴 Not Started | One-click copy identifiers |

---

## Phase 4: Full Coverage + AI/Automation (P3 — Future)

### Platform Features (Phase 4)

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| AI-Powered Suggestions | P3 | 🔴 Not Started | Context-aware action and command suggestions |
| Audit Trail | P3 | 🔴 Not Started | Track all changes made through the extension |
| Team Sharing | P3 | 🔴 Not Started | Share configs, commands, bookmarks with team |
| Notification Watchers | P3 | 🔴 Not Started | Set up resource state change alerts |
| Plugin System | P3 | 🔴 Not Started | Allow community-built plugins for additional services |

### Phase 4 AWS Services

#### Athena
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Query List | P3 | 🔴 Not Started | View saved queries across regions |
| Quick Actions: Run Query | P3 | 🔴 Not Started | Quick query execution |
| Query Results Export | P3 | 🔴 Not Started | Export results in multiple formats |

#### Glue
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Job List (Cross-Region) | P3 | 🔴 Not Started | View all Glue jobs across regions |
| Quick Actions: Start Job | P3 | 🔴 Not Started | One-click job start |
| Crawler Status Overview | P3 | 🔴 Not Started | View all crawler statuses |

#### Redshift
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Cluster List (Cross-Region) | P3 | 🔴 Not Started | View all Redshift clusters |
| Connection String Generator | P3 | 🔴 Not Started | Generate JDBC/ODBC connection strings |
| Quick Copy: Endpoint, ARN | P3 | 🔴 Not Started | One-click copy identifiers |

#### SageMaker
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Notebook/Endpoint List | P3 | 🔴 Not Started | View all notebooks and endpoints |
| Quick Actions: Start/Stop Notebook | P3 | 🔴 Not Started | Quick notebook management |
| Training Job Status | P3 | 🔴 Not Started | View training job progress |

#### IoT Core
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Thing List (Cross-Region) | P3 | 🔴 Not Started | View all IoT things across regions |
| Quick Actions: Publish to Topic | P3 | 🔴 Not Started | Quick MQTT publish |
| Certificate Overview | P3 | 🔴 Not Started | View certificate status and expiry |

#### Amplify
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| App List (Cross-Region) | P3 | 🔴 Not Started | View all Amplify apps |
| Quick Actions: Trigger Build | P3 | 🔴 Not Started | One-click build trigger |
| Branch/Environment Overview | P3 | 🔴 Not Started | View all branches and environments |

#### MediaConvert
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Job List (Cross-Region) | P3 | 🔴 Not Started | View all transcoding jobs |
| Quick Actions: Create Job from Template | P3 | 🔴 Not Started | Quick job creation |
| Job Status Overview | P3 | 🔴 Not Started | View job progress |

#### Backup
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Backup Plan List | P3 | 🔴 Not Started | View all backup plans across regions |
| Recovery Point Overview | P3 | 🔴 Not Started | View all recovery points |
| Quick Actions: Start Backup Job | P3 | 🔴 Not Started | One-click backup |

#### Config (AWS Config)
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Rule List (Cross-Region) | P3 | 🔴 Not Started | View all Config rules |
| Compliance Overview | P3 | 🔴 Not Started | View compliance status across all rules |
| Resource Timeline | P3 | 🔴 Not Started | View resource configuration history |

#### CloudTrail
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Trail List (Cross-Region) | P3 | 🔴 Not Started | View all trails |
| Event Search | P3 | 🔴 Not Started | Quick search through trail events |
| Quick Copy: Trail ARN | P3 | 🔴 Not Started | One-click copy identifiers |

#### Transfer Family
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Server List (Cross-Region) | P3 | 🔴 Not Started | View all SFTP/FTP servers |
| Quick Copy: Server Endpoint | P3 | 🔴 Not Started | One-click copy identifiers |

#### App Runner
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Service List (Cross-Region) | P3 | 🔴 Not Started | View all App Runner services |
| Quick Actions: Deploy/Pause/Resume | P3 | 🔴 Not Started | Quick service management |
| Quick Copy: Service URL, ARN | P3 | 🔴 Not Started | One-click copy identifiers |

#### Lightsail
| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Instance List (Cross-Region) | P3 | 🔴 Not Started | View all Lightsail instances |
| Quick Actions: Start/Stop/Reboot | P3 | 🔴 Not Started | Quick instance management |
| Quick Copy: Public IP, Instance Name | P3 | 🔴 Not Started | One-click copy identifiers |

---

## Timeline Estimates

| Phase | Estimated Duration | Target |
|-------|-------------------|--------|
| Phase 1: MVP | 8-10 weeks | Core platform + 6 services |
| Phase 2: Expanded | 8-10 weeks | 15 additional services + platform features |
| Phase 3: Advanced | 10-12 weeks | 15+ services + power features |
| Phase 4: Full Coverage | Ongoing | Remaining services + AI/automation |

---

## Completed Tasks

| Date | Task | Notes |
|------|------|-------|
| 2026-03-09 | Project planning and requirements gathering | Architecture and feature list defined |
| 2026-03-09 | Documentation created | All 6 docs/ files created |
