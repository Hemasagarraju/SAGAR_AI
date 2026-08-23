/**
 * Validation Agent
 * Verifies required output fields, schema conformity, and data integrity for each node execution.
 */
class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  /**
   * Validate node execution output
   */
  validate(node, executionResult) {
    const errors = [];
    const { type, id } = node;
    const { output = {} } = executionResult;

    if (!executionResult.success) {
      errors.push(`Step ${id} execution indicated failure.`);
      return {
        valid: false,
        errors,
        confidence: 0.0,
        checksPassed: 0,
        totalChecks: 1
      };
    }

    let checksPassed = 0;
    let totalChecks = 0;

    // Common check: output must be non-empty object
    totalChecks++;
    if (output && typeof output === 'object' && Object.keys(output).length > 0) {
      checksPassed++;
    } else {
      errors.push(`Output payload for node ${id} (${type}) is empty.`);
    }

    // Type-specific field validations
    switch (type) {
      case 'trigger': {
        totalChecks++;
        if (output.triggeredAt && output.status) {
          checksPassed++;
        } else {
          errors.push(`Trigger node ${id} missing triggeredAt or status field.`);
        }
        break;
      }

      case 'aiAgent': {
        totalChecks++;
        if (output.summary && typeof output.summary === 'string' && output.summary.trim().length > 0) {
          checksPassed++;
        } else {
          errors.push(`AI Agent node ${id} generated empty summary or insights.`);
        }
        break;
      }

      case 'gmail': {
        totalChecks++;
        if (output.status === 'SENT' || output.status === 'DELIVERED' || output.messageId) {
          checksPassed++;
        } else {
          errors.push(`Gmail step ${id} did not produce a valid delivery status.`);
        }
        break;
      }

      case 'slack': {
        totalChecks++;
        if (output.status === 'POSTED' || output.ts) {
          checksPassed++;
        } else {
          errors.push(`Slack step ${id} did not produce a confirmation timestamp or status.`);
        }
        break;
      }

      case 'discord': {
        totalChecks++;
        if (output.status === 'POSTED' || output.status === 'DELIVERED' || output.id) {
          checksPassed++;
        } else {
          errors.push(`Discord step ${id} did not produce confirmation.`);
        }
        break;
      }

      case 'googleSheets': {
        totalChecks++;
        if (output.status === 'APPENDED' || output.updatedRange || output.range) {
          checksPassed++;
        } else {
          errors.push(`Google Sheets step ${id} missing row update confirmation.`);
        }
        break;
      }

      case 'condition': {
        totalChecks++;
        if (output.branch !== undefined && typeof output.result === 'boolean') {
          checksPassed++;
        } else {
          errors.push(`Condition node ${id} did not resolve to a boolean branch.`);
        }
        break;
      }

      default:
        // Generic passes
        break;
    }

    const valid = errors.length === 0;
    const confidence = totalChecks > 0 ? Number((checksPassed / totalChecks).toFixed(2)) : 1.0;

    return {
      valid,
      errors,
      confidence,
      checksPassed,
      totalChecks
    };
  }
}

module.exports = new ValidationAgent();
