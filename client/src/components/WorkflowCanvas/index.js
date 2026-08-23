import { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeTypes = {
  trigger: CustomNode,
  aiAgent: CustomNode,
  gmail: CustomNode,
  slack: CustomNode,
  discord: CustomNode,
  googleSheets: CustomNode,
  condition: CustomNode,
  transform: CustomNode
};

function CanvasInner({ readOnly = false }) {
  const reactFlowWrapper = useRef(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId
  } = useWorkflowStore();

  const { screenToFlowPosition, fitView } = useReactFlow();

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [nodes?.length, fitView]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (readOnly) return;

      const type = event.dataTransfer.getData('application/reactflow/type');
      const dataString = event.dataTransfer.getData('application/reactflow/data');

      if (!type) return;

      let customData = {};
      try {
        if (dataString) customData = JSON.parse(dataString);
      } catch (e) {}

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      addNode(type, position, customData);
    },
    [screenToFlowPosition, addNode, readOnly]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        }}
        className="bg-cyber-grid"
      >
        <Controls position="bottom-left" showInteractive={!readOnly} />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-right"
          nodeColor={(n) => {
            if (n.type === 'trigger') return '#6366f1';
            if (n.type === 'aiAgent') return '#8b5cf6';
            if (n.type === 'gmail') return '#f43f5e';
            if (n.type === 'slack' || n.type === 'googleSheets') return '#10b981';
            if (n.type === 'condition') return '#f59e0b';
            return '#06b6d4';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255, 255, 255, 0.08)" />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas(props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
