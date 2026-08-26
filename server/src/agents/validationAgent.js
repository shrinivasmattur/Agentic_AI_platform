/**
 * Pure Validation Agent module.
 * Verifies required output fields and ensures data schema compliance before downstream propagation.
 */

class ValidationAgent {
  async validateStepOutput(node, stepOutput) {
    if (!stepOutput) {
      return {
        valid: false,
        error: 'MISSING_FIELDS',
        missingFields: ['output'],
        details: `Node [${node.id}] returned empty output payload`,
      };
    }

    // Check for explicit error flags from execution agent
    if (stepOutput.error || stepOutput.success === false) {
      return {
        valid: false,
        error: stepOutput.errorCode || 'API_FAILURE',
        missingFields: [],
        details: stepOutput.error || 'Execution agent returned failure status',
      };
    }

    // Node-specific schema validation
    const missingFields = [];
    if (node.type === 'gmail_send' && !stepOutput.messageId && !stepOutput.status) {
      missingFields.push('messageId');
    } else if (node.type === 'sheets_append' && !stepOutput.updatedRange && !stepOutput.status) {
      missingFields.push('updatedRange');
    }

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: 'MISSING_FIELDS',
        missingFields,
        details: `Required fields missing from output schema: ${missingFields.join(', ')}`,
      };
    }

    return {
      valid: true,
      error: null,
      missingFields: [],
      details: 'Node output verified against required output schemas',
    };
  }
}

module.exports = new ValidationAgent();
