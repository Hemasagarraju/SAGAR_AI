/**
 * Recovery Agent
 * Classifies runtime failures, calculates backoff intervals, and determines retry vs escalation.
 */
class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
    this.maxRetries = 3;
    this.baseBackoffMs = 1000;
  }

  /**
   * Classify failure reason
   */
  classifyError(error) {
    const message = (error.message || '').toLowerCase();
    const code = (error.code || '').toUpperCase();

    if (code === 'MISSING_FIELDS' || message.includes('required') || message.includes('missing')) {
      return 'MISSING_FIELDS';
    }

    if (code === 'AUTH_EXPIRED' || code === 'INTEGRATION_NOT_CONNECTED' || message.includes('auth') || message.includes('unauthorized') || message.includes('token expired') || message.includes('not connected')) {
      return 'AUTH_EXPIRED';
    }

    if (code === 'RATE_LIMIT' || message.includes('rate limit') || message.includes('429') || message.includes('too many requests')) {
      return 'RATE_LIMIT';
    }

    if (message.includes('timeout') || message.includes('econnreset') || message.includes('etimedout') || message.includes('503') || message.includes('502') || message.includes('temporary')) {
      return 'TRANSIENT';
    }

    return 'API_FAILURE';
  }

  /**
   * Determine recovery decision
   */
  decide(error, currentRetryCount = 0) {
    const classification = this.classifyError(error);

    // Unrecoverable errors that require immediate operator intervention
    if (classification === 'AUTH_EXPIRED' || classification === 'MISSING_FIELDS') {
      return {
        classification,
        action: 'escalate',
        backoffMs: 0,
        reason: `Failure classified as ${classification} requires operator credential renewal or parameter fix.`,
        suggestedFix: classification === 'AUTH_EXPIRED'
          ? 'Navigate to Integrations page to reconnect or refresh authorization token.'
          : 'Check node configuration parameters and ensure required fields are provided.'
      };
    }

    // Exceeded max retries
    if (currentRetryCount >= this.maxRetries) {
      return {
        classification,
        action: 'escalate',
        backoffMs: 0,
        reason: `Exceeded maximum retry attempts (${this.maxRetries}). Escalating to operator.`,
        suggestedFix: 'Review external API health status or inspect upstream payload.'
      };
    }

    // Retryable with exponential backoff (e.g. 1s, 2s, 4s) + jitter
    const backoffMs = Math.min(
      this.baseBackoffMs * Math.pow(2, currentRetryCount) + Math.floor(Math.random() * 500),
      15000
    );

    return {
      classification,
      action: 'retry_with_backoff',
      backoffMs,
      nextRetryNumber: currentRetryCount + 1,
      reason: `Transient error ${classification} detected. Scheduling automated retry #${currentRetryCount + 1} with ${backoffMs}ms backoff.`
    };
  }
}

module.exports = new RecoveryAgent();
