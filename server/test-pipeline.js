/**
 * End-to-End Automated Verification Script for SAGARAGENT_AI
 * Tests:
 * 1. Health Heartbeat
 * 2. User Registration & JWT Authentication
 * 3. AI Prompt-to-Workflow Compilation (Planner & Graph generation)
 * 4. Workflow CRUD & Versioning
 * 5. Multi-Agent Orchestrator Chain (Planner -> Executor -> Validator -> Recovery -> Monitoring)
 * 6. Execution Timeline & Audit Log Persistence
 * 7. Third-Party Integration Diagnostic Health Checks (Gmail, Slack, Discord, Google Sheets)
 */

const { connectDB, closeDB } = require('./src/config/db');
const User = require('./src/models/User');
const Workflow = require('./src/models/Workflow');
const Execution = require('./src/models/Execution');
const ExecutionLog = require('./src/models/ExecutionLog');
const authService = require('./src/services/authService');
const aiService = require('./src/services/aiService');
const workflowService = require('./src/services/workflowService');
const executionService = require('./src/services/executionService');
const integrationService = require('./src/services/integrationService');
const orchestrator = require('./src/agents/orchestrator');

async function runVerificationSuite() {
  console.log('================================================================');
  console.log('🧪 Starting SAGARAGENT_AI Automated End-to-End Test Suite');
  console.log('================================================================');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Database Connection Check
    console.log('\n[1/7] Initializing Database Connection...');
    await connectDB();
    assert(true, 'Database connected successfully (In-Memory / Atlas)');

    // 2. Auth & User Registration
    console.log('\n[2/7] Testing Operator Authentication & JWT Token Issuance...');
    const testEmail = `e2e_operator_${Date.now()}@sagaragent.io`;
    const userResult = await authService.register({
      name: 'Lead AI Operations Engineer',
      email: testEmail,
      password: 'SecurePassword123!',
      role: 'admin'
    });

    assert(userResult.token && userResult.token.length > 20, 'JWT token generated and signed');
    assert(userResult.user.email === testEmail, 'User record persisted with email');
    assert(userResult.user.role === 'admin', 'User role separation enforced (admin)');

    const userId = userResult.user.id || userResult.user._id;

    // 3. AI Prompt-to-Workflow Compilation
    console.log('\n[3/7] Testing AI Prompt-to-Workflow Graph Compilation...');
    const promptText = 'When an urgent customer support inquiry arrives via webhook, analyze sentiment with AI, if high priority post alert to #critical-ops in Slack, and append audit row to Google Sheets';
    const generatedGraph = await aiService.generateWorkflow(promptText);

    assert(generatedGraph && generatedGraph.nodes && generatedGraph.nodes.length >= 3, `Generated DAG has ${generatedGraph.nodes.length} nodes`);
    assert(generatedGraph.edges && generatedGraph.edges.length >= 2, `Generated DAG has ${generatedGraph.edges.length} sequential animated edges`);
    assert(generatedGraph.source, `Compilation source identified: ${generatedGraph.source}`);

    // 4. Workflow Persistence & Versioning
    console.log('\n[4/7] Testing Workflow CRUD & Snapshot Persistence...');
    const workflow = await workflowService.createWorkflow(userId, {
      name: generatedGraph.name,
      description: generatedGraph.description,
      nodes: generatedGraph.nodes,
      edges: generatedGraph.edges,
      tags: ['e2e-test', 'ai-generated'],
      status: 'active'
    });

    assert(workflow._id, `Workflow created with ID: ${workflow._id}`);
    assert(workflow.version === 1, 'Initial workflow version is 1');

    // Update workflow
    const updatedWf = await workflowService.updateWorkflow(userId, workflow._id, {
      name: `${workflow.name} (Updated)`
    });
    assert(updatedWf.version === 2, 'Version incremented to 2 on update');

    // 5. Multi-Agent Orchestrator Chain Execution
    console.log('\n[5/7] Executing Multi-Agent Orchestrator Chain (Planner -> Executor -> Validator -> Recovery -> Monitoring)...');
    const execution = await executionService.triggerExecution(userId, workflow._id, {
      inputs: { customerEmail: 'vip@enterprise.com', message: 'Production incident in region us-east-1', priority: 'HIGH' }
    });

    assert(execution._id, `Execution initialized with ID: ${execution._id}`);
    assert(execution.status === 'PENDING', 'Initial execution status is PENDING');

    // Run orchestrator directly to test synchronously
    console.log('  ⏳ Running synchronous execution through agent pipeline...');
    const finalExecution = await orchestrator.runExecution(execution._id);

    assert(finalExecution.status === 'COMPLETED', `Execution finished with status: ${finalExecution.status}`);
    assert(finalExecution.duration > 0, `Execution duration recorded: ${finalExecution.duration}ms`);
    assert(finalExecution.outputs && Object.keys(finalExecution.outputs).length > 0, 'Node outputs captured in execution context');

    // 6. Timeline & ExecutionLog Verification
    console.log('\n[6/7] Verifying Execution Timeline & Agent Audit Logs...');
    const timelineData = await executionService.getExecutionTimeline(userId, execution._id);
    const logs = timelineData.logs;

    assert(logs.length >= 4, `Persisted ${logs.length} granular agent logs`);

    const agentTypesLogged = new Set(logs.map((l) => l.agent));
    assert(agentTypesLogged.has('planner'), 'Planner Agent logged DAG analysis & confidence score');
    assert(agentTypesLogged.has('execution'), 'Execution Agent logged step execution & parameters');
    assert(agentTypesLogged.has('validation'), 'Validation Agent logged output schema integrity check');
    assert(agentTypesLogged.has('monitoring'), 'Monitoring Agent logged start/completion telemetry events');

    // 7. Integration Vault & Health Check
    console.log('\n[7/7] Testing Third-Party Integrations & AES-256 Vault...');
    const statuses = await integrationService.checkIntegrationStatus(userId);
    assert(statuses.gmail, 'Gmail status provider registered');
    assert(statuses.slack, 'Slack status provider registered');
    assert(statuses.discord, 'Discord status provider registered');
    assert(statuses['google-sheets'], 'Google Sheets status provider registered');

    // Test token encryption & decryption at rest
    const rawSecret = { accessToken: 'ghp_sampleSecretToken1234567890', refreshToken: 'rfr_9876543210' };
    const encrypted = integrationService.encryptCredentials(rawSecret);
    const decrypted = integrationService.decryptCredentials(encrypted);

    assert(encrypted && encrypted.includes(':'), 'Credentials encrypted in IV:AuthTag:Ciphertext format');
    assert(decrypted.accessToken === rawSecret.accessToken, 'Credentials successfully decrypted with AES-256-GCM key');

    console.log('\n================================================================');
    console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('================================================================\n');

    await closeDB();
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Unhandled error during verification:', err);
    await closeDB();
    process.exit(1);
  }
}

runVerificationSuite();
