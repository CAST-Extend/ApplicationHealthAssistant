# Application Health Assistant (AHA)

## Objective
AHA (Application Health Assistant) is an AI-powered tool integrated with CAST Imaging and CAST Highlight that automates the detection and remediation of Green Vulnerabilities using Gen AI. It streamlines application health management by providing intelligent, context-aware fixes and actionable insights to enhance software quality.

## Expectations
- Utilize the tool for all onboarded applications to effectively address GREEN deficiencies
- Capture application health and GREEN indicator scores from CAST Highlights (before/after running the tool)
- Identify the accuracy of the tool to ensure reliable results
- Evaluate efficiency gains for developers when fixing issues with the tool

## Prerequisites
- GitHub account required
- Must have at least one of these access levels on the GitHub code repository:
  - Write
  - Maintain
  - Admin
  *(Any one required to create pull requests)*

### Onboarding Requirements
- Application must have a repository on GitHub
- Application must be onboarded on CAST HL and Imaging
- AHA admin can then onboard the application in AHA

## AHA Functionality
Accessible via Angular default port (4200): `http://localhost:4200`

### 1. Landing Page
Provides tool overview with 'Login with GitHub' button for authentication.

### 2. Authentication
GitHub used for authentication. Three scenarios:
- **Not logged into GitHub**: Prompts for username and device verification
- **Logged into GitHub**: Direct authentication
- **Token expired**: Requires re-authorization

### 3. Authorization
Users need:
- GitHub account
- Write/Maintain/Admin role on at least one onboarded GitHub project repository

Admin menu appears only for admin/super admin roles.

### 4. Home Screen
After authentication, shows:
- Application dropdown (only accessible repositories)
- Repository name, CAST HL branch, last scan dates
- Green Impact issue numbers in orange box

### 5. Issue/Objects Details
Clicking orange box shows:
- Detailed issue information
- Impacted objects (occurrences count)

### 6. Object Selection
- Select one/multiple objects for AI fixing
- 'Add to request' enables 'Fix' button
- Disabled objects re-enabled after CAST Imaging re-scan if not fixed

### 7. Request Status
Shows requested objects count vs total for each issue.

### 8. Fix with AI
- Select prompt
- Click 'Fix with AI' to send to AHA Engine
- Engine combines prompt with CAST Imaging dependencies
- Returns fix code via Core API OpenAI (Len AI API)

### 9. Fix & PR Details
Six statuses:
1. Response Queued
2. Response Success (PR Awaited)
3. Partial Success
4. Unmodified
5. Failure
6. Completed

**Notes:**
- PR only creatable for statuses 2 & 3
- Retry button appears for partial success/unmodified/failure
- Check details via 'Fix Objects' link
- Error messages visible via status links

**Pull Request Process:**
1. Creates new branch from base
2. Updates fixed code in new branch
3. Creates PR (manual merge required)

*Whitespace Tip:* If formatting issues occur, enable 'Hide whitespace' in GitHub PR settings.

### 10. Feedback
Users can submit feedback.

### 11. Admin Section (Admin/Super Admin only)
Three screens:
1. **Application List**: Onboard new apps (add/edit/delete)
2. **Prompt List**: Create/modify prompts
3. **User Management**: Manage user roles

**Roles:**
- Developer: Full site access (no admin tab)
- Admin: Access to admin tab (app onboarding/prompts)
- Super Admin: Admin tab + user management

## Upcoming Enhancements
1. Retry feature for completed status with prompt selection
2. Custom prompt creation on prompt selection screen
3. Expand prompts library
4. Dashboard for application health/GREEN indicator status
