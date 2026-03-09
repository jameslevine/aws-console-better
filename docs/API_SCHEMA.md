# AWS Console Better — API Schema

## Base URL

```
Production: https://api.awsconsolebetter.com
Development: http://localhost:3000
```

## Versioning Strategy

- URL-based versioning: `/v1/...`
- All endpoints prefixed with `/v1`

## Authentication

- **Method**: JWT (JSON Web Tokens) via Amazon Cognito
- **Header**: `Authorization: Bearer <access_token>`
- **Token Refresh**: Use refresh token to obtain new access token
- All endpoints require authentication unless marked as 🔓 (public)

## Error Response Format

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Optional additional details"
}
```

### Standard Error Codes

| HTTP Status | Code               | Description                   |
| ----------- | ------------------ | ----------------------------- |
| 400         | `VALIDATION_ERROR` | Invalid request parameters    |
| 401         | `UNAUTHORIZED`     | Missing or invalid token      |
| 403         | `FORBIDDEN`        | Insufficient permissions      |
| 404         | `NOT_FOUND`        | Resource not found            |
| 409         | `CONFLICT`         | Resource already exists       |
| 429         | `RATE_LIMITED`     | Too many requests             |
| 500         | `INTERNAL_ERROR`   | Server error                  |
| 502         | `AWS_ERROR`        | Error from user's AWS account |

## Rate Limiting

- **Default**: 100 requests per minute per user
- **AWS Operations**: 30 requests per minute per user (to avoid AWS throttling)
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Endpoints

### Authentication

#### 🔓 POST `/v1/auth/register`

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully. Please verify your email.",
  "userId": "usr_abc123"
}
```

#### 🔓 POST `/v1/auth/verify`

Verify email with confirmation code.

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**

```json
{
  "message": "Email verified successfully"
}
```

#### 🔓 POST `/v1/auth/login`

Authenticate user and receive tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "eyJjdHkiOiJKV1QiLCJl...",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 3600
}
```

#### 🔓 POST `/v1/auth/refresh`

Refresh access token.

**Request Body:**

```json
{
  "refreshToken": "eyJjdHkiOiJKV1QiLCJl..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 3600
}
```

#### 🔓 POST `/v1/auth/forgot-password`

Initiate password reset.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "message": "Password reset code sent to email"
}
```

#### 🔓 POST `/v1/auth/reset-password`

Reset password with confirmation code.

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecureP@ss456"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

---

### User Profile

#### GET `/v1/users/me`

Get current user profile.

**Response (200):**

```json
{
  "userId": "usr_abc123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2026-03-09T10:00:00Z",
  "preferences": {
    "defaultRegion": "us-east-1",
    "theme": "system",
    "keyboardShortcutsEnabled": true
  }
}
```

#### PATCH `/v1/users/me`

Update user profile.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "preferences": {
    "defaultRegion": "eu-west-1",
    "theme": "dark"
  }
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully"
}
```

---

### AWS Accounts

#### GET `/v1/accounts`

List all AWS accounts for the current user.

**Response (200):**

```json
{
  "accounts": [
    {
      "accountId": "acc_abc123",
      "accountName": "Production",
      "awsAccountId": "123456789012",
      "defaultRegion": "us-east-1",
      "isDefault": true,
      "createdAt": "2026-03-09T10:00:00Z",
      "lastUsedAt": "2026-03-09T12:00:00Z"
    },
    {
      "accountId": "acc_def456",
      "accountName": "Staging",
      "awsAccountId": "987654321098",
      "defaultRegion": "eu-west-1",
      "isDefault": false,
      "createdAt": "2026-03-09T11:00:00Z",
      "lastUsedAt": "2026-03-09T11:30:00Z"
    }
  ]
}
```

#### POST `/v1/accounts`

Add a new AWS account.

**Request Body:**

```json
{
  "accountName": "Production",
  "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "sessionToken": "optional-session-token",
  "defaultRegion": "us-east-1",
  "isDefault": true
}
```

**Response (201):**

```json
{
  "accountId": "acc_abc123",
  "accountName": "Production",
  "awsAccountId": "123456789012",
  "defaultRegion": "us-east-1",
  "message": "AWS account added successfully"
}
```

#### GET `/v1/accounts/:accountId`

Get a specific AWS account.

**Response (200):**

```json
{
  "accountId": "acc_abc123",
  "accountName": "Production",
  "awsAccountId": "123456789012",
  "defaultRegion": "us-east-1",
  "isDefault": true,
  "createdAt": "2026-03-09T10:00:00Z",
  "lastUsedAt": "2026-03-09T12:00:00Z"
}
```

#### PATCH `/v1/accounts/:accountId`

Update an AWS account (name, default region, credentials).

**Request Body:**

```json
{
  "accountName": "Production (Updated)",
  "defaultRegion": "us-west-2",
  "accessKeyId": "AKIAIOSFODNN7NEWKEY",
  "secretAccessKey": "newSecretAccessKey"
}
```

**Response (200):**

```json
{
  "message": "AWS account updated successfully"
}
```

#### DELETE `/v1/accounts/:accountId`

Delete an AWS account and its stored credentials.

**Response (200):**

```json
{
  "message": "AWS account deleted successfully"
}
```

#### POST `/v1/accounts/:accountId/verify`

Verify that stored credentials are valid by calling STS GetCallerIdentity.

**Response (200):**

```json
{
  "valid": true,
  "awsAccountId": "123456789012",
  "arn": "arn:aws:iam::123456789012:user/admin",
  "userId": "AIDAIOSFODNN7EXAMPLE"
}
```

---

### Action History

#### GET `/v1/history`

Get action history for the current user.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Max results (default: 50, max: 100) |
| `offset` | number | No | Pagination offset |
| `accountId` | string | No | Filter by AWS account |
| `service` | string | No | Filter by AWS service (e.g., "ec2", "s3") |
| `action` | string | No | Filter by action type |

**Response (200):**

```json
{
  "history": [
    {
      "historyId": "hist_abc123",
      "accountId": "acc_abc123",
      "service": "s3",
      "action": "copy-bucket-to-region",
      "description": "Copied bucket 'my-app-assets' from us-east-1 to eu-west-1",
      "status": "success",
      "sourceRegion": "us-east-1",
      "targetRegion": "eu-west-1",
      "resourceId": "my-app-assets",
      "createdAt": "2026-03-09T12:00:00Z",
      "duration": 3200
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

### AWS Service Endpoints

All AWS service endpoints follow this pattern:

```
/v1/aws/:accountId/:service/...
```

The `:accountId` parameter specifies which stored AWS account credentials to use.

---

### EC2

#### GET `/v1/aws/:accountId/ec2/instances`

List EC2 instances.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | AWS region (default: account's default region) |
| `allRegions` | boolean | No | If true, fetch from all regions |

**Response (200):**

```json
{
  "instances": [
    {
      "instanceId": "i-0abc123def456",
      "instanceType": "t3.medium",
      "state": "running",
      "publicIp": "54.123.45.67",
      "privateIp": "10.0.1.50",
      "publicDns": "ec2-54-123-45-67.compute-1.amazonaws.com",
      "name": "web-server-1",
      "region": "us-east-1",
      "launchTime": "2026-03-01T08:00:00Z",
      "tags": { "Environment": "production", "Team": "backend" },
      "arn": "arn:aws:ec2:us-east-1:123456789012:instance/i-0abc123def456"
    }
  ],
  "regions": ["us-east-1", "eu-west-1"]
}
```

#### GET `/v1/aws/:accountId/ec2/instances/:instanceId`

Get detailed instance information.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | AWS region |

**Response (200):**

```json
{
  "instanceId": "i-0abc123def456",
  "instanceType": "t3.medium",
  "state": "running",
  "publicIp": "54.123.45.67",
  "privateIp": "10.0.1.50",
  "publicDns": "ec2-54-123-45-67.compute-1.amazonaws.com",
  "name": "web-server-1",
  "region": "us-east-1",
  "vpcId": "vpc-abc123",
  "subnetId": "subnet-abc123",
  "securityGroups": [
    { "groupId": "sg-abc123", "groupName": "web-sg" }
  ],
  "keyName": "my-key-pair",
  "iamInstanceProfile": "arn:aws:iam::123456789012:instance-profile/web-role",
  "blockDeviceMappings": [...],
  "tags": { "Environment": "production" },
  "arn": "arn:aws:ec2:us-east-1:123456789012:instance/i-0abc123def456",
  "cli": "aws ec2 describe-instances --instance-ids i-0abc123def456 --region us-east-1"
}
```

#### POST `/v1/aws/:accountId/ec2/instances/:instanceId/start`

Start an EC2 instance.

**Request Body:**

```json
{
  "region": "us-east-1"
}
```

**Response (200):**

```json
{
  "message": "Instance start initiated",
  "previousState": "stopped",
  "currentState": "pending"
}
```

#### POST `/v1/aws/:accountId/ec2/instances/:instanceId/stop`

Stop an EC2 instance.

**Request Body:**

```json
{
  "region": "us-east-1"
}
```

**Response (200):**

```json
{
  "message": "Instance stop initiated",
  "previousState": "running",
  "currentState": "stopping"
}
```

#### POST `/v1/aws/:accountId/ec2/instances/:instanceId/reboot`

Reboot an EC2 instance.

**Request Body:**

```json
{
  "region": "us-east-1"
}
```

**Response (200):**

```json
{
  "message": "Instance reboot initiated"
}
```

#### POST `/v1/aws/:accountId/ec2/instances/:instanceId/copy-to-region`

Copy instance configuration to another region.

**Request Body:**

```json
{
  "sourceRegion": "us-east-1",
  "targetRegion": "eu-west-1",
  "includeSecurityGroups": true,
  "includeKeyPair": false
}
```

**Response (200):**

```json
{
  "message": "Instance configuration copied to eu-west-1",
  "newInstanceId": "i-0xyz789ghi012",
  "targetRegion": "eu-west-1"
}
```

#### GET `/v1/aws/:accountId/ec2/instances/:instanceId/ssh-command`

Generate SSH command for an instance.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | AWS region |

**Response (200):**

```json
{
  "command": "ssh -i ~/.ssh/my-key-pair.pem ec2-user@54.123.45.67",
  "publicIp": "54.123.45.67",
  "keyName": "my-key-pair",
  "defaultUser": "ec2-user"
}
```

#### GET `/v1/aws/:accountId/ec2/security-groups`

List security groups.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | AWS region |
| `allRegions` | boolean | No | Fetch from all regions |

**Response (200):**

```json
{
  "securityGroups": [
    {
      "groupId": "sg-abc123",
      "groupName": "web-sg",
      "description": "Web server security group",
      "vpcId": "vpc-abc123",
      "region": "us-east-1",
      "inboundRules": [...],
      "outboundRules": [...]
    }
  ]
}
```

#### POST `/v1/aws/:accountId/ec2/security-groups/:groupId/copy-to-region`

Copy security group to another region.

**Request Body:**

```json
{
  "sourceRegion": "us-east-1",
  "targetRegion": "eu-west-1",
  "targetVpcId": "vpc-def456"
}
```

**Response (200):**

```json
{
  "message": "Security group copied to eu-west-1",
  "newGroupId": "sg-def456"
}
```

---

### S3

#### GET `/v1/aws/:accountId/s3/buckets`

List all S3 buckets.

**Response (200):**

```json
{
  "buckets": [
    {
      "name": "my-app-assets",
      "region": "us-east-1",
      "creationDate": "2026-01-15T10:00:00Z",
      "arn": "arn:aws:s3:::my-app-assets",
      "url": "https://my-app-assets.s3.amazonaws.com",
      "s3Uri": "s3://my-app-assets"
    }
  ]
}
```

#### GET `/v1/aws/:accountId/s3/buckets/:bucketName`

Get detailed bucket information.

**Response (200):**

```json
{
  "name": "my-app-assets",
  "region": "us-east-1",
  "arn": "arn:aws:s3:::my-app-assets",
  "versioning": "Enabled",
  "encryption": "AES256",
  "publicAccess": "Blocked",
  "policy": { ... },
  "cors": [ ... ],
  "lifecycleRules": [ ... ],
  "tags": { "Environment": "production" },
  "cli": "aws s3api get-bucket-location --bucket my-app-assets"
}
```

#### POST `/v1/aws/:accountId/s3/buckets/:bucketName/copy-to-region`

Copy bucket configuration to another region (creates new bucket with same config).

**Request Body:**

```json
{
  "targetRegion": "eu-west-1",
  "targetBucketName": "my-app-assets-eu",
  "copyPolicy": true,
  "copyCors": true,
  "copyLifecycleRules": true,
  "copyTags": true
}
```

**Response (201):**

```json
{
  "message": "Bucket configuration copied to eu-west-1",
  "newBucketName": "my-app-assets-eu",
  "targetRegion": "eu-west-1"
}
```

#### GET `/v1/aws/:accountId/s3/buckets/:bucketName/policy`

Get bucket policy.

**Response (200):**

```json
{
  "policy": { ... },
  "cli": "aws s3api get-bucket-policy --bucket my-app-assets"
}
```

#### GET `/v1/aws/:accountId/s3/buckets/:bucketName/sync-command`

Generate S3 sync command.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `localPath` | string | No | Local path (default: ".") |
| `direction` | string | No | "upload" or "download" (default: "download") |

**Response (200):**

```json
{
  "command": "aws s3 sync s3://my-app-assets . --region us-east-1"
}
```

---

### Lambda

#### GET `/v1/aws/:accountId/lambda/functions`

List Lambda functions.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | AWS region |
| `allRegions` | boolean | No | Fetch from all regions |

**Response (200):**

```json
{
  "functions": [
    {
      "functionName": "my-api-handler",
      "functionArn": "arn:aws:lambda:us-east-1:123456789012:function:my-api-handler",
      "runtime": "nodejs20.x",
      "handler": "index.handler",
      "codeSize": 1024000,
      "memorySize": 256,
      "timeout": 30,
      "lastModified": "2026-03-09T10:00:00Z",
      "region": "us-east-1",
      "state": "Active"
    }
  ]
}
```

#### GET `/v1/aws/:accountId/lambda/functions/:functionName`

Get detailed function information.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | AWS region |

**Response (200):**

```json
{
  "functionName": "my-api-handler",
  "functionArn": "arn:aws:lambda:us-east-1:123456789012:function:my-api-handler",
  "runtime": "nodejs20.x",
  "handler": "index.handler",
  "codeSize": 1024000,
  "memorySize": 256,
  "timeout": 30,
  "lastModified": "2026-03-09T10:00:00Z",
  "region": "us-east-1",
  "role": "arn:aws:iam::123456789012:role/lambda-role",
  "environment": {
    "NODE_ENV": "production",
    "TABLE_NAME": "my-table"
  },
  "layers": [...],
  "vpcConfig": { ... },
  "tags": { "Environment": "production" },
  "cli": "aws lambda get-function --function-name my-api-handler --region us-east-1"
}
```

#### POST `/v1/aws/:accountId/lambda/functions/:functionName/invoke`

Invoke a Lambda function.

**Request Body:**

```json
{
  "region": "us-east-1",
  "payload": { "key": "value" },
  "invocationType": "RequestResponse"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "payload": { "body": "Hello World" },
  "executedVersion": "$LATEST",
  "logResult": "START RequestId: abc123..."
}
```

#### POST `/v1/aws/:accountId/lambda/functions/:functionName/copy-to-region`

Copy function to another region.

**Request Body:**

```json
{
  "sourceRegion": "us-east-1",
  "targetRegion": "eu-west-1",
  "copyEnvironmentVariables": true,
  "copyTags": true
}
```

**Response (201):**

```json
{
  "message": "Function copied to eu-west-1",
  "newFunctionArn": "arn:aws:lambda:eu-west-1:123456789012:function:my-api-handler"
}
```

#### GET `/v1/aws/:accountId/lambda/functions/:functionName/logs`

Get recent invocation logs.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | AWS region |
| `limit` | number | No | Number of log events (default: 50) |

**Response (200):**

```json
{
  "logEvents": [
    {
      "timestamp": "2026-03-09T12:00:00Z",
      "message": "START RequestId: abc123...",
      "ingestionTime": "2026-03-09T12:00:01Z"
    }
  ]
}
```

---

### DynamoDB

#### GET `/v1/aws/:accountId/dynamodb/tables`

List DynamoDB tables.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | AWS region |
| `allRegions` | boolean | No | Fetch from all regions |

**Response (200):**

```json
{
  "tables": [
    {
      "tableName": "users-table",
      "tableArn": "arn:aws:dynamodb:us-east-1:123456789012:table/users-table",
      "status": "ACTIVE",
      "itemCount": 15000,
      "tableSizeBytes": 2048000,
      "region": "us-east-1",
      "keySchema": [
        { "attributeName": "pk", "keyType": "HASH" },
        { "attributeName": "sk", "keyType": "RANGE" }
      ]
    }
  ]
}
```

#### GET `/v1/aws/:accountId/dynamodb/tables/:tableName`

Get detailed table information.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | AWS region |

**Response (200):**

```json
{
  "tableName": "users-table",
  "tableArn": "arn:aws:dynamodb:us-east-1:123456789012:table/users-table",
  "status": "ACTIVE",
  "itemCount": 15000,
  "tableSizeBytes": 2048000,
  "region": "us-east-1",
  "keySchema": [...],
  "attributeDefinitions": [...],
  "globalSecondaryIndexes": [...],
  "localSecondaryIndexes": [...],
  "billingMode": "PAY_PER_REQUEST",
  "streamSpecification": { ... },
  "tags": { "Environment": "production" },
  "cli": "aws dynamodb describe-table --table-name users-table --region us-east-1"
}
```

#### POST `/v1/aws/:accountId/dynamodb/tables/:tableName/copy-to-region`

Copy table schema to another region.

**Request Body:**

```json
{
  "sourceRegion": "us-east-1",
  "targetRegion": "eu-west-1",
  "targetTableName": "users-table",
  "copyTags": true
}
```

**Response (201):**

```json
{
  "message": "Table schema copied to eu-west-1",
  "newTableArn": "arn:aws:dynamodb:eu-west-1:123456789012:table/users-table"
}
```

#### POST `/v1/aws/:accountId/dynamodb/tables/:tableName/query`

Execute a query on a DynamoDB table.

**Request Body:**

```json
{
  "region": "us-east-1",
  "keyConditionExpression": "pk = :pk",
  "expressionAttributeValues": { ":pk": { "S": "USER#123" } },
  "limit": 10
}
```

**Response (200):**

```json
{
  "items": [...],
  "count": 10,
  "scannedCount": 10,
  "lastEvaluatedKey": { ... },
  "cli": "aws dynamodb query --table-name users-table --key-condition-expression 'pk = :pk' --expression-attribute-values '{\":pk\":{\"S\":\"USER#123\"}}' --region us-east-1"
}
```

---

### IAM

#### GET `/v1/aws/:accountId/iam/roles`

List IAM roles.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Filter by role name |

**Response (200):**

```json
{
  "roles": [
    {
      "roleName": "lambda-execution-role",
      "roleArn": "arn:aws:iam::123456789012:role/lambda-execution-role",
      "createDate": "2026-01-15T10:00:00Z",
      "description": "Execution role for Lambda functions",
      "maxSessionDuration": 3600
    }
  ]
}
```

#### GET `/v1/aws/:accountId/iam/roles/:roleName`

Get detailed role information.

**Response (200):**

```json
{
  "roleName": "lambda-execution-role",
  "roleArn": "arn:aws:iam::123456789012:role/lambda-execution-role",
  "assumeRolePolicyDocument": { ... },
  "attachedPolicies": [
    {
      "policyName": "AWSLambdaBasicExecutionRole",
      "policyArn": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    }
  ],
  "inlinePolicies": [...],
  "tags": { ... },
  "cli": "aws iam get-role --role-name lambda-execution-role"
}
```

#### GET `/v1/aws/:accountId/iam/policies`

List IAM policies.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scope` | string | No | "Local" (customer managed) or "AWS" (AWS managed) |
| `search` | string | No | Filter by policy name |

**Response (200):**

```json
{
  "policies": [
    {
      "policyName": "my-custom-policy",
      "policyArn": "arn:aws:iam::123456789012:policy/my-custom-policy",
      "attachmentCount": 3,
      "createDate": "2026-01-15T10:00:00Z",
      "defaultVersionId": "v1"
    }
  ]
}
```

#### GET `/v1/aws/:accountId/iam/policies/:policyArn`

Get policy document.

**Response (200):**

```json
{
  "policyName": "my-custom-policy",
  "policyArn": "arn:aws:iam::123456789012:policy/my-custom-policy",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [...]
  },
  "cli": "aws iam get-policy-version --policy-arn arn:aws:iam::123456789012:policy/my-custom-policy --version-id v1"
}
```

---

### CloudFormation

#### GET `/v1/aws/:accountId/cloudformation/stacks`

List CloudFormation stacks.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | AWS region |
| `allRegions` | boolean | No | Fetch from all regions |

**Response (200):**

```json
{
  "stacks": [
    {
      "stackName": "my-app-stack",
      "stackId": "arn:aws:cloudformation:us-east-1:123456789012:stack/my-app-stack/abc123",
      "stackStatus": "CREATE_COMPLETE",
      "creationTime": "2026-03-01T10:00:00Z",
      "lastUpdatedTime": "2026-03-09T10:00:00Z",
      "region": "us-east-1",
      "description": "My application infrastructure"
    }
  ]
}
```

#### GET `/v1/aws/:accountId/cloudformation/stacks/:stackName`

Get detailed stack information.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | AWS region |

**Response (200):**

```json
{
  "stackName": "my-app-stack",
  "stackId": "arn:aws:cloudformation:us-east-1:123456789012:stack/my-app-stack/abc123",
  "stackStatus": "CREATE_COMPLETE",
  "parameters": [...],
  "outputs": [...],
  "resources": [...],
  "tags": { "Environment": "production" },
  "template": "...",
  "cli": "aws cloudformation describe-stacks --stack-name my-app-stack --region us-east-1"
}
```

#### GET `/v1/aws/:accountId/cloudformation/stacks/:stackName/template`

Get stack template.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | Yes | AWS region |

**Response (200):**

```json
{
  "templateBody": "AWSTemplateFormatVersion: '2010-09-09'...",
  "cli": "aws cloudformation get-template --stack-name my-app-stack --region us-east-1"
}
```

#### POST `/v1/aws/:accountId/cloudformation/stacks/:stackName/copy-to-region`

Deploy stack template to another region.

**Request Body:**

```json
{
  "sourceRegion": "us-east-1",
  "targetRegion": "eu-west-1",
  "targetStackName": "my-app-stack",
  "parameters": [{ "ParameterKey": "Environment", "ParameterValue": "staging" }]
}
```

**Response (201):**

```json
{
  "message": "Stack deployment initiated in eu-west-1",
  "newStackId": "arn:aws:cloudformation:eu-west-1:123456789012:stack/my-app-stack/def456"
}
```

#### POST `/v1/aws/:accountId/cloudformation/stacks/:stackName/rollback`

Rollback a stack to previous version.

**Request Body:**

```json
{
  "region": "us-east-1"
}
```

**Response (200):**

```json
{
  "message": "Stack rollback initiated",
  "stackStatus": "ROLLBACK_IN_PROGRESS"
}
```

---

### Cross-Service Endpoints

#### GET `/v1/aws/:accountId/regions`

List all available AWS regions.

**Response (200):**

```json
{
  "regions": [
    { "regionName": "us-east-1", "displayName": "US East (N. Virginia)", "enabled": true },
    { "regionName": "us-west-2", "displayName": "US West (Oregon)", "enabled": true },
    { "regionName": "eu-west-1", "displayName": "Europe (Ireland)", "enabled": true }
  ]
}
```

#### GET `/v1/aws/:accountId/resources/search`

Search resources across regions and services.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `services` | string | No | Comma-separated service filter |
| `regions` | string | No | Comma-separated region filter |
| `tags` | string | No | Tag filter (key=value) |

**Response (200):**

```json
{
  "results": [
    {
      "service": "ec2",
      "resourceType": "instance",
      "resourceId": "i-0abc123def456",
      "name": "web-server-1",
      "region": "us-east-1",
      "arn": "arn:aws:ec2:us-east-1:123456789012:instance/i-0abc123def456",
      "tags": { "Environment": "production" }
    }
  ],
  "total": 25
}
```

---

### Bookmarks (Phase 2)

#### GET `/v1/bookmarks`

List user's bookmarked resources.

**Response (200):**

```json
{
  "bookmarks": [
    {
      "bookmarkId": "bm_abc123",
      "accountId": "acc_abc123",
      "service": "ec2",
      "resourceType": "instance",
      "resourceId": "i-0abc123def456",
      "name": "Production Web Server",
      "region": "us-east-1",
      "consoleUrl": "https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#InstanceDetails:instanceId=i-0abc123def456",
      "createdAt": "2026-03-09T12:00:00Z"
    }
  ]
}
```

#### POST `/v1/bookmarks`

Add a bookmark.

**Request Body:**

```json
{
  "accountId": "acc_abc123",
  "service": "ec2",
  "resourceType": "instance",
  "resourceId": "i-0abc123def456",
  "name": "Production Web Server",
  "region": "us-east-1",
  "consoleUrl": "https://us-east-1.console.aws.amazon.com/ec2/..."
}
```

**Response (201):**

```json
{
  "bookmarkId": "bm_abc123",
  "message": "Bookmark added"
}
```

#### DELETE `/v1/bookmarks/:bookmarkId`

Remove a bookmark.

**Response (200):**

```json
{
  "message": "Bookmark removed"
}
```
