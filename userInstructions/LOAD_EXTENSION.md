# Loading AWS Console Better Extension in Chrome

## Prerequisites

- Google Chrome browser
- The extension has been built (`extension/dist/` folder exists)

## Steps to Load the Extension

1. **Build the extension** (if not already built):

   ```bash
   cd extension
   npm install
   npx vite build
   ```

2. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions` in your Chrome browser
   - Or go to Chrome menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**:
   - Click "Load unpacked"
   - Navigate to: `aws-console-better/extension/dist`
   - Select the `dist` folder and click "Select"

5. **Verify the extension loaded**:
   - You should see "AWS Console Better" in your extensions list
   - The extension icon should appear in your Chrome toolbar (you may need to pin it)

## Testing the Extension

1. **Navigate to the AWS Console**:
   - Go to https://console.aws.amazon.com
   - Log in to your AWS account

2. **Check the floating toolbar**:
   - On any AWS service page (EC2, S3, Lambda, etc.), you should see a floating toolbar in the bottom-right corner
   - The toolbar shows context-aware buttons based on which service you're viewing

3. **Test the popup**:
   - Click the extension icon in the Chrome toolbar
   - You should see the AWS Console Better popup with sign-in options

4. **Test the side panel**:
   - Right-click the extension icon → "Open side panel"
   - Or click "Open Side Panel" from the popup
   - The side panel shows tabs for Context, Actions, History, and Settings

## Features Available for Testing

### Content Script (on AWS Console pages)

- **⚡ AWS Better** button — Opens the side panel
- **📋 Region** button — Copies the current region to clipboard
- **📋 Resource ID** button — Copies the resource ID (when on a specific resource page)
- **🌍 Copy to Region** button — Opens side panel with copy-to-region workflow
- **💻 Show CLI** button — Copies the equivalent AWS CLI command

### Supported AWS Services for Context Detection

- EC2 (instances, security groups)
- S3 (buckets)
- Lambda (functions)
- DynamoDB (tables)
- IAM (roles, policies)
- CloudFormation (stacks)

## Troubleshooting

- **Extension not loading**: Check the Chrome DevTools console for errors (right-click extension icon → "Inspect popup")
- **Content script not appearing**: Make sure you're on an AWS Console page (`*.console.aws.amazon.com`)
- **Toolbar not showing**: The toolbar only appears when a supported AWS service is detected in the URL
- **To reload after changes**: Click the refresh icon on the extension card in `chrome://extensions`
