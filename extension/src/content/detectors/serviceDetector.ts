import type { AwsPageContext } from "@/shared/types/aws";

/**
 * Detects the current AWS service, region, and resource from the console URL.
 *
 * AWS Console URL patterns:
 * - https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:instanceId=i-abc123
 * - https://s3.console.aws.amazon.com/s3/buckets/my-bucket?region=us-east-1
 * - https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/my-function
 * - https://us-east-1.console.aws.amazon.com/dynamodbv2/home?region=us-east-1#table?name=my-table
 * - https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks
 * - https://us-east-1.console.aws.amazon.com/iam/home#/roles/my-role
 */

const SERVICE_URL_PATTERNS: Record<
  string,
  {
    service: string;
    urlPattern: RegExp;
    resourceExtractor?: (url: URL) => {
      resourceType: string | null;
      resourceId: string | null;
    };
  }
> = {
  ec2: {
    service: "ec2",
    urlPattern: /console\.aws\.amazon\.com\/ec2/,
    resourceExtractor: (url: URL) => {
      const hash = url.hash;
      const instanceMatch = hash.match(/instanceId=(i-[a-z0-9]+)/);
      if (instanceMatch) {
        return { resourceType: "instance", resourceId: instanceMatch[1] };
      }
      const sgMatch = hash.match(/SecurityGroups.*groupId=(sg-[a-z0-9]+)/);
      if (sgMatch) {
        return { resourceType: "security-group", resourceId: sgMatch[1] };
      }
      return { resourceType: null, resourceId: null };
    },
  },
  s3: {
    service: "s3",
    urlPattern: /console\.aws\.amazon\.com\/s3/,
    resourceExtractor: (url: URL) => {
      const bucketMatch = url.pathname.match(/\/s3\/buckets\/([^/?]+)/);
      if (bucketMatch) {
        return { resourceType: "bucket", resourceId: bucketMatch[1] };
      }
      return { resourceType: null, resourceId: null };
    },
  },
  lambda: {
    service: "lambda",
    urlPattern: /console\.aws\.amazon\.com\/lambda/,
    resourceExtractor: (url: URL) => {
      const funcMatch = url.hash.match(/\/functions\/([^/?]+)/);
      if (funcMatch) {
        return {
          resourceType: "function",
          resourceId: decodeURIComponent(funcMatch[1]),
        };
      }
      return { resourceType: null, resourceId: null };
    },
  },
  dynamodb: {
    service: "dynamodb",
    urlPattern: /console\.aws\.amazon\.com\/dynamodb/,
    resourceExtractor: (url: URL) => {
      const tableMatch =
        url.hash.match(/table\?name=([^&]+)/) ||
        url.hash.match(/tables\/([^/?]+)/);
      if (tableMatch) {
        return {
          resourceType: "table",
          resourceId: decodeURIComponent(tableMatch[1]),
        };
      }
      return { resourceType: null, resourceId: null };
    },
  },
  iam: {
    service: "iam",
    urlPattern: /console\.aws\.amazon\.com\/iam/,
    resourceExtractor: (url: URL) => {
      const roleMatch = url.hash.match(/\/roles\/([^/?]+)/);
      if (roleMatch) {
        return {
          resourceType: "role",
          resourceId: decodeURIComponent(roleMatch[1]),
        };
      }
      const policyMatch = url.hash.match(/\/policies\/([^/?]+)/);
      if (policyMatch) {
        return {
          resourceType: "policy",
          resourceId: decodeURIComponent(policyMatch[1]),
        };
      }
      return { resourceType: null, resourceId: null };
    },
  },
  cloudformation: {
    service: "cloudformation",
    urlPattern: /console\.aws\.amazon\.com\/cloudformation/,
    resourceExtractor: (url: URL) => {
      const stackMatch = url.hash.match(
        /\/stacks\/stackinfo\?.*stackId=([^&]+)/,
      );
      if (stackMatch) {
        return {
          resourceType: "stack",
          resourceId: decodeURIComponent(stackMatch[1]),
        };
      }
      return { resourceType: null, resourceId: null };
    },
  },
};

/**
 * Extract the AWS region from the URL
 */
function extractRegion(url: URL): string | null {
  // Check query parameter first
  const regionParam = url.searchParams.get("region");
  if (regionParam) return regionParam;

  // Check subdomain (e.g., us-east-1.console.aws.amazon.com)
  const subdomainMatch = url.hostname.match(
    /^([a-z]{2}-[a-z]+-\d)\.console\.aws\.amazon\.com/,
  );
  if (subdomainMatch) return subdomainMatch[1];

  return null;
}

/**
 * Extract the AWS account ID from the page (if available in DOM)
 */
function extractAccountId(): string | null {
  // AWS Console typically shows account ID in the navigation bar
  const accountElement = document.querySelector(
    '[data-testid="account-detail-menu"]',
  );
  if (accountElement?.textContent) {
    const accountMatch = accountElement.textContent.match(/(\d{12})/);
    if (accountMatch) return accountMatch[1];
  }
  return null;
}

/**
 * Detect the current AWS page context from the URL
 */
export function detectPageContext(urlString?: string): AwsPageContext {
  const url = new URL(urlString || window.location.href);

  const context: AwsPageContext = {
    service: null,
    region: extractRegion(url),
    resourceType: null,
    resourceId: null,
    accountId: extractAccountId(),
    url: url.href,
  };

  // Match against known service patterns
  for (const pattern of Object.values(SERVICE_URL_PATTERNS)) {
    if (pattern.urlPattern.test(url.href)) {
      context.service = pattern.service;

      if (pattern.resourceExtractor) {
        const resource = pattern.resourceExtractor(url);
        context.resourceType = resource.resourceType;
        context.resourceId = resource.resourceId;
      }
      break;
    }
  }

  return context;
}
