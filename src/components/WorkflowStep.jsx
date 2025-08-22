import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Play, 
  Pause, 
  Copy, 
  Trash2, 
  Settings,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';

import { useWorkflowStore } from '../store/workflowStore';

const WorkflowStep = ({ step, index, totalSteps }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectStep, selectedStep, toggleStep, duplicateStep, removeStep } = useWorkflowStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedStep === step.id;
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;
  
  const getStepDescription = (step) => {
    const config = step.config;
    
    switch (step.type) {
      case 'navigate':
        return config.url ? `Navigate to: ${config.url}` : 'No URL specified';
      case 'wait-time':
        const delayText = config.randomDelay ? 
          `${config.minDelay}-${config.maxDelay}ms (random)` : `${config.duration}ms`;
        return `Wait: ${delayText}`;
      case 'wait-element':
        return `Wait for element: ${config.selector || 'Not specified'}`;
      case 'wait-text':
        return `Wait for text: "${config.expectedText}" in ${config.selector}`;
      case 'click':
        return `Click: ${config.selector || 'No selector specified'}`;
      case 'type':
        return `Type: "${config.text}" → ${config.selector || 'No selector'}`;
      case 'select-dropdown':
        return `Select: "${config.value}" in ${config.selector || 'No selector'}`;
      case 'download-verify':
        return `Verify download: ${config.fileName || 'Any file'} in ${config.downloadPath}`;
      case 'file-monitor':
        return `Monitor folder: ${config.folderPath} for pattern: ${config.pattern}`;
      case 'extract-text':
        return `Extract text from: ${config.selector || 'No selector'} → ${config.saveAs}`;
      case 'screenshot':
        return `Screenshot: ${config.fullPage ? 'Full page' : 'Element'} → ${config.fileName}`;
      default:
        return 'Configure this step';
    }
  };

  const getStepValidation = (step) => {
    const issues = [];
    const config = step.config;
    
    switch (step.type) {
      case 'navigate':
        if (!config.url) issues.push('URL is required');
        break;
      case 'click':
      case 'type':
      case 'wait-element':
        if (!config.selector) issues.push('Element selector is required');
        if (step.type === 'type' && !config.text) issues.push('Text content is required');
        break;
      case 'wait-time':
        if (!config.duration || config.duration < 100) issues.push('Duration must be at least 100ms');
        break;
    }
    
    return issues;
  };

  const validationIssues = getStepValidation(step);
  const hasIssues = validationIssues.length > 0;

  const handleStepClick = (e) => {
    e.stopPropagation();
    selectStep(step.id);
  };

  const getStepStatusColor = () => {
    if (!step.enabled) return 'gray';
    if (hasIssues) return 'red';
    return 'green';
  };

  const statusColor = getStepStatusColor();
  const statusColors = {
    green: {
      border: 'border-l-green-500',
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      icon: CheckCircle2
    },
    red: {
      border: 'border-l-red-500',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      icon: AlertTriangle
    },
    gray: {
      border: 'border-l-gray-500',
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      icon: XCircle
    }
  };

  const currentStatus = statusColors[statusColor];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        workflow-step group relative overflow-hidden
        ${isSelected ? 'ring-2 ring-blue-500 shadow-glow-purple' : ''}
        ${isDragging ? 'opacity-50 scale-105 rotate-1 z-50' : ''}
        ${currentStatus.border}
        ${!step.enabled ? 'opacity-60' : ''}
      `}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleStepClick}
      whileHover={{ y: -2 }}
      {...attributes}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Drag Handle */}
      <div 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-300" />
      </div>

      {/* Step Number Badge */}
      <motion.div 
        className="absolute -left-4 top-6 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg z-10"
        whileHover={{ scale: 1.1 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 300 }}
      >
        {index + 1}
      </motion.div>

      {/* Main Content */}
      <div className="pl-12 pr-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <span className="text-2xl">{step.icon}</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-white group-hover:text-blue-200 transition-colors truncate">
                  {step.name}
                </h3>
                {hasIssues && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Step {index + 1} of {totalSteps}</span>
                <span>•</span>
                <span className="capitalize">{step.category || 'Action'}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <motion.div 
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.bg} ${currentStatus.text} border-current/30`}
            whileHover={{ scale: 1.05 }}
          >
            {React.createElement(currentStatus.icon, { className: "w-3 h-3" })}
            <span>
              {!step.enabled ? 'Disabled' : hasIssues ? 'Needs Config' : 'Ready'}
            </span>
          </motion.div>
        </div>

        {/* Description */}
        <motion.div 
          className="mb-4 pl-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.3 }}
        >
          <p className="text-sm text-gray-300 leading-relaxed">
            {getStepDescription(step)}
          </p>
          
          {/* Validation Issues */}
          {hasIssues && (
            <motion.div 
              className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div className="text-xs text-red-300">
                <strong>Issues to resolve:</strong>
                <ul className="mt-1 space-y-1">
                  {validationIssues.map((issue, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 pl-16"
            >
              <div className="glass-dark rounded-lg p-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 text-white capitalize">{step.type.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <span className="ml-2 text-white">{new Date(step.createdAt).toLocaleDateString()}</span>
                  </div>
                  {step.config.timeout && (
                    <div>
                      <span className="text-gray-400">Timeout:</span>
                      <span className="ml-2 text-white">{step.config.timeout}ms</span>
                    </div>
                  )}
                  {step.config.selector && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Selector:</span>
                      <code className="ml-2 text-cyan-300 bg-black/30 px-2 py-1 rounded text-xs">
                        {step.config.selector}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pl-16">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {/* Toggle Enable/Disable */}
            <motion.button
              className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-1 text-xs ${
                step.enabled 
                  ? 'hover:bg-orange-500/20 text-orange-400 hover:text-orange-300' 
                  : 'hover:bg-green-500/20 text-green-400 hover:text-green-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleStep(step.id);
              }}
              title={step.enabled ? 'Disable step' : 'Enable step'}
            >
              {step.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{step.enabled ? 'Disable' : 'Enable'}</span>
            </motion.button>

            {/* Duplicate */}
            <motion.button
              className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-300 flex items-center gap-1 text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                duplicateStep(step.id);
              }}
              title="Duplicate step"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate</span>
            </motion.button>

            {/* Delete */}
            <motion.button
              className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center gap-1 text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation(); // Prevents parent click events
                if (window.confirm(`Are you sure you want to delete "${step.name}"?`)) {
                  removeStep(step.id); // Call store function with step ID
                }
              }}
              title="Delete step"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </motion.button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Expand/Collapse */}
            <motion.button
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
              <span>{isExpanded ? 'Less' : 'More'}</span>
            </motion.button>

            {/* Configure Button */}
            <motion.button
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                ${isSelected 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-glow' 
                  : 'hover:bg-white/10 text-gray-300 hover:text-white border border-transparent hover:border-white/20'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStepClick}
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Selection Glow Effect */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Drag Preview Effect */}
      {isDragging && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl pointer-events-none border-2 border-blue-400"
          initial={{ scale: 1 }}
          animate={{ scale: 1.02 }}
        />
      )}

      {/* Step Connection Point */}
      {!isLast && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default WorkflowStep;
