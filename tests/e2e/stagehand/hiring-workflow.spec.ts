import { test, expect } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

/**
 * Hiring Workflow Tests (AI-Powered)
 *
 * These tests use Stagehand for complex, multi-step workflows that span
 * multiple user roles and require natural language interactions.
 *
 * Benefits of using Stagehand here:
 * - Self-healing: Adapts to UI changes
 * - Natural language: Easy to understand test intent
 * - Data extraction: Structured data validation
 */

test.describe('Hiring Workflow (AI-Powered)', () => {
  test('should create hiring need and complete approval workflow', async () => {
    const stagehand = new Stagehand({
      env: 'LOCAL',
      enableCaching: true,
      headless: process.env.CI === 'true',
    });

    await stagehand.init();
    const page = stagehand.page;

    try {
      // ===== STEP 1: Login as Hiring Manager =====
      console.log('Step 1: Logging in as hiring manager...');
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('enter "manager@company.com" in the email field');
      await stagehand.act('enter "ManagerPass123!" in the password field');
      await stagehand.act('click the login button');
      await page.waitForURL(/\/dashboard/);
      console.log('✓ Logged in successfully');

      // ===== STEP 2: Create Hiring Need =====
      console.log('Step 2: Creating hiring need...');
      await stagehand.act('navigate to the hiring needs section');
      await stagehand.act('click the button to create a new hiring request');

      // Use AI agent for complex form filling
      const agent = stagehand.agent();
      await agent.execute(`
        Fill out the hiring need form with the following details:
        - Request type: New Role
        - Title: Senior Data Scientist
        - Department: Engineering
        - Location: London Office
        - Priority: High
        - Required start date: March 1, 2026
        - Business justification: We need a data scientist to build ML models for our recommendation engine. This is critical for Q1 2026 product launch. Without this hire, we risk delaying the launch by 3 months and losing competitive advantage.
        - Submit the form
      `);

      // Extract hiring need details
      const hiringNeedData = await stagehand.extract(
        'extract the hiring need details from the current page',
        z.object({
          id: z.string().describe('The hiring need ID or reference number'),
          status: z.string().describe('The current approval status'),
          title: z.string().describe('The job title'),
          priority: z.string().describe('The priority level'),
        })
      );

      console.log('✓ Hiring need created:', hiringNeedData);
      expect(hiringNeedData.status).toMatch(/Pending.*Approval/i);
      expect(hiringNeedData.title).toBe('Senior Data Scientist');
      expect(hiringNeedData.priority).toBe('High');

      const hiringNeedId = hiringNeedData.id;

      // ===== STEP 3: Logout and Login as First Approver =====
      console.log('Step 3: Switching to first approver account...');
      await stagehand.act('logout from the application');
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('login with email "director@company.com" and password "DirectorPass123!"');
      await page.waitForURL(/\/dashboard/);
      console.log('✓ Logged in as director');

      // ===== STEP 4: Approve Hiring Need (Manager Level) =====
      console.log('Step 4: Reviewing and approving hiring need...');
      await stagehand.act('navigate to my pending approvals or approval queue');

      // Find and open the specific hiring need
      await stagehand.act(`find and click on the hiring need with ID ${hiringNeedId} or title "Senior Data Scientist"`);

      // Review details before approving
      const reviewData = await stagehand.extract(
        'extract the hiring need details being reviewed',
        z.object({
          title: z.string(),
          justification: z.string().describe('The business justification text'),
          requester: z.string().describe('Who requested this hire'),
          department: z.string(),
        })
      );

      console.log('Reviewing:', reviewData);
      expect(reviewData.title).toBe('Senior Data Scientist');

      // Approve with comment
      await stagehand.act('enter the comment "Approved. Critical for product roadmap and competitive positioning." in the approval comment field');
      await stagehand.act('click the approve button');

      // Verify approval went through
      const statusAfterFirstApproval = await stagehand.extract(
        'extract the current approval status',
        z.object({
          status: z.string().describe('The approval status after first approval'),
          nextApprover: z.string().optional().describe('The next person who needs to approve, if any'),
        })
      );

      console.log('✓ First approval completed:', statusAfterFirstApproval);
      // Status could be "Approved" or "Pending Finance Approval" depending on workflow config
      expect(statusAfterFirstApproval.status).toMatch(/Approved|Finance|Budget/i);

      // ===== STEP 5: Login as Finance Approver (if needed) =====
      if (statusAfterFirstApproval.nextApprover) {
        console.log('Step 5: Finance approval required, switching account...');
        await stagehand.act('logout from the application');
        await page.goto(process.env.BASE_URL + '/login');
        await stagehand.act('login with email "finance@company.com" and password "FinancePass123!"');
        await page.waitForURL(/\/dashboard/);
        console.log('✓ Logged in as finance approver');

        // ===== STEP 6: Final Approval (Finance) =====
        console.log('Step 6: Final finance approval...');
        await stagehand.act('navigate to pending approvals');
        await stagehand.act(`click on the hiring need for Senior Data Scientist`);

        // Finance review
        await stagehand.act('enter the comment "Budget approved for Q1 2026 headcount plan."');
        await stagehand.act('click the approve button');

        console.log('✓ Finance approval completed');
      }

      // ===== STEP 7: Verify Final Status =====
      console.log('Step 7: Verifying final approval status...');
      const finalStatus = await stagehand.extract(
        'extract the complete approval status and history',
        z.object({
          status: z.string().describe('The final approval status'),
          approvalChain: z.array(z.object({
            approver: z.string().describe('Name of the approver'),
            decision: z.string().describe('Approved, Rejected, or Pending'),
            date: z.string().optional().describe('When the decision was made'),
          })).describe('The list of all approvers and their decisions'),
        })
      );

      console.log('✓ Final status:', finalStatus);
      expect(finalStatus.status).toBe('Approved');
      expect(finalStatus.approvalChain.length).toBeGreaterThanOrEqual(1);
      expect(finalStatus.approvalChain.every(a => a.decision === 'Approved')).toBe(true);

      console.log('✅ Complete hiring workflow test passed!');

    } finally {
      await stagehand.close();
    }
  });

  test('should reject hiring need with reason', async () => {
    const stagehand = new Stagehand({
      env: 'LOCAL',
      enableCaching: true,
      headless: process.env.CI === 'true',
    });

    await stagehand.init();
    const page = stagehand.page;

    try {
      // Create hiring need (abbreviated)
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('login as manager@company.com');
      await page.waitForURL(/\/dashboard/);

      await stagehand.act('navigate to hiring needs');
      await stagehand.act('create a new hiring request');

      const agent = stagehand.agent();
      await agent.execute(`
        Create a hiring need:
        - Type: New Role
        - Title: Junior Marketing Coordinator
        - Department: Marketing
        - Location: Remote
        - Priority: Low
        - Justification: Would be nice to have for social media management
        - Submit
      `);

      // Switch to approver
      await stagehand.act('logout');
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('login as director@company.com');
      await page.waitForURL(/\/dashboard/);

      // Reject the request
      await stagehand.act('navigate to pending approvals');
      await stagehand.act('click on the Junior Marketing Coordinator hiring request');

      await stagehand.act('enter rejection reason: "Budget constraints. We need to prioritize engineering hires this quarter. Please resubmit in Q2."');
      await stagehand.act('click the reject button');

      // Verify rejection
      const rejectionStatus = await stagehand.extract(
        'extract the rejection details',
        z.object({
          status: z.string().describe('Should be Rejected'),
          reason: z.string().describe('The rejection reason provided'),
          rejectedBy: z.string().describe('Who rejected it'),
        })
      );

      expect(rejectionStatus.status).toBe('Rejected');
      expect(rejectionStatus.reason).toContain('Budget constraints');
      console.log('✅ Rejection workflow test passed!');

    } finally {
      await stagehand.close();
    }
  });

  test('should track hiring need through candidate pipeline', async () => {
    const stagehand = new Stagehand({
      env: 'LOCAL',
      enableCaching: true,
      headless: process.env.CI === 'true',
    });

    await stagehand.init();
    const page = stagehand.page;

    try {
      // Assume hiring need already approved, login as recruiter
      await page.goto(process.env.BASE_URL + '/login');
      await stagehand.act('login as recruiter@company.com with password RecruiterPass123!');
      await page.waitForURL(/\/dashboard/);

      // Navigate to approved hiring needs
      await stagehand.act('navigate to hiring needs');
      await stagehand.act('filter to show only approved hiring needs');
      await stagehand.act('click on the first approved hiring need');

      // Add a candidate
      await stagehand.act('click the button to add a candidate');

      const agent = stagehand.agent();
      await agent.execute(`
        Add an external candidate:
        - Name: Sarah Chen
        - Email: sarah.chen@example.com
        - Source: LinkedIn
        - Resume: Upload (or skip if not possible)
        - Add to pipeline
      `);

      // Move candidate through stages
      await stagehand.act('move Sarah Chen to Screening stage');
      await stagehand.act('add interview feedback: "Strong technical background, good communication skills"');
      await stagehand.act('move Sarah Chen to Technical Interview stage');

      // Extract pipeline status
      const pipelineStatus = await stagehand.extract(
        'extract the candidate pipeline for this hiring need',
        z.object({
          candidates: z.array(z.object({
            name: z.string(),
            currentStage: z.string(),
            status: z.string(),
          })),
          totalCandidates: z.number(),
        })
      );

      expect(pipelineStatus.candidates).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('Sarah Chen'),
          currentStage: 'Technical Interview',
        })
      );

      console.log('✅ Candidate pipeline tracking test passed!');

    } finally {
      await stagehand.close();
    }
  });
});
