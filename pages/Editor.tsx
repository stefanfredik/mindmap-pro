
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, Download, Upload, Plus, Minus, Type, Palette, 
  Trash, Save, Layout, ZoomIn, ZoomOut, MousePointer, PaintBucket, X, Check, Network, GitFork, List as ListIcon, Trash2, Tag, Edit
} from 'lucide-react';
import { MindMapData, MindMapNode, Position, Viewport, NodeStyle, LayoutType, MindMapConnection } from '../types';
import { NodeComponent } from '../components/NodeComponent';
import { NodeToolbar } from '../components/NodeToolbar';
import { RichTextEditor } from '../components/RichTextEditor';
import { generateId, getConnectionPath, getCrossLinkPath, autoLayout, downloadJson, applyTheme } from '../utils';
import { DEFAULT_NODE_STYLE, THEMES, DEFAULT_THEME_ID } from '../constants';

interface EditorProps {
  data: MindMapData;
  onSave: (data: MindMapData) => void;
  onBack: () => void;
}

// Visual Preview Component for Themes
const ThemePreview: React.FC<{ themeId: string }> = ({ themeId }) => {
  const Node = ({ x, y, color, w=12, h=6, rx=2, stroke, strokeWidth=0, fill }: any) => {
     const fillColor = fill || color;
     return <rect x={x - w/2} y={y - h/2} width={w} height={h} rx={rx} fill={fillColor} stroke={stroke} strokeWidth={strokeWidth} />;
  }
  
  const Link = ({ sx, sy, ex, ey, color }: any) => (
    <path d={`M${sx} ${sy} C ${(sx+ex)/2} ${sy} ${(sx+ex)/2} ${ey} ${ex} ${ey}`} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  );

  switch (themeId) {
    case 'meister':
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-sm">
           <Link sx={50} sy={30} ex={20} ey={15} color="#A78BFA" />
           <Link sx={50} sy={30} ex={20} ey={45} color="#F87171" />
           <Link sx={50} sy={30} ex={80} ey={15} color="#A3E635" />
           <Link sx={50} sy={30} ex={80} ey={45} color="#FBBF24" />
           <Node x={50} y={30} color="#94a3b8" />
           <Node x={20} y={15} color="#ffffff" stroke="#A78BFA" strokeWidth={1} w={10} h={4} />
           <Node x={20} y={45} color="#ffffff" stroke="#F87171" strokeWidth={1} w={10} h={4} />
           <Node x={80} y={15} color="#ffffff" stroke="#A3E635" strokeWidth={1} w={10} h={4} />
           <Node x={80} y={45} color="#ffffff" stroke="#FBBF24" strokeWidth={1} w={10} h={4} />
        </svg>
      );
    default:
      return (
          <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-sm">
             <Link sx={50} sy={30} ex={25} ey={15} color="#A78BFA" />
             <Link sx={50} sy={30} ex={25} ey={45} color="#F87171" />
             <Node x={50} y={30} color="#94a3b8" />
          </svg>
      );
  }
};

export const Editor: React.FC<EditorProps> = ({ data, onSave, onBack }) => {
  const [nodes, setNodes] = useState<MindMapNode[]>(data.nodes);
  const [connections, setConnections] = useState<MindMapConnection[]>(data.connections || []);
  const [title, setTitle] = useState<string>(data.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<string>(data.themeId || DEFAULT_THEME_ID);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(data.layout || 'mindmap');
  const [editingNoteNodeId, setEditingNoteNodeId] = useState<string | null>(null);

  // Connection State
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null); // New hover state

  // Connection Drag State
  const [connectionDrag, setConnectionDrag] = useState<{ sourceId: string; currentPos: Position } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Node Dragging State
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Derived current theme
  const currentTheme = useMemo(() => {
    return THEMES.find(t => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  // Apply theme on mount and change
  useEffect(() => {
    setNodes(prev => applyTheme(prev, currentTheme));
  }, [currentThemeId]);

  // Apply layout on change
  useEffect(() => {
    setNodes(prev => autoLayout(prev, currentLayout));
  }, [currentLayout]);
  
  // Initial layout
  useEffect(() => {
     setNodes(prev => autoLayout(prev, currentLayout));
  }, []);

  // -- Canvas Navigation --

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault(); 
      const scaleAmount = -e.deltaY * 0.001;
      const newScale = Math.min(Math.max(viewport.scale + scaleAmount, 0.1), 3);
      setViewport(prev => ({ ...prev, scale: newScale }));
    } else {
      setViewport(prev => ({ 
        ...prev, 
        x: prev.x - e.deltaX, 
        y: prev.y - e.deltaY 
      }));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('#theme-selector-container') || target.closest('#layout-selector-container') || target.closest('.node-toolbar') || target.closest('.rich-text-editor-container')) {
        return;
    }

    // Check if we clicked on a connection path (which has pointer-events-auto)
    const clickedConnection = target.closest('[data-connection-id]');
    if (clickedConnection) {
        return;
    }

    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      
      // Clear selections
      setSelectedNodeId(null); 
      setEditingNoteNodeId(null);
      setSelectedConnectionId(null);
      setConnectingNodeId(null);
    }
    if (showThemeSelector) setShowThemeSelector(false);
    if (showLayoutSelector) setShowLayoutSelector(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    if (isDraggingNode && draggedNodeId) {
      const dx = (e.clientX - dragStart.x) / viewport.scale;
      const dy = (e.clientY - dragStart.y) / viewport.scale;

      setNodes(prev => prev.map(n => {
        if (n.id === draggedNodeId) {
          return {
            ...n,
            position: { x: n.position.x + dx, y: n.position.y + dy }
          };
        }
        return n;
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }

    if (connectionDrag) {
        setConnectionDrag(prev => prev ? { ...prev, currentPos: { x: e.clientX, y: e.clientY } } : null);
    }
  };

  const handleMouseUp = () => {
    if (connectionDrag) {
        if (hoveredNodeId && hoveredNodeId !== connectionDrag.sourceId) {
             const exists = connections.some(c => 
                (c.sourceId === connectionDrag.sourceId && c.targetId === hoveredNodeId) || 
                (c.sourceId === hoveredNodeId && c.targetId === connectionDrag.sourceId)
            );
            
            const isParentChild = nodes.some(n => 
                (n.id === connectionDrag.sourceId && n.parentId === hoveredNodeId) ||
                (n.id === hoveredNodeId && n.parentId === connectionDrag.sourceId)
            );

            if (!exists && !isParentChild) {
                setConnections(prev => [...prev, {
                    id: generateId(),
                    sourceId: connectionDrag.sourceId,
                    targetId: hoveredNodeId
                }]);
            }
        }
        setConnectionDrag(null);
        setHoveredNodeId(null);
        setConnectingNodeId(null);
    }

    setIsDraggingCanvas(false);
    setIsDraggingNode(false);
    setDraggedNodeId(null);
  };

  // -- Node Management --

  const nodesWithChildren = useMemo(() => {
    const set = new Set<string>();
    nodes.forEach(node => {
      if (node.parentId) set.add(node.parentId);
    });
    return set;
  }, [nodes]);

  const visibleNodes = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const childrenMap = new Map<string, string[]>();
    nodes.forEach(n => {
      if (n.parentId) {
        if (!childrenMap.has(n.parentId)) childrenMap.set(n.parentId, []);
        childrenMap.get(n.parentId)?.push(n.id);
      }
    });

    const result: MindMapNode[] = [];
    const traverse = (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      result.push(node);
      
      if (node.isExpanded !== false) {
        const children = childrenMap.get(nodeId) || [];
        children.forEach(traverse);
      }
    };

    nodes.filter(n => n.parentId === null).forEach(n => traverse(n.id));
    return result;
  }, [nodes]);

  const toggleNodeExpansion = useCallback((id: string) => {
    setNodes(prev => {
        const target = prev.find(n => n.id === id);
        if (!target) return prev;
        
        const isExpanded = target.isExpanded !== false;
        const newExpanded = !isExpanded;
        
        if (!newExpanded && selectedNodeId && selectedNodeId !== id) {
             let curr = prev.find(n => n.id === selectedNodeId);
             let isDescendant = false;
             while (curr && curr.parentId) {
                if (curr.parentId === id) {
                    isDescendant = true;
                    break;
                }
                curr = prev.find(n => n.id === curr!.parentId);
             }
             if (isDescendant) {
                 setSelectedNodeId(id);
             }
        }

        const updatedNodes = prev.map(n => n.id === id ? { ...n, isExpanded: newExpanded } : n);
        return autoLayout(updatedNodes, currentLayout);
    });
  }, [selectedNodeId, currentLayout]);

  const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsDraggingNode(true);
    setDraggedNodeId(id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setSelectedNodeId(id);
    setConnectingNodeId(null);
  };

  const handleConnectionDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnectionDrag({
        sourceId: id,
        currentPos: { x: e.clientX, y: e.clientY }
    });
  };

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
    setSelectedConnectionId(null);
  };

  const addNode = useCallback((parentIdOverride?: string) => {
    const parentId = parentIdOverride || selectedNodeId;
    const newId = generateId();
    
    setNodes(prev => {
        if (!parentId) {
             const centerX = (-viewport.x + (window.innerWidth / 2)) / viewport.scale;
             const centerY = (-viewport.y + (window.innerHeight / 2)) / viewport.scale;
             const newNode: MindMapNode = {
                id: newId,
                parentId: null,
                content: "New Node",
                position: { x: centerX, y: centerY },
                style: { ...DEFAULT_NODE_STYLE, ...currentTheme.rootStyle },
                isExpanded: true
            };
            return autoLayout([...prev, newNode], currentLayout);
        }

        const parentIndex = prev.findIndex(n => n.id === parentId);
        if (parentIndex === -1) return prev;
        const parent = prev[parentIndex];
        
        let updatedNodes = [...prev];
        if (parent.isExpanded === false) {
            updatedNodes[parentIndex] = { ...parent, isExpanded: true };
        }

        const newNode: MindMapNode = {
          id: newId,
          parentId: parent.id,
          content: "Child Node",
          position: { x: parent.position.x + 50, y: parent.position.y + 50 }, 
          style: { ...DEFAULT_NODE_STYLE, ...currentTheme.nodeStyle },
          isExpanded: true
        };

        const newNodesWithNode = [...updatedNodes, newNode];
        const themedNodes = applyTheme(newNodesWithNode, currentTheme);
        return autoLayout(themedNodes, currentLayout);
    });
    setSelectedNodeId(newId);
    setConnectingNodeId(null);
  }, [selectedNodeId, viewport, currentTheme, currentLayout]);

  const addSibling = useCallback(() => {
    if (!selectedNodeId) return;
    const newId = generateId();
    
    setNodes(prev => {
      const selectedNode = prev.find(n => n.id === selectedNodeId);
      if (!selectedNode || !selectedNode.parentId) return prev;

      const parentId = selectedNode.parentId;
      
      const newNode: MindMapNode = {
        id: newId,
        parentId: parentId,
        content: "Sibling Node",
        position: { x: selectedNode.position.x, y: selectedNode.position.y },
        style: { ...DEFAULT_NODE_STYLE, ...currentTheme.nodeStyle },
        isExpanded: true
      };
      
      const themedNodes = applyTheme([...prev, newNode], currentTheme);
      return autoLayout(themedNodes, currentLayout);
    });
    setSelectedNodeId(newId);
    setConnectingNodeId(null);
  }, [selectedNodeId, currentTheme, currentLayout]);

  const updateNodeContent = (id: string, content: string) => {
    setNodes(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, content } : n);
        return autoLayout(updated, currentLayout);
    });
  };

  const updateNodeNote = (id: string, note: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, note } : n));
  };

  const deleteNode = useCallback(() => {
    if (selectedNodeId) {
        const getIdsToDelete = (rootId: string, currentNodes: MindMapNode[]): string[] => {
            const children = currentNodes.filter(n => n.parentId === rootId);
            let ids = [rootId];
            children.forEach(c => {
                ids = [...ids, ...getIdsToDelete(c.id, currentNodes)];
            });
            return ids;
        };

        const idsToDelete = getIdsToDelete(selectedNodeId, nodes);
        
        setConnections(prev => prev.filter(c => !idsToDelete.includes(c.sourceId) && !idsToDelete.includes(c.targetId)));

        setNodes(prev => {
            const remainingNodes = prev.filter(n => !idsToDelete.includes(n.id));
            return autoLayout(remainingNodes, currentLayout);
        });
        setSelectedNodeId(null);
        setEditingNoteNodeId(null);
    } else if (selectedConnectionId) {
        setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
        setSelectedConnectionId(null);
    }
    setConnectingNodeId(null);
  }, [selectedNodeId, selectedConnectionId, nodes, currentLayout]);

  const changeNodeColor = (color: string) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => 
      n.id === selectedNodeId ? { ...n, style: { ...n.style, backgroundColor: color, borderColor: color } } : n
    ));
  };

  const handleConnectionLabel = () => {
    if (!selectedConnectionId) return;
    const conn = connections.find(c => c.id === selectedConnectionId);
    if (!conn) return;

    const newLabel = prompt("Enter connection label:", conn.label || "");
    if (newLabel !== null) {
        setConnections(prev => prev.map(c => 
            c.id === selectedConnectionId ? { ...c, label: newLabel } : c
        ));
    }
  };
  
  // Direct click on label to edit
  const handleLabelClick = (e: React.MouseEvent, id: string, currentLabel: string) => {
     e.stopPropagation();
     const newLabel = prompt("Edit Label:", currentLabel);
     if (newLabel !== null) {
        setConnections(prev => prev.map(c => 
            c.id === id ? { ...c, label: newLabel } : c
        ));
     }
  };

  const handleAutoLayout = () => {
    setNodes(prev => autoLayout(prev, currentLayout));
  };

  const handleExport = () => {
    const exportData: MindMapData = {
        ...data,
        title: title, // Use current title
        nodes: nodes,
        connections: connections,
        themeId: currentThemeId,
        layout: currentLayout,
        updatedAt: new Date().toISOString()
    };
    downloadJson(exportData, `${title.replace(/\s+/g, '_')}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes) {
          setNodes(autoLayout(json.nodes, json.layout || 'mindmap'));
          if (json.title) setTitle(json.title);
          if (json.connections) setConnections(json.connections);
          if (json.themeId) setCurrentThemeId(json.themeId);
          if (json.layout) setCurrentLayout(json.layout);
        }
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
         return;
      }

      if (e.key === 'Tab') {
        e.preventDefault(); 
        if (selectedNodeId) addNode();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedNodeId) addSibling();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
         deleteNode();
      } else if (e.key === ' ') { 
        if (selectedNodeId) {
            e.preventDefault();
            toggleNodeExpansion(selectedNodeId);
        }
      } else if (e.key === 'Escape') {
          setSelectedNodeId(null);
          setEditingNoteNodeId(null);
          setConnectingNodeId(null);
          setSelectedConnectionId(null);
          setConnectionDrag(null);
          setIsEditingTitle(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addNode, addSibling, deleteNode, toggleNodeExpansion, selectedNodeId, selectedConnectionId]);

  const renderConnections = () => {
    return visibleNodes.map(node => {
      if (!node.parentId) return null;
      const parent = visibleNodes.find(n => n.id === node.parentId);
      if (!parent) return null;
      
      const { path, center } = getConnectionPath(parent, node, currentLayout);

      return (
        <g key={`${parent.id}-${node.id}`}>
            <path
              d={path}
              stroke={currentTheme.lineColor}
              strokeWidth="2"
              fill="none"
            />
        </g>
      );
    });
  };

  const renderCrossLinks = () => {
      return connections.map(conn => {
          const source = nodes.find(n => n.id === conn.sourceId);
          const target = nodes.find(n => n.id === conn.targetId);
          
          if (!source || !target) return null;
          const isSourceVisible = visibleNodes.some(n => n.id === source.id);
          const isTargetVisible = visibleNodes.some(n => n.id === target.id);
          
          if (!isSourceVisible || !isTargetVisible) return null;

          const { path, center } = getCrossLinkPath(source, target);
          const isSelected = selectedConnectionId === conn.id;
          const isHovered = hoveredConnectionId === conn.id;

          // Determine color based on state
          // Selected: Blue (#3b82f6)
          // Hovered:  Amber/Orange (#f59e0b) - Distinct change
          // Default:  Slate 500 (#64748b)
          const strokeColor = isSelected ? '#3b82f6' : (isHovered ? '#f59e0b' : '#64748b');
          
          // Determine marker
          let markerUrl = 'url(#arrowhead-manual)';
          if (isSelected) markerUrl = 'url(#arrowhead-selected)';
          else if (isHovered) markerUrl = 'url(#arrowhead-hover)';

          return (
              <g 
                key={conn.id} 
                data-connection-id={conn.id}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedConnectionId(conn.id); 
                }}
                onMouseEnter={() => setHoveredConnectionId(conn.id)}
                onMouseLeave={() => setHoveredConnectionId(null)}
                className="cursor-pointer group pointer-events-auto"
              >
                  {/* Invisible wide stroke for easier clicking */}
                  <path 
                    d={path}
                    stroke="transparent"
                    strokeWidth="20"
                    fill="none"
                    className="pointer-events-auto"
                  />
                  {/* Actual visible line */}
                  <path
                    d={path}
                    stroke={strokeColor}
                    strokeWidth={isSelected || isHovered ? "2.5" : "2"}
                    fill="none"
                    strokeDasharray={isSelected || isHovered ? "none" : "5,5"}
                    markerEnd={markerUrl}
                    className="transition-all duration-200 pointer-events-none"
                  />
                  {/* Label */}
                  {conn.label && (
                      <g 
                        className="pointer-events-auto cursor-text hover:scale-105 transition-transform"
                        onClick={(e) => handleLabelClick(e, conn.id, conn.label!)}
                      >
                          <rect 
                            x={center.x - (conn.label.length * 4) - 4} 
                            y={center.y - 10} 
                            width={(conn.label.length * 8) + 8} 
                            height="20" 
                            rx="4" 
                            fill="white"
                            stroke={strokeColor}
                            strokeWidth="1"
                            className="drop-shadow-sm"
                          />
                          <text 
                            x={center.x} 
                            y={center.y} 
                            dy="4" 
                            textAnchor="middle" 
                            fontSize="12" 
                            fill={strokeColor}
                            className="font-medium select-none"
                          >
                            {conn.label}
                          </text>
                      </g>
                  )}
              </g>
          );
      });
  };
  
  const renderTempConnection = () => {
      if (!connectionDrag) return null;
      const source = nodes.find(n => n.id === connectionDrag.sourceId);
      if (!source) return null;

      const sx = source.position.x;
      const sy = source.position.y;
      
      let ex, ey;

      if (hoveredNodeId && hoveredNodeId !== source.id) {
          const target = nodes.find(n => n.id === hoveredNodeId);
          if (target) {
              ex = target.position.x;
              ey = target.position.y;
          } else {
             ex = (connectionDrag.currentPos.x - viewport.x) / viewport.scale;
             ey = (connectionDrag.currentPos.y - viewport.y) / viewport.scale;
          }
      } else {
          ex = (connectionDrag.currentPos.x - viewport.x) / viewport.scale;
          ey = (connectionDrag.currentPos.y - viewport.y) / viewport.scale;
      }

      const isInvalid = hoveredNodeId === source.id;
      const strokeColor = isInvalid ? '#ef4444' : '#64748b';

      return (
          <g>
            <line 
                x1={sx} y1={sy} x2={ex} y2={ey} 
                stroke={strokeColor} 
                strokeWidth="2" 
                strokeDasharray="5,5"
                markerEnd="url(#arrowhead-manual)"
                className="pointer-events-none opacity-80"
            />
          </g>
      );
  };

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const noteEditingNode = editingNoteNodeId ? nodes.find(n => n.id === editingNoteNodeId) : null;

  const toolbarPos = useMemo(() => {
      if (!selectedNode) return null;
      const screenX = selectedNode.position.x * viewport.scale + viewport.x;
      const screenY = selectedNode.position.y * viewport.scale + viewport.y;
      const nodeHeight = (selectedNode.height || 40) * viewport.scale;
      return { x: screenX, y: screenY - nodeHeight / 2 };
  }, [selectedNode, viewport]);

  const noteEditorPos = useMemo(() => {
      if (!noteEditingNode) return undefined;
      const screenX = noteEditingNode.position.x * viewport.scale + viewport.x;
      const screenY = noteEditingNode.position.y * viewport.scale + viewport.y;
      const nodeWidth = (noteEditingNode.width || 120) * viewport.scale;
      const nodeHeight = (noteEditingNode.height || 40) * viewport.scale;
      return { x: screenX + (nodeWidth / 2) + 20, y: screenY - (nodeHeight / 2) };
  }, [noteEditingNode, viewport]);

  // Context Menu Position for Selected Connection
  const connectionMenuPos = useMemo(() => {
      if (!selectedConnectionId) return null;
      const conn = connections.find(c => c.id === selectedConnectionId);
      if (!conn) return null;
      const source = nodes.find(n => n.id === conn.sourceId);
      const target = nodes.find(n => n.id === conn.targetId);
      if (!source || !target) return null;
      
      const { center } = getCrossLinkPath(source, target);
      return {
          x: center.x * viewport.scale + viewport.x,
          y: center.y * viewport.scale + viewport.y
      };
  }, [selectedConnectionId, connections, nodes, viewport]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 ${connectionDrag ? 'cursor-crosshair' : ''}`}>
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-20 shadow-sm">
         <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Editable Title */}
          {isEditingTitle ? (
              <input 
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => { if(e.key === 'Enter') setIsEditingTitle(false); }}
                  className="font-semibold text-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-blue-500 rounded px-2 py-1 max-w-xs outline-none shadow-sm"
              />
          ) : (
              <div 
                className="flex items-center gap-2 group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors" 
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
              >
                  <h1 className="font-semibold text-lg text-gray-800 dark:text-white truncate max-w-xs select-none">
                      {title}
                  </h1>
                  <Edit size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
          )}

          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Auto-saved</span>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="relative" id="layout-selector-container">
              <button
                onClick={() => setShowLayoutSelector(!showLayoutSelector)}
                className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${showLayoutSelector ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                title="Change Layout"
              >
                <Layout size={20} />
                <span className="hidden sm:inline text-sm font-medium">Layout</span>
              </button>
              {showLayoutSelector && (
                 <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                     <h3 className="font-bold text-gray-900 dark:text-white">Layout</h3>
                      <button onClick={() => setShowLayoutSelector(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"><X size={18} /></button>
                   </div>
                   <div className="p-2">
                     <button onClick={() => { setCurrentLayout('mindmap'); setShowLayoutSelector(false); }} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${currentLayout === 'mindmap' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}><div className="flex items-center gap-3"><Network size={18} />Mind map</div>{currentLayout === 'mindmap' && <Check size={16} />}</button>
                     <button onClick={() => { setCurrentLayout('orgchart'); setShowLayoutSelector(false); }} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${currentLayout === 'orgchart' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}><div className="flex items-center gap-3"><GitFork size={18} className="transform rotate-90" />Org chart</div>{currentLayout === 'orgchart' && <Check size={16} />}</button>
                     <button onClick={() => { setCurrentLayout('list'); setShowLayoutSelector(false); }} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${currentLayout === 'list' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}><div className="flex items-center gap-3"><ListIcon size={18} />List</div>{currentLayout === 'list' && <Check size={16} />}</button>
                   </div>
                 </div>
              )}
            </div>

            <div className="relative" id="theme-selector-container">
                <button 
                    onClick={() => setShowThemeSelector(!showThemeSelector)}
                    className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${showThemeSelector ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                    title="Change Theme"
                >
                    <PaintBucket size={20} />
                    <span className="hidden sm:inline text-sm font-medium">Theme</span>
                </button>
                {showThemeSelector && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white">Themes</h3>
                            <button onClick={() => setShowThemeSelector(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
                            {THEMES.map(theme => (
                                <button key={theme.id} onClick={() => { setCurrentThemeId(theme.id); }} className={`group flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${currentThemeId === theme.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                    <div className="w-full aspect-[4/3] mb-3 rounded border border-gray-100 dark:border-gray-700 overflow-hidden relative" style={{ background: theme.background }}><div className="absolute inset-0 p-2"><ThemePreview themeId={theme.id} /></div></div>
                                    <span className={`text-sm font-medium ${currentThemeId === theme.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300" title="Import JSON">
                <Upload size={20} />
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={handleExport} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300" title="Export JSON">
                <Download size={20} />
            </button>
            <button 
                onClick={() => onSave({...data, title, nodes, connections, themeId: currentThemeId, layout: currentLayout, updatedAt: new Date().toISOString()})} 
                className="bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium ml-2"
            >
                <Save size={16} /> Save
            </button>
        </div>
      </header>

      <div className="flex-grow relative overflow-hidden">
        {/* Connecting Mode Indicator */}
        {connectingNodeId && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce text-sm font-medium">
                Drag the + handles on the selected node to connect
            </div>
        )}

        {/* Toolbar (Left) */}
        <div className="absolute left-4 top-4 z-30 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 gap-1">
          <button onClick={() => addNode()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200" title="Add Child Node (Tab)"><Plus size={20} /></button>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          <button onClick={handleAutoLayout} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200" title="Force Auto Layout"><Layout size={20} /></button>
        </div>

        {/* Note Editor */}
        {noteEditingNode && (
            <div className="rich-text-editor-container">
                 <RichTextEditor 
                    key={noteEditingNode.id}
                    initialContent={noteEditingNode.note || ''}
                    onSave={(content) => updateNodeNote(noteEditingNode.id, content)}
                    onClose={() => setEditingNoteNodeId(null)}
                    position={noteEditorPos}
                 />
            </div>
        )}

        {/* Node Context Toolbar */}
        {selectedNode && toolbarPos && !connectionDrag && (
             <div className="node-toolbar">
                <NodeToolbar 
                    position={toolbarPos}
                    colors={currentTheme.palette}
                    onAddChild={() => addNode()}
                    onAddSibling={() => addSibling()}
                    onDelete={deleteNode}
                    onEdit={() => {}}
                    onColorChange={changeNodeColor}
                    isExpanded={selectedNode.isExpanded}
                    onToggleExpand={() => toggleNodeExpansion(selectedNode.id)}
                    onEditNote={() => setEditingNoteNodeId(selectedNode.id)}
                    hasNote={!!selectedNode.note}
                    onConnect={() => setConnectingNodeId(selectedNode.id)}
                    onConnectionDragStart={() => {}} 
                />
             </div>
        )}

        {/* Connection Context Menu */}
        {selectedConnectionId && connectionMenuPos && (
             <div 
                className="absolute z-50 flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1 gap-1"
                style={{ 
                    left: connectionMenuPos.x, 
                    top: connectionMenuPos.y,
                    transform: 'translate(-50%, -50%)'
                }}
             >
                <button 
                    onClick={handleConnectionLabel} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2" 
                    title="Add/Edit Label"
                >
                    <Tag size={16} />
                </button>
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>
                <button 
                    onClick={deleteNode} 
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors flex items-center gap-2" 
                    title="Delete Connection"
                >
                    <Trash2 size={16} />
                </button>
             </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute right-4 bottom-4 z-30 flex bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
            <button onClick={() => setViewport(v => ({ ...v, scale: v.scale - 0.1 }))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"><Minus size={20} /></button>
            <div className="px-2 py-2 text-sm text-gray-500 font-medium min-w-[3rem] text-center">{Math.round(viewport.scale * 100)}%</div>
            <button onClick={() => setViewport(v => ({ ...v, scale: v.scale + 0.1 }))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"><Plus size={20} /></button>
        </div>

        {/* Canvas */}
        <div 
            ref={canvasRef}
            id="canvas-bg"
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
                background: currentTheme.background,
                backgroundImage: currentTheme.background.startsWith('#') 
                    ? `radial-gradient(circle, ${currentThemeId === 'prism' ? '#ffffff10' : '#00000010'} 1px, transparent 1px)` 
                    : undefined,
                backgroundColor: currentTheme.background.startsWith('#') ? currentTheme.background : undefined,
                backgroundSize: '20px 20px',
            }}
        >
             {!currentTheme.background.startsWith('#') && (
                 <div className="absolute inset-0 pointer-events-none" style={{ background: currentTheme.background, zIndex: -1 }} />
             )}

            <div
                style={{
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                    transformOrigin: '0 0',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}
            >
                <svg className="absolute top-0 left-0 overflow-visible w-full h-full pointer-events-none z-0">
                    <defs>
                        {/* Smaller default arrow */}
                        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill={currentTheme.lineColor} />
                        </marker>
                        
                        {/* Manual Connection Arrow - Neutral */}
                        <marker id="arrowhead-manual" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#64748b" />
                        </marker>
                        
                        {/* Selected Connection Arrow - Blue */}
                        <marker id="arrowhead-selected" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                        </marker>

                         {/* Hover Connection Arrow - Amber */}
                        <marker id="arrowhead-hover" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#f59e0b" />
                        </marker>
                    </defs>
                    {renderConnections()}
                    {renderCrossLinks()}
                    {renderTempConnection()}
                </svg>

                <div className="pointer-events-auto">
                    {visibleNodes.map(node => (
                        <NodeComponent
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            hasChildren={nodesWithChildren.has(node.id)}
                            isConnecting={!!connectionDrag}
                            showHandles={connectingNodeId === node.id}
                            isTarget={hoveredNodeId === node.id && connectionDrag?.sourceId !== node.id}
                            onSelect={handleNodeClick}
                            onDragStart={handleNodeDragStart}
                            onUpdate={updateNodeContent}
                            onToggleExpand={toggleNodeExpansion}
                            onAddChild={addNode}
                            onHover={(id) => setHoveredNodeId(id)}
                            onStartConnect={handleConnectionDragStart}
                        />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
