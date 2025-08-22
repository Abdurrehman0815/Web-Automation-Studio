import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Zap, AlertCircle, Sparkles, Target } from 'lucide-react';

import WorkflowStep from './WorkflowStep';
import { useWorkflowStore } from '../store/workflowStore';

const EmptyState = ({ isDragging }) => (
  <motion.div 
    className={`flex flex-col items-center justify-center h-full text-center p-8 transition-all duration-300 ${
      isDragging ? 'scale-105 opacity-80' : ''
    }`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: isDragging ? 1.05 : 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <motion.div
      className="relative mb-6"
      animate={{ 
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
        <Zap className="w-16 h-16 text-blue-400" />
      </div>
      <motion.div 
        className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360] 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Plus className="w-5 h-5 text-white" />
      </motion.div>
    </motion.div>
    
    <motion.h3 
      className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      Build Your Automation Workflow
    </motion.h3>
    
    <p className="text-gray-300 mb-6 max-w-lg text-lg leading-relaxed">
      Drag actions from the sidebar to create powerful web automation workflows. 
      Start with navigation, add interactions, and automate complex tasks.
    </p>
    
    <div className="flex items-center gap-4 text-sm">
      <motion.div 
        className="flex items-center gap-2 text-blue-300 px-4 py-2 glass-effect rounded-lg"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <Target className="w-4 h-4" />
        <span>Drag actions here</span>
      </motion.div>
      
      <motion.div 
        className="flex items-center gap-2 text-purple-300 px-4 py-2 glass-effect rounded-lg"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-4 h-4" />
        <span>Professional automation</span>
      </motion.div>
    </div>
  </motion.div>
);

const WorkflowCanvas = ({ isDragging }) => {
  const { workflow } = useWorkflowStore();
  const { isOver, setNodeRef } = useDroppable({
    id: 'workflow-canvas',
  });

  return (
    <div className="flex-1 p-6 overflow-hidden">
      {/* Enhanced Canvas Header */}
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Workflow Designer
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            {workflow.length === 0 
              ? 'Ready to build your first automation workflow' 
              : `${workflow.length} step${workflow.length !== 1 ? 's' : ''} configured • ${workflow.filter(s => s.enabled).length} active`
            }
          </p>
        </div>
        
        {workflow.length > 0 && (
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-sm glass-effect px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-medium">Workflow Ready</span>
            </div>
            <div className="text-xs text-gray-400">
              Drag to reorder • Click to configure
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Drop Zone */}
      <motion.div
        ref={setNodeRef}
        className={`
          h-[calc(100%-100px)] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-y-auto custom-scrollbar
          ${isOver || isDragging
            ? 'border-green-500/60 bg-green-500/10 shadow-xl shadow-green-500/20' 
            : 'border-white/20 hover:border-blue-400/40 hover:bg-blue-500/5'
          }
        `}
        animate={{
          scale: isOver ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {workflow.length === 0 ? (
          <EmptyState isDragging={isDragging} />
        ) : (
          <div className="p-6">
            <SortableContext 
              items={workflow.map(step => step.id)} 
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {workflow.map((step, index) => (
                  <motion.div
                    key={step.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      layout: { duration: 0.3 }
                    }}
                  >
                    <WorkflowStep 
                      step={step} 
                      index={index}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
            
            {/* Enhanced Add More Indicator */}
            <motion.div
              className={`
                mt-6 p-8 text-center rounded-xl border-2 border-dashed transition-all duration-300
                ${isOver || isDragging
                  ? 'border-green-500/60 bg-green-500/10' 
                  : 'border-white/10 hover:border-blue-400/30 hover:bg-blue-500/5'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * workflow.length }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ 
                  scale: isDragging ? [1, 1.1, 1] : 1,
                  rotate: isDragging ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
              >
                <Plus className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              </motion.div>
              <p className="text-gray-300 font-medium">
                {isDragging ? 'Drop here to add more actions' : 'Drag actions here to extend your workflow'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Build complex automations by chaining multiple actions
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WorkflowCanvas;
