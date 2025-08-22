import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

// Draggable Action Item Component
const DraggableActionItem = ({ id, name, icon, category }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      type: 'action',
      actionType: id,
      name: name,
      icon: icon
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        glass-effect p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300
        hover:bg-white/20 hover:shadow-lg border-l-4 border-l-blue-500
        ${isDragging ? 'opacity-50 scale-105 rotate-2' : 'hover:scale-105'}
      `}
      whileHover={{ x: 5 }}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-white">{name}</div>
          <div className="text-xs text-gray-400">{category}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Category Section Component
const CategorySection = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        className="flex items-center gap-2 w-full text-left mb-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="text-xl">{icon}</span>
        <span className="font-semibold text-blue-100">{title}</span>
      </button>
      
      {isOpen && (
        <div className="space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Complete Action Categories with All Actions
  const actionCategories = {
    navigation: {
      title: 'Navigation & Page Control',
      icon: '🌐',
      actions: [
        { id: 'navigate', name: 'Navigate to URL', icon: '🌐' },
        { id: 'refresh', name: 'Refresh Page', icon: '🔄' },
        { id: 'back', name: 'Go Back', icon: '⬅️' },
        { id: 'forward', name: 'Go Forward', icon: '➡️' },
        { id: 'new-tab', name: 'Open New Tab', icon: '📑' }
      ]
    },
    waiting: {
      title: 'Wait & Synchronization',
      icon: '⏰',
      actions: [
        { id: 'wait-time', name: 'Wait Fixed Time', icon: '⏰' },
        { id: 'wait-element', name: 'Wait for Element', icon: '👀' },
        { id: 'wait-disappear', name: 'Wait Until Disappears', icon: '👻' },
        { id: 'wait-text', name: 'Wait for Text Content', icon: '📝' },
        { id: 'wait-clickable', name: 'Wait Until Clickable', icon: '🖱️' },
        { id: 'wait-page-load', name: 'Wait for Page Load', icon: '🔄' },
        { id: 'wait-download', name: 'Wait for Download', icon: '📥' }
      ]
    },
    interaction: {
      title: 'User Interactions',
      icon: '🖱️',
      actions: [
        { id: 'click', name: 'Click Element', icon: '🖱️' },
        { id: 'double-click', name: 'Double Click', icon: '⚡' },
        { id: 'right-click', name: 'Right Click', icon: '🖱️' },
        { id: 'hover', name: 'Hover Over Element', icon: '👋' },
        { id: 'scroll', name: 'Scroll Page', icon: '⬆️' },
        { id: 'focus', name: 'Focus Element', icon: '🎯' }
      ]
    },
    input: {
      title: 'Data Input & Forms',
      icon: '⌨️',
      actions: [
        { id: 'type', name: 'Type Text', icon: '⌨️' },
        { id: 'clear-type', name: 'Clear & Type', icon: '🧹' },
        { id: 'select-dropdown', name: 'Select from Dropdown', icon: '📋' },
        { id: 'upload-file', name: 'Upload File', icon: '📤' },
        { id: 'press-key', name: 'Press Key', icon: '⌨️' },
        { id: 'check-checkbox', name: 'Check/Uncheck Box', icon: '☑️' },
        { id: 'radio-select', name: 'Select Radio Button', icon: '🔘' }
      ]
    },
    files: {
      title: 'File Operations',
      icon: '📁',
      actions: [
        { id: 'download-trigger', name: 'Trigger Download', icon: '📥' },
        { id: 'download-verify', name: 'Verify Download', icon: '✅' },
        { id: 'file-monitor', name: 'Monitor File Changes', icon: '🔍' },
        { id: 'cloud-upload', name: 'Upload to Cloud', icon: '☁️' },
        { id: 'file-rename', name: 'Rename File', icon: '📝' },
        { id: 'file-move', name: 'Move File', icon: '🚚' }
      ]
    },
    extraction: {
      title: 'Data Extraction',
      icon: '📊',
      actions: [
        { id: 'extract-text', name: 'Extract Text', icon: '📝' },
        { id: 'extract-table', name: 'Extract Table Data', icon: '📊' },
        { id: 'extract-links', name: 'Extract Links', icon: '🔗' },
        { id: 'extract-images', name: 'Extract Images', icon: '🖼️' },
        { id: 'screenshot', name: 'Take Screenshot', icon: '📸' },
        { id: 'pdf-generate', name: 'Generate PDF', icon: '📄' }
      ]
    },
    control: {
      title: 'Logic & Control Flow',
      icon: '🔀',
      actions: [
        { id: 'condition', name: 'If Condition', icon: '❓' },
        { id: 'loop', name: 'Loop Actions', icon: '🔁' },
        { id: 'try-catch', name: 'Error Handling', icon: '🛡️' },
        { id: 'break', name: 'Break Loop', icon: '🛑' },
        { id: 'variable-set', name: 'Set Variable', icon: '📌' },
        { id: 'variable-get', name: 'Get Variable', icon: '📌' }
      ]
    },
    advanced: {
      title: 'Advanced Operations',
      icon: '🚀',
      actions: [
        { id: 'javascript', name: 'Execute JavaScript', icon: '🔧' },
        { id: 'api-call', name: 'API Request', icon: '🌐' },
        { id: 'database', name: 'Database Query', icon: '💾' },
        { id: 'email', name: 'Send Email', icon: '📧' },
        { id: 'notification', name: 'Send Notification', icon: '🔔' }
      ]
    }
  };

  // Filter actions based on search
  const filteredCategories = Object.entries(actionCategories).reduce((acc, [key, category]) => {
    const filteredActions = category.actions.filter(action =>
      action.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredActions.length > 0) {
      acc[key] = { ...category, actions: filteredActions };
    }
    
    return acc;
  }, {});

  return (
    <div className="w-80 glass-effect border-r border-white/10 p-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Action Library
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions..."
            className="w-full pl-10 pr-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400 focus:outline-none text-white placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Stats */}
        <div className="mt-3 text-xs text-gray-400">
          {Object.values(filteredCategories).reduce((total, cat) => total + cat.actions.length, 0)} actions available
        </div>
      </div>

      {/* Action Categories */}
      <div className="space-y-4">
        {Object.entries(filteredCategories).map(([key, category]) => (
          <CategorySection
            key={key}
            title={category.title}
            icon={category.icon}
          >
            {category.actions.map(action => (
              <DraggableActionItem
                key={action.id}
                id={action.id}
                name={action.name}
                icon={action.icon}
                category={category.title}
              />
            ))}
          </CategorySection>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-8 glass-effect rounded-xl p-4 border border-blue-400/20">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Quick Tips</h3>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Drag actions to the workflow canvas</li>
          <li>• Use Element Picker to find selectors</li>
          <li>• Configure each step in properties panel</li>
          <li>• Test individual steps before running</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
