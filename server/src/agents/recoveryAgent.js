/**
 * Pure Recovery Agent module.
 * Classifies failure modes and determines recovery action (retry_with_backoff vs escalate).
 */

class RecoveryAgent {
  classifyAndResolveFailure(errorObject, currentRetryCount = 0, maxRetries = 3) {
    const errorMsg = String(errorObject.message || errorObject.details || errorObject.error || '').toUpperCase();

    let failureCategory = 'TRANSIENT';
    if (errorMsg.includes('AUTH') || errorMsg.includes('EXPIRED') || errorMsg.includes('TOKEN') || errorMsg.includes('401')) {
      failureCategory = 'AUTH_EXPIRED';
    } else if (errorMsg.includes('RATE') || errorMsg.includes('LIMIT') || errorMsg.includes('429')) {
      failureCategory = 'RATE_LIMIT';
    } else if (errorMsg.includes('MISSING') || errorMsg.includes('FIELD') || errorMsg.includes('SCHEMA')) {
      failureCategory = 'MISSING_FIELDS';
    } else if (errorMsg.includes('API') || errorMsg.includes('500') || errorMsg.includes('503')) {
      failureCategory = 'API_FAILURE';
    }

    // Decide strategy: retry with backoff vs escalate
    if (failureCategory === 'AUTH_EXPIRED') {
      return {
        category: failureCategory,
        strategy: 'escalate',
        backoffDelayMs: 0,
        recommendation: 'INTEGRATION_NOT_CONNECTED: Re-authenticate OAuth connection from Integrations page.',
      };
    }

    if (currentRetryCount < maxRetries && (failureCategory === 'TRANSIENT' || failureCategory === 'RATE_LIMIT' || failureCategory === 'API_FAILURE')) {
      const backoffDelayMs = Math.pow(2, currentRetryCount) * 1000;
      return {
        category: failureCategory,
        strategy: 'retry_with_backoff',
        backoffDelayMs,
        nextRetryCount: currentRetryCount + 1,
        recommendation: `Retrying execution with exponential backoff delay (${backoffDelayMs}ms). Attempt ${currentRetryCount + 1} of ${maxRetries}.`,
      };
    }

    return {
      category: failureCategory,
      strategy: 'escalate',
      backoffDelayMs: 0,
      recommendation: `Max retries exceeded (${currentRetryCount}/${maxRetries}). Escalating failure to operator notification drawer.`,
    };
  }
}

module.exports = new RecoveryAgent();
