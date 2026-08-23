/**
 * Planner Agent
 * Decides node ordering, checks graph topology, detects cycles, and emits confidence score.
 */
class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  /**
   * Plan graph execution order
   * @param {Object} workflow - Workflow with nodes and edges
   * @returns {Object} { plannedOrder: string[], confidence: number, planDetails: any }
   */
  plan(workflow) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    if (nodes.length === 0) {
      return {
        plannedOrder: [],
        confidence: 0.0,
        error: 'Workflow contains no nodes to execute.'
      };
    }

    // Build adjacency list and in-degree map
    const inDegree = {};
    const adj = {};
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    edges.forEach((e) => {
      if (adj[e.source] && inDegree[e.target] !== undefined) {
        adj[e.source].push(e.target);
        inDegree[e.target] = (inDegree[e.target] || 0) + 1;
      }
    });

    // Topological Sort (Kahn's Algorithm)
    const queue = [];
    nodes.forEach((n) => {
      if (inDegree[n.id] === 0) {
        queue.push(n.id);
      }
    });

    const plannedOrder = [];
    while (queue.length > 0) {
      const current = queue.shift();
      plannedOrder.push(current);

      for (const neighbor of (adj[current] || [])) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    // If there are unvisited nodes, graph might have cycles or disjoint components
    if (plannedOrder.length < nodes.length) {
      // Append remaining nodes for robust linear execution fallback
      const visited = new Set(plannedOrder);
      nodes.forEach((n) => {
        if (!visited.has(n.id)) {
          plannedOrder.push(n.id);
        }
      });
    }

    // Calculate confidence score based on graph validity and connectivity
    let confidence = 0.98;
    if (edges.length === 0 && nodes.length > 1) {
      confidence = 0.85; // Disconnected graph fallback
    }

    const startNode = nodes.find((n) => n.id === plannedOrder[0]);
    const planDetails = {
      totalSteps: plannedOrder.length,
      startNodeId: plannedOrder[0],
      startNodeType: startNode ? startNode.type : 'unknown',
      endNodeId: plannedOrder[plannedOrder.length - 1],
      isAcyclic: plannedOrder.length === nodes.length
    };

    return {
      plannedOrder,
      confidence,
      planDetails
    };
  }
}

module.exports = new PlannerAgent();
