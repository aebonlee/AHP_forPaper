import React from 'react';

interface TreeNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  children?: TreeNode[];
  weight?: number;
  parent_id?: string | null;
}

interface HierarchyTreeVisualizationProps {
  nodes: TreeNode[];
  title?: string;
  showWeights?: boolean;
  interactive?: boolean;
  onNodeClick?: (node: TreeNode) => void;
}

const HierarchyTreeVisualization: React.FC<HierarchyTreeVisualizationProps> = ({
  nodes,
  title = "계층구조",
  showWeights = false,
  interactive = false,
  onNodeClick
}) => {
  // 노드를 계층구조로 변환
  const buildHierarchy = (flatNodes: TreeNode[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // 먼저 모든 노드를 맵에 저장
    flatNodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // 부모-자식 관계 설정
    flatNodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!;
      if (node.parent_id && nodeMap.has(node.parent_id)) {
        const parent = nodeMap.get(node.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(nodeWithChildren);
      } else {
        rootNodes.push(nodeWithChildren);
      }
    });

    return rootNodes;
  };

  const hierarchy = buildHierarchy(nodes);

  const getNodeIcon = (node: TreeNode) => {
    if (node.level === 1) return '🎯';
    if (node.level === 2) return '📋';
    return '📝';
  };

  const getNodeColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 border-blue-300 text-blue-800';
      case 2: return 'bg-green-100 border-green-300 text-green-800';
      case 3: return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const renderNode = (node: TreeNode, index: number, isLast: boolean[] = []): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isClickable = interactive && onNodeClick;

    return (
      <div key={node.id} className="relative">
        {/* 연결선 그리기 */}
        {node.level > 1 && (
          <>
            {/* 수직선 */}
            <div 
              className="absolute w-px bg-gray-300 -left-6 top-0"
              style={{ height: '24px' }}
            />
            {/* 수평선 */}
            <div 
              className="absolute h-px bg-gray-300 -left-6 top-6"
              style={{ width: '24px' }}
            />
          </>
        )}

        {/* 노드 박스 */}
        <div 
          className={`
            mb-3 p-3 rounded-lg border-2 transition-all duration-200 
            ${getNodeColor(node.level)}
            ${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
            ${hasChildren ? 'font-medium' : ''}
          `}
          onClick={() => isClickable && onNodeClick!(node)}
          style={{ marginLeft: `${(node.level - 1) * 32}px` }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getNodeIcon(node)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{node.name}</div>
                  {node.description && (
                    <div className="text-xs opacity-75 mt-1">{node.description}</div>
                  )}
                </div>
                {showWeights && node.weight && (
                  <div className="text-xs font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                    {(node.weight * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
            {hasChildren && (
              <span className="text-xs text-gray-600">
                ({node.children!.length}개 하위)
              </span>
            )}
          </div>
        </div>

        {/* 하위 노드들 렌더링 */}
        {hasChildren && (
          <div className="relative">
            {node.children!.map((child, childIndex) => {
              const childIsLast = [...isLast, childIndex === node.children!.length - 1];
              return renderNode(child, childIndex, childIsLast);
            })}
          </div>
        )}
      </div>
    );
  };

  if (hierarchy.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🌳</div>
        <p className="text-lg">계층구조가 비어있습니다</p>
        <p className="text-sm">기준을 추가하여 계층구조를 만들어보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🌳</span>
          {title}
        </h3>
        <div className="text-sm text-gray-500">
          총 {nodes.length}개 노드
        </div>
      </div>

      <div className="space-y-2">
        {hierarchy.map((node, index) => renderNode(node, index))}
      </div>

      {/* 범례 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">범례</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎯</span>
            <span>상위 기준 (Level 1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📋</span>
            <span>세부 기준 (Level 2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📝</span>
            <span>하위 기준 (Level 3+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchyTreeVisualization;