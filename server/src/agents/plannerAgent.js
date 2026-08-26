/**
 * Pure Planner Agent module.
 * Analyzes graph nodes & edges, determines topological ordering, and emits confidence score.
 */

class PlannerAgent {
  async planExecution(workflowSnapshot) {
    const nodes = workflowSnapshot.nodes || [];
    const edges = workflowSnapshot.edges || [];

    if (!nodes.length) {
      return {
        orderedNodeIds: [],
        confidenceScore: 0.0,
        planSteps: [],
        error: 'Workflow graph contains zero nodes',
      };
    }

    // Build adjacency list & in-degree count map for Topological Sort (Kahn's Algorithm)
    const inDegree = new Map();
    const adjList = new Map();

    nodes.forEach(n => {
      inDegree.set(n.id, 0);
      adjList.set(n.id, []);
    });

    edges.forEach(e => {
      if (adjList.has(e.source) && inDegree.has(e.target)) {
        adjList.get(e.source).push(e.target);
        inDegree.set(e.target, inDegree.get(e.target) + 1);
      }
    });

    const queue = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });

    const orderedNodeIds = [];
    while (queue.length > 0) {
      const curr = queue.shift();
      orderedNodeIds.push(curr);

      const neighbors = adjList.get(curr) || [];
      neighbors.forEach(nbr => {
        inDegree.set(nbr, inDegree.get(nbr) - 1);
        if (inDegree.get(nbr) === 0) {
          queue.push(nbr);
        }
      });
    }

    // If topological sort didn't include all nodes, fallback to node array order
    if (orderedNodeIds.length !== nodes.length) {
      console.warn('⚠️ Graph contains cycles or disconnected components; falling back to node sequence order.');
      const remaining = nodes.map(n => n.id).filter(id => !orderedNodeIds.includes(id));
      orderedNodeIds.push(...remaining);
    }

    const planSteps = orderedNodeIds.map(id => {
      const node = nodes.find(n => n.id === id);
      return {
        nodeId: id,
        type: node?.type || 'action',
        label: node?.data?.label || id,
      };
    });

    const confidenceScore = nodes.length > 0 ? Math.min(0.98, 0.85 + nodes.length * 0.02) : 0.5;

    return {
      orderedNodeIds,
      confidenceScore,
      planSteps,
      error: null,
    };
  }
}

module.exports = new PlannerAgent();
