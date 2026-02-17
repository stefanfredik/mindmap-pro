
import React, { useEffect, useRef } from 'react';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Link as LinkIcon, X, RemoveFormatting 
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
  position?: { x: number, y: number };
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialContent, 
  onSave, 
  onClose,
  position 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Initialize content on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = initialContent;
      
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      contentRef.current.focus();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const exec = (command: string, value: string | undefined = undefined) => {
    // Execute command on the document
    document.execCommand(command, false, value);
    // Sync state
    if (contentRef.current) {
        onSave(contentRef.current.innerHTML);
        // Ensure focus remains
        contentRef.current.focus();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Save content on every keystroke
    const newHtml = e.currentTarget.innerHTML;
    onSave(newHtml);
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
        exec('createLink', url);
    }
  };

  const style = position 
    ? { left: position.x, top: position.y } 
    : { right: '20px', top: '80px' };

  return (
    <div 
      className="absolute z-50 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={style}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex gap-1 flex-wrap">
          <ToolbarBtn onAction={() => exec('bold')} icon={<Bold size={16} />} title="Bold" />
          <ToolbarBtn onAction={() => exec('italic')} icon={<Italic size={16} />} title="Italic" />
          <ToolbarBtn onAction={() => exec('strikeThrough')} icon={<Strikethrough size={16} />} title="Strikethrough" />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          <ToolbarBtn onAction={() => exec('formatBlock', 'H1')} icon={<Heading1 size={16} />} title="Heading 1" />
          <ToolbarBtn onAction={() => exec('formatBlock', 'H2')} icon={<Heading2 size={16} />} title="Heading 2" />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          <ToolbarBtn onAction={() => exec('insertUnorderedList')} icon={<List size={16} />} title="Bullet List" />
          <ToolbarBtn onAction={() => exec('insertOrderedList')} icon={<ListOrdered size={16} />} title="Numbered List" />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          <ToolbarBtn onAction={addLink} icon={<LinkIcon size={16} />} title="Link" />
          <ToolbarBtn onAction={() => exec('removeFormat')} icon={<RemoveFormatting size={16} />} title="Clear Formatting" />
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Editor Area */}
      <div 
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        className="flex-grow p-4 outline-none min-h-[200px] max-h-[400px] overflow-y-auto text-gray-800 dark:text-gray-200 prose dark:prose-invert prose-sm max-w-none"
        style={{ whiteSpace: 'pre-wrap' }}
        onKeyDown={(e) => e.stopPropagation()} // Prevent triggering map shortcuts
      />
      
      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 flex justify-between">
         <span>Supports Markdown-like shortcuts</span>
         <span>Editor</span>
      </div>
    </div>
  );
};

const ToolbarBtn: React.FC<{ onAction: () => void; icon: React.ReactNode; title: string }> = ({ onAction, icon, title }) => (
  <button 
    onMouseDown={(e) => {
        // Prevent default to keep focus in the editor
        e.preventDefault();
        onAction();
    }}
    className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
    title={title}
  >
    {icon}
  </button>
);
