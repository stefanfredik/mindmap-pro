
import React, { useState } from 'react';
import { 
  Trash2, Edit2, Palette, ChevronDown, ChevronUp, Copy, CornerDownRight, FileText, Link as LinkIcon 
} from 'lucide-react';

interface NodeToolbarProps {
  position: { x: number; y: number };
  colors: string[];
  onAddChild: () => void;
  onAddSibling: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onColorChange: (color: string) => void;
  isExpanded?: boolean;
  onToggleExpand: () => void;
  onEditNote: () => void;
  hasNote?: boolean;
  onConnect: () => void;
  onConnectionDragStart: (e: React.MouseEvent) => void;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({
  position, colors, onAddChild, onAddSibling, onDelete, onEdit, onColorChange, isExpanded, onToggleExpand, onEditNote, hasNote, onConnect, onConnectionDragStart
}) => {
  const [showColors, setShowColors] = useState(false);

  return (
    <div 
      className="absolute z-50 flex flex-col items-center gap-2 pointer-events-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)',
        marginTop: '-16px' // Visual offset above the node
      }}
    >
        {/* Main Toolbar */}
        <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-1.5 flex items-center gap-1 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
             <button onClick={onAddChild} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors" title="Add Child (Tab)">
                <CornerDownRight size={18} />
             </button>
             <button onClick={onAddSibling} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors" title="Add Sibling (Enter)">
                <Copy size={18} />
             </button>
             <button 
                onClick={onConnect} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors" 
                title="Toggle Connection Mode"
             >
                <LinkIcon size={18} />
             </button>
             <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
             <button onClick={onEdit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors" title="Edit Text">
                <Edit2 size={18} />
             </button>
             <button 
                onClick={onEditNote} 
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${hasNote ? 'text-blue-500' : 'text-gray-700 dark:text-gray-200'}`} 
                title={hasNote ? "Edit Note" : "Add Note"}
             >
                <FileText size={18} fill={hasNote ? "currentColor" : "none"} className={hasNote ? "text-blue-500 opacity-50" : ""} />
             </button>
             <button onClick={() => setShowColors(!showColors)} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${showColors ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`} title="Change Color">
                <Palette size={18} />
             </button>
             <button onClick={onToggleExpand} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors" title={isExpanded !== false ? "Collapse" : "Expand"}>
                {isExpanded !== false ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
             </button>
             <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
             <button onClick={onDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors" title="Delete Node">
                <Trash2 size={18} />
             </button>
        </div>

        {/* Color Picker Popover */}
        {showColors && (
            <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                {colors.map(color => (
                    <button
                        key={color}
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm hover:scale-110 transition-transform ring-offset-2 hover:ring-2 ring-blue-400"
                        style={{ backgroundColor: color }}
                        onClick={() => { onColorChange(color); setShowColors(false); }}
                    />
                ))}
            </div>
        )}
    </div>
  );
};
