import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useWorkflowStore = create((set, get) => ({
  // Workflow Editor State
  activeWorkflow: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  isSaving: false,

  // Live Execution State
  activeExecution: null,
  executionLogs: [],
  currentNodeId: null,
  executionStatus: null,
  isExecutionDrawerOpen: false,

  // Notifications State
  notifications: [],
  unreadCount: 0,
  isNotificationDrawerOpen: false,

  // Set active workflow and populate nodes/edges
  setActiveWorkflow: (workflow) => {
    if (!workflow) {
      set({
        activeWorkflow: null,
        nodes: [],
        edges: [],
        selectedNodeId: null,
        isDirty: false
      });
      return;
    }

    set({
      activeWorkflow: workflow,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      selectedNodeId: null,
      isDirty: false
    });
  },

  // React Flow Handlers
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, id: `edge_${connection.source}_${connection.target}_${Date.now()}` }, get().edges),
      isDirty: true
    });
  },

  setSelectedNodeId: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  // Add node from palette
  addNode: (nodeType, position, customData = {}) => {
    const nodes = get().nodes;
    const count = nodes.length + 1;
    const id = `node_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const defaultLabels = {
      trigger: 'Manual Trigger',
      aiAgent: 'AI Reasoning Agent',
      gmail: 'Gmail Dispatcher',
      slack: 'Slack Alert Bot',
      discord: 'Discord Webhook',
      googleSheets: 'Google Sheets Ledger',
      condition: 'Condition Router',
      transform: 'Data Transformer'
    };

    const defaultActions = {
      trigger: 'manual',
      aiAgent: 'analyze',
      gmail: 'sendEmail',
      slack: 'postMessage',
      discord: 'postMessage',
      googleSheets: 'appendRow',
      condition: 'evaluate',
      transform: 'format'
    };

    const defaultConfigs = {
      trigger: { mode: 'on_demand' },
      aiAgent: { prompt: 'Analyze input and synthesize key operational findings', model: 'gemini-1.5-flash' },
      gmail: { to: 'operator@agentflow.io', subject: 'Automated Operations Alert', body: '<p>Workflow pipeline executed.</p>' },
      slack: { channel: '#ops-alerts', message: '⚡ Automated pipeline completed.' },
      discord: { channelId: 'general', content: '📢 Automated notification dispatched.' },
      googleSheets: { spreadsheetId: 'ops_audit_2026', range: 'Sheet1!A:D', values: [] },
      condition: { expression: '{{inputs.priority}} === "HIGH"', description: 'Check priority level' },
      transform: { template: 'Processed Event Data' }
    };

    const newNode = {
      id,
      type: nodeType,
      position: position || { x: 100 + (nodes.length % 4) * 240, y: 150 + Math.floor(nodes.length / 4) * 120 },
      data: {
        label: customData.label || defaultLabels[nodeType] || `Step ${count}`,
        action: customData.action || defaultActions[nodeType] || 'execute',
        config: customData.config || defaultConfigs[nodeType] || {},
        description: customData.description || `Autonomous ${nodeType} step`
      }
    };

    set({
      nodes: [...nodes, newNode],
      selectedNodeId: id,
      isDirty: true
    });

    return newNode;
  },

  // Update selected node configuration
  updateNodeData: (nodeId, dataUpdate) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...dataUpdate,
            config: {
              ...(node.data?.config || {}),
              ...(dataUpdate.config || {})
            }
          }
        };
      }
      return node;
    });

    set({ nodes, isDirty: true });
  },

  // Remove node and attached edges
  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDirty: true
    });
  },

  // Save workflow to backend
  saveWorkflow: async () => {
    const { activeWorkflow, nodes, edges } = get();
    if (!activeWorkflow) return;

    set({ isSaving: true });
    try {
      const res = await api.put(`/workflows/${activeWorkflow._id}`, {
        name: activeWorkflow.name,
        description: activeWorkflow.description,
        status: activeWorkflow.status,
        triggerConfig: activeWorkflow.triggerConfig,
        tags: activeWorkflow.tags,
        nodes,
        edges
      });

      if (res.data?.success) {
        const wf = res.data.data || res.data.workflow;
        set({
          activeWorkflow: wf,
          nodes: wf?.nodes || [],
          edges: wf?.edges || [],
          isDirty: false,
          isSaving: false
        });
        return { success: true, workflow: wf };
      }
      throw new Error(res.data?.error || 'Failed to save workflow');
    } catch (err) {
      set({ isSaving: false });
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },

  // Live Execution Handlers
  setActiveExecution: (execution, logs = []) => {
    set({
      activeExecution: execution,
      executionLogs: logs,
      currentNodeId: execution?.currentNode || null,
      executionStatus: execution?.status || null
    });
  },

  handleAgentEvent: (event) => {
    set((state) => {
      const exists = state.executionLogs.some((l) => l.id === event.id || (l._id && l._id === event.id));
      const updatedLogs = exists ? state.executionLogs : [...state.executionLogs, event];
      return {
        executionLogs: updatedLogs,
        currentNodeId: event.nodeId || state.currentNodeId
      };
    });
  },

  handleExecutionUpdate: (data) => {
    set((state) => {
      if (!state.activeExecution || state.activeExecution._id !== data.executionId) {
        return state;
      }
      return {
        activeExecution: {
          ...state.activeExecution,
          status: data.status,
          currentNode: data.currentNode,
          duration: data.duration ?? state.activeExecution.duration,
          error: data.error ?? state.activeExecution.error
        },
        executionStatus: data.status,
        currentNodeId: data.currentNode
      };
    });
  },

  toggleExecutionDrawer: (open) => {
    set({ isExecutionDrawerOpen: open !== undefined ? open : !get().isExecutionDrawerOpen });
  },

  // Notifications Handlers
  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        set({
          notifications: res.data.notifications,
          unreadCount: res.data.unreadCount || 0
        });
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markNotificationAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (err) {
      console.warn('Failed to mark notification read:', err.message);
    }
  },

  clearAllNotifications: async () => {
    try {
      await api.delete('/notifications/clear');
      set({ notifications: [], unreadCount: 0 });
    } catch (err) {
      console.warn('Failed to clear notifications:', err.message);
    }
  },

  toggleNotificationDrawer: (open) => {
    set({ isNotificationDrawerOpen: open !== undefined ? open : !get().isNotificationDrawerOpen });
  }
}));
