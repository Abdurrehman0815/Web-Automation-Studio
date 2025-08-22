import React, { useState, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import HelpGuide from './components/HelpGuide';
import { 
  Code, 
  Play, 
  Save, 
  Upload, 
  Crosshair, 
  Zap,
  CheckCircle,
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WorkflowCanvas from './components/WorkflowCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import CodeModal from './components/CodeModal';
import ElementPicker from './components/ElementPicker';
import { useWorkflowStore } from './store/workflowStore';

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 Error caught by boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 Component crashed:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Detailed error logging
    console.group('🐛 Crash Details');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-effect rounded-xl p-8 m-4 text-center border border-red-400/30 bg-red-500/10">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Component Crashed</h3>
          <p className="text-gray-300 text-sm mb-4">
            There was an error during the drag-and-drop operation.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left max-w-2xl mx-auto">
              <summary className="text-xs text-gray-400 cursor-pointer">
                🔍 Error Details
              </summary>
              <pre className="text-xs text-red-300 mt-2 p-2 bg-red-900/20 rounded overflow-auto">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [activeId, setActiveId] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showElementPicker, setShowElementPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState(null);
  
  const { 
    addStep, 
    workflow, 
    clearWorkflow, 
    validateWorkflow,
    exportWorkflow,
    importWorkflow,
    getStats,
    reorderSteps
  } = useWorkflowStore();

  // Enhanced drag handlers with comprehensive error handling
  const handleDragStart = useCallback((event) => {
    try {
      console.log('🚀 Drag started:', event.active.id);
      setActiveId(event.active.id);
      setIsDragging(true);
      setDragError(null);
      document.body.classList.add('dragging');
    } catch (error) {
      console.error('❌ Error in handleDragStart:', error);
      setDragError(error);
      toast.error('Error starting drag operation');
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    try {
      console.log('✅ Drag ended:', event);
      const { active, over } = event;
      
      setActiveId(null);
      setIsDragging(false);
      document.body.classList.remove('dragging');
      
      if (over) {
        const activeIsStep = workflow.some(step => step.id === active.id);
        
        if (activeIsStep) {
          // Reordering existing step
          const oldIndex = workflow.findIndex(step => step.id === active.id);
          const newIndex = workflow.findIndex(step => step.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1) {
            reorderSteps(oldIndex, newIndex);
            toast.success('🔄 Workflow reordered!');
          }
        } else if (over.id === 'workflow-canvas' || over.id === 'drop-zone') {
          // Adding new step
          console.log('🎯 Attempting to add step:', active.id);
          
          const newStep = addStep(active.id);
          
          if (newStep) {
            console.log('✅ Step added successfully:', newStep);
            toast.success(`✨ ${newStep.name} added to workflow!`, {
              icon: '🎉',
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px'
              },
              duration: 3000,
            });
          } else {
            throw new Error('Failed to create step - addStep returned null/undefined');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in handleDragEnd:', error);
      setDragError(error);
      toast.error(`Error in drag operation: ${error.message}`);
      
      // Reset state on error
      setActiveId(null);
      setIsDragging(false);
      document.body.classList.remove('dragging');
    }
  }, [addStep, workflow, reorderSteps]);

  const handleDragCancel = useCallback(() => {
    console.log('⏹️ Drag cancelled');
    setActiveId(null);
    setIsDragging(false);
    document.body.classList.remove('dragging');
  }, []);

  // Button handlers
  const handleGenerateCode = useCallback(() => {
    if (workflow.length === 0) {
      toast.error('Add some actions to your workflow first!', {
        icon: '⚠️',
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fff'
        }
      });
      return;
    }
    setShowCodeModal(true);
  }, [workflow.length]);

  const handleValidateWorkflow = useCallback(() => {
    const validation = validateWorkflow();
    if (validation.isValid) {
      toast.success('✅ Workflow is valid and ready to run!');
    } else {
      toast.error(`❌ Found ${validation.errors.length} errors and ${validation.warnings.length} warnings`);
    }
    
    // Log detailed validation results
    console.log('🔍 Validation Results:', validation);
    return validation;
  }, [validateWorkflow]);

  const handleClearWorkflow = useCallback(() => {
    if (workflow.length === 0) {
      toast.error('Workflow is already empty');
      return;
    }
    
    if (confirm('Are you sure you want to clear the entire workflow?')) {
      clearWorkflow();
      toast.success('🗑️ Workflow cleared');
    }
  }, [workflow.length, clearWorkflow]);

  const handleSaveWorkflow = useCallback(() => {
    try {
      const workflowData = exportWorkflow();
      const dataStr = JSON.stringify(workflowData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `automation-workflow-${Date.now()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('💾 Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    }
  }, [exportWorkflow]);

  const handleLoadWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflowData = JSON.parse(e.target.result);
          const result = importWorkflow(workflowData);
          
          if (result.success) {
            toast.success(`✅ Loaded ${result.imported} steps successfully!`);
          } else {
            toast.error(`❌ Failed to load workflow: ${result.error}`);
          }
        } catch (error) {
          toast.error('Invalid workflow file format');
          console.error('Error loading workflow:', error);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }, [importWorkflow]);

  // Action templates for drag overlay
  const actionTemplates = {
    'navigate': { name: 'Navigate to URL', icon: '🌐' },
    'wait-time': { name: 'Wait Fixed Time', icon: '⏰' },
    'wait-element': { name: 'Wait for Element', icon: '👀' },
    'click': { name: 'Click Element', icon: '🖱️' },
    'type': { name: 'Type Text', icon: '⌨️' },
    'download-verify': { name: 'Verify Download', icon: '📥' },
    'screenshot': { name: 'Take Screenshot', icon: '📸' },
    'extract-text': { name: 'Extract Text', icon: '📝' },
    'double-click': { name: 'Double Click', icon: '⚡' },
    'hover': { name: 'Hover Over Element', icon: '👋' },
    'scroll': { name: 'Scroll Page', icon: '⬆️' },
    'clear-type': { name: 'Clear & Type', icon: '🧹' },
    'select-dropdown': { name: 'Select from Dropdown', icon: '📋' },
    'upload-file': { name: 'Upload File', icon: '📤' },
    'condition': { name: 'If Condition', icon: '❓' },
    'loop': { name: 'Loop Actions', icon: '🔁' },
  };

  // Show error state if there's a critical drag error
  if (dragError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Drag & Drop Error</h2>
          <p className="text-gray-300 mb-4">
            There was an error during the drag operation: {dragError.message}
          </p>
          <button
            onClick={() => {
              setDragError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Reset Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="relative z-10 flex flex-col h-screen">
            {/* Header with Working Buttons */}
            <ErrorBoundary fallback={<div className="h-16 bg-red-500/20 text-red-300 p-4">Header Error</div>}>
              <Header 
                onGenerateCode={handleGenerateCode}
                onOpenElementPicker={() => setShowElementPicker(true)}
                onValidateWorkflow={handleValidateWorkflow}
                onClearWorkflow={handleClearWorkflow}
                onSaveWorkflow={handleSaveWorkflow}
                onLoadWorkflow={handleLoadWorkflow}
              />
            </ErrorBoundary>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
              <ErrorBoundary fallback={<div className="w-80 p-4 text-red-400">Sidebar Error</div>}>
                <Sidebar />
              </ErrorBoundary>

              <div className="flex-1 flex overflow-hidden">
                <ErrorBoundary fallback={<div className="flex-1 p-4 text-red-400">Canvas Error</div>}>
                  <WorkflowCanvas isDragging={isDragging} />
                </ErrorBoundary>
                
                <ErrorBoundary fallback={<div className="w-80 p-4 text-red-400">Properties Error</div>}>
                  <PropertiesPanel />
                </ErrorBoundary>
              </div>
            </div>
          </div>

          {/* Enhanced Drag Overlay */}
          <DragOverlay>
            <AnimatePresence>
              {activeId && (
                <motion.div 
                  className="glass-effect p-4 rounded-xl shadow-2xl border border-blue-400/30"
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ 
                    scale: 1.1, 
                    rotate: 5,
                    boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.5)'
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-blue-400/30">
                      <span className="text-xl">
                        {actionTemplates[activeId]?.icon || '⚡'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {actionTemplates[activeId]?.name || activeId}
                      </div>
                      <div className="text-xs text-blue-300">Dragging...</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DragOverlay>
        </DndContext>

        {/* Enhanced Modals */}
        <AnimatePresence>
          {showCodeModal && (
            <CodeModal onClose={() => setShowCodeModal(false)} />
          )}
          {showElementPicker && (
            <ElementPicker onClose={() => setShowElementPicker(false)} />
          )}
        </AnimatePresence>

        {/* Enhanced Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
