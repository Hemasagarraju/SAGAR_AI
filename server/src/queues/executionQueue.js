const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let bullQueue = null;
let bullWorker = null;
let useInMemoryQueue = false;

// Resilient In-Memory Queue Fallback
class InMemoryExecutionQueue {
  constructor() {
    this.jobs = [];
    this.isProcessing = false;
  }

  async add(name, data, opts = {}) {
    const job = { id: `inmem_${Date.now()}_${Math.random().toString(36).substring(7)}`, name, data, opts, createdAt: new Date() };
    this.jobs.push(job);
    console.log(`[InMemoryQueue] Enqueued job ${job.id} for execution ${data.executionId}`);
    
    // Process asynchronously
    setImmediate(() => this.processNext());
    return job;
  }

  async processNext() {
    if (this.isProcessing || this.jobs.length === 0) return;
    this.isProcessing = true;

    const job = this.jobs.shift();
    try {
      console.log(`[InMemoryQueue] Processing execution: ${job.data.executionId}`);
      await orchestrator.runExecution(job.data.executionId);
    } catch (err) {
      console.error(`[InMemoryQueue] Job ${job.id} execution failed:`, err.message);
    } finally {
      this.isProcessing = false;
      if (this.jobs.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }
}

const inMemoryQueue = new InMemoryExecutionQueue();

function initQueue() {
  try {
    const redisConnection = new IORedis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null // don't infinitely reconnect if redis is absent
    });

    redisConnection.on('error', (err) => {
      if (!useInMemoryQueue) {
        console.warn(`[ExecutionQueue] Redis not available (${err.message}). Using In-Memory queue fallback.`);
        useInMemoryQueue = true;
      }
    });

    redisConnection.connect().then(() => {
      console.log('[ExecutionQueue] Connected to Redis successfully.');
      bullQueue = new Queue('workflow-executions', { connection: redisConnection });
      bullWorker = new Worker('workflow-executions', async (job) => {
        console.log(`[BullMQ Worker] Running job ${job.id} for execution ${job.data.executionId}`);
        return await orchestrator.runExecution(job.data.executionId);
      }, { connection: redisConnection });

      bullWorker.on('completed', (job) => {
        console.log(`[BullMQ Worker] Job ${job.id} completed.`);
      });

      bullWorker.on('failed', (job, err) => {
        console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
      });
    }).catch(() => {
      console.log('[ExecutionQueue] Redis unavailable. Falling back to In-Memory execution queue.');
      useInMemoryQueue = true;
    });
  } catch (e) {
    console.log('[ExecutionQueue] Initializing In-Memory execution queue fallback.');
    useInMemoryQueue = true;
  }
}

async function addExecutionJob(executionId, options = {}) {
  if (useInMemoryQueue || !bullQueue) {
    return await inMemoryQueue.add('execute-workflow', { executionId }, options);
  }

  try {
    return await bullQueue.add('execute-workflow', { executionId }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options
    });
  } catch (err) {
    console.warn('[ExecutionQueue] BullMQ dispatch failed, using in-memory queue:', err.message);
    return await inMemoryQueue.add('execute-workflow', { executionId }, options);
  }
}

module.exports = {
  initQueue,
  addExecutionJob
};
