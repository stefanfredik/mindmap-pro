
import React, { useRef, useEffect, useState } from 'react';
import { MindMapNode } from '../types';
import { GripVertical, Plus, Minus, FileText } from 'lucide-react';

interface NodeComponentProps {
  node: MindMapNode;
  isSelected: boolean;
  hasChildren: boolean;
  isConnecting?: boolean; // Is the global app in connecting mode?
  showHandles?: boolean; // Show the 4 directional connection handles?
  isTarget?: boolean; // Is this node the potential target?
  onSelect: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onUpdate: (id: string, content: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (id: string, side?: 'left' | 'right') => void;
  onHover: (id: string | null) => void;
  onStartConnect: (e: React.MouseEvent, id: string) => void; // New prop to start connection from handles
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  hasChildren,
  isConnecting,
  showHandles,
  isTarget,
  onSelect,
  onDragStart,
  onUpdate,
  onToggleExpand,
  onAddChild,
  onHover,
  onStartConnect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Reset height and grow
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
      inputRef.current.select();
    }
  }, [isEditing]);

  // Exit edit mode if the node is no longer selected
  useEffect(() => {
    if (!isSelected) {
      setIsEditing(false);
    }
  }, [isSelected]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.id);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(node.id, e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild(node.id);
  }

  // Render a single connection handle
  const renderHandle = (positionClass: string) => (
    <div 
        className={`absolute w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center cursor-crosshair z-30 shadow-sm border-2 border-white dark:border-gray-800 transition-transform hover:scale-110 ${positionClass}`}
        onMouseDown={(e) => {
            e.stopPropagation();
            onStartConnect(e, node.id);
        }}
    >
        <Plus size={14} strokeWidth={3} />
    </div>
  );

  const isRoot = !node.parentId;
  // Determine if node is on the left side of the tree
  const isLeft = node.layoutSide === 'left';

  return (
    <div
      ref={nodeRef}
      className={`absolute transition-all duration-300 ease-in-out group flex items-center justify-center`}
      style={{
        left: node.position.x,
        top: node.position.y,
        backgroundColor: node.style.backgroundColor,
        color: node.style.color,
        borderRadius: node.style.borderRadius,
        border: `${node.style.borderWidth || 0}px solid ${isTarget ? '#22c55e' : (node.style.borderColor || 'transparent')}`,
        width: node.width ? `${node.width}px` : 'auto',
        height: node.height ? `${node.height}px` : 'auto',
        minWidth: '120px',
        maxWidth: '300px',
        transform: `translate(-50%, -50%) ${isTarget ? 'scale(1.05)' : ''}`, // Center anchor + scale effect
        zIndex: isSelected || isTarget || showHandles ? 20 : 10,
        boxShadow: (isSelected || isTarget) 
            ? `0 0 0 ${isTarget ? '4px' : '2px'} ${isTarget ? '#22c55e' : '#3b82f6'}, 0 4px 6px -1px rgba(0, 0, 0, 0.1)` 
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Drag Grip - Swaps side based on layout */}
      <div 
        className={`cursor-move p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity absolute ${isLeft ? '-right-6' : '-left-6'}`}
        onMouseDown={(e) => onDragStart(e, node.id)}
      >
        <GripVertical size={16} />
      </div>

      <div className="p-3 w-full h-full flex items-center justify-center relative">
        {/* Note Indicator */}
        {node.note && (
            <div className="absolute top-1 right-2 text-blue-500 opacity-80" title="Has Note">
                 <FileText size={12} fill="currentColor" />
            </div>
        )}

        {isEditing ? (
          <textarea
            ref={inputRef}
            value={node.content}
            onChange={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent outline-none resize-none overflow-hidden text-center"
            style={{ 
              color: node.style.color,
              fontSize: node.style.fontSize,
              lineHeight: '1.5',
            }}
          />
        ) : (
          <div 
            className="whitespace-pre-wrap break-words text-center select-none w-full"
             style={{ 
               fontSize: node.style.fontSize,
               lineHeight: '1.5'
             }}
          >
            {node.content}
          </div>
        )}
      </div>

      {/* Collapse/Expand Button - Position depends on layoutSide */}
      {hasChildren && (
        <button
          onClick={handleToggle}
          className={`absolute ${isLeft ? '-left-3' : '-right-3'} top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full shadow border border-gray-300 dark:border-gray-600 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary z-20 transition-transform hover:scale-110`}
          title={node.isExpanded !== false ? "Collapse" : "Expand"}
        >
           {node.isExpanded !== false ? <Minus size={10} /> : <Plus size={10} />}
        </button>
      )}

      {/* Connection Handles (Visible when showHandles is true) */}
      {showHandles && !isConnecting && (
        <>
            {renderHandle("-top-3 left-1/2 -translate-x-1/2")}    {/* Top */}
            {renderHandle("-bottom-3 left-1/2 -translate-x-1/2")} {/* Bottom */}
            {renderHandle("-left-3 top-1/2 -translate-y-1/2")}    {/* Left */}
            {renderHandle("-right-3 top-1/2 -translate-y-1/2")}   {/* Right */}
        </>
      )}

      {/* Add Child Buttons */}
      {isSelected && !isConnecting && !showHandles && (
        <>
            {isRoot ? (
                // Root Node: Show Left and Right Add Buttons
                <>
                    <button 
                        className="absolute top-1/2 -right-8 transform -translate-y-1/2 z-30 flex items-center justify-center w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-transform hover:scale-110 border-2 border-white dark:border-gray-800"
                        onClick={(e) => { e.stopPropagation(); onAddChild(node.id, 'right'); }}
                        title="Add Child (Right)"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                    <button 
                        className="absolute top-1/2 -left-8 transform -translate-y-1/2 z-30 flex items-center justify-center w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-transform hover:scale-110 border-2 border-white dark:border-gray-800"
                        onClick={(e) => { e.stopPropagation(); onAddChild(node.id, 'left'); }}
                        title="Add Child (Left)"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </>
            ) : (
                // Normal Node: Show Bottom Add Button
                <button 
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-transform hover:scale-110 border-2 border-white dark:border-gray-800"
                    onClick={handleAddChild}
                    title="Add Child Node"
                >
                    <Plus size={14} strokeWidth={3} />
                </button>
            )}
        </>
      )}
    </div>
  );
};
