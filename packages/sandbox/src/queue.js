/**
 * Execution queue with concurrency control for sandbox executions.
 * Prevents server overload by limiting simultaneous Docker container executions.
 */

const { logger } = require('./logger');

const DEFAULT_MAX_CONCURRENT = 5;
const MAX_CONCURRENT = Number(process.env.SANDBOX_MAX_CONCURRENT_EXECUTIONS) || DEFAULT_MAX_CONCURRENT;

/**
 * Simple semaphore-based queue for controlling concurrent executions.
 */
class ExecutionQueue {
  constructor(maxConcurrent = MAX_CONCURRENT) {
    this.maxConcurrent = Math.max(1, maxConcurrent);
    this.running = 0;
    this.queue = [];
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      queued: 0,
    };
  }

  /**
   * Add an execution task to the queue.
   * @param {Function} task - Async function that returns a Promise
   * @returns {Promise} Promise that resolves when the task completes
   */
  async enqueue(task) {
    this.stats.total++;
    const queuePosition = this.queue.length;
    const wasQueued = this.running >= this.maxConcurrent;

    if (wasQueued) {
      this.stats.queued++;
      logger.info('Execution queued', {
        queuePosition: queuePosition + 1,
        running: this.running,
        maxConcurrent: this.maxConcurrent,
      });
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
      });

      this.process();
    });
  }

  /**
   * Process the queue, executing tasks up to the concurrency limit.
   */
  async process() {
    // Don't process if we're at capacity or queue is empty
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Get next task from queue
    const { task, resolve, reject } = this.queue.shift();
    this.running++;
    if (this.stats.queued > 0) {
      this.stats.queued--;
    }

    const remainingInQueue = this.queue.length;
    logger.info('Execution started', {
      running: this.running,
      maxConcurrent: this.maxConcurrent,
      queued: remainingInQueue,
    });

    try {
      const result = await task();
      this.stats.completed++;
      resolve(result);
    } catch (error) {
      this.stats.failed++;
      reject(error);
    } finally {
      this.running--;
      logger.info('Execution finished', {
        running: this.running,
        maxConcurrent: this.maxConcurrent,
        queued: this.queue.length,
      });
      // Process next task in queue
      setImmediate(() => this.process());
    }
  }

  /**
   * Get current queue statistics.
   * @returns {Object} Queue statistics
   */
  getStats() {
    return {
      maxConcurrent: this.maxConcurrent,
      running: this.running,
      queued: this.queue.length,
      stats: { ...this.stats },
    };
  }

  /**
   * Get current queue size (waiting + running).
   * @returns {number} Total items in queue
   */
  getSize() {
    return this.queue.length + this.running;
  }
}

// Singleton instance
const executionQueue = new ExecutionQueue(MAX_CONCURRENT);

// Log configuration on startup
logger.info('Execution queue initialized', {
  maxConcurrent: MAX_CONCURRENT,
});

module.exports = executionQueue;
