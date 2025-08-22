import { create } from 'zustand';
import { nanoid } from 'nanoid';

const actionTemplates = {
  'navigate': {
    name: 'Navigate to URL',
    icon: '🌐',
    config: { url: '', waitForLoad: true, timeout: 30000 }
  },
  'wait-time': {
    name: 'Wait Fixed Time',
    icon: '⏰',
    config: { duration: 2000, randomDelay: false, minDelay: 1000, maxDelay: 3000 }
  },
  'wait-element': {
    name: 'Wait for Element',
    icon: '👀',
    config: { selector: '', timeout: 30000, condition: 'visible' }
  },
  'wait-disappear': {
    name: 'Wait Until Disappears',
    icon: '👻',
    config: { selector: '', timeout: 30000 }
  },
  'wait-text': {
    name: 'Wait for Text Content',
    icon: '📝',
    config: { selector: '', expectedText: '', timeout: 30000, exact: false }
  },
  'wait-clickable': {
    name: 'Wait Until Clickable',
    icon: '🖱️',
    config: { selector: '', timeout: 30000 }
  },
  'wait-page-load': {
    name: 'Wait for Page Load',
    icon: '🔄',
    config: { timeout: 30000, waitFor: 'networkidle' }
  },
  'click': {
    name: 'Click Element',
    icon: '🖱️',
    config: { selector: '', timeout: 10000, waitForElement: true, scrollToElement: true }
  },
  'double-click': {
    name: 'Double Click',
    icon: '⚡',
    config: { selector: '', timeout: 10000, delay: 100 }
  },
  'right-click': {
    name: 'Right Click',
    icon: '🖱️',
    config: { selector: '', timeout: 10000 }
  },
  'hover': {
    name: 'Hover Over Element',
    icon: '👋',
    config: { selector: '', timeout: 10000, duration: 1000 }
  },
  'scroll': {
    name: 'Scroll Page',
    icon: '⬆️',
    config: { direction: 'down', amount: 500, smooth: true, element: 'page' }
  },
  'type': {
    name: 'Type Text',
    icon: '⌨️',
    config: { selector: '', text: '', speed: 50, clearFirst: false }
  },
  'clear-type': {
    name: 'Clear & Type',
    icon: '🧹',
    config: { selector: '', text: '', speed: 50 }
  },
  'select-dropdown': {
    name: 'Select from Dropdown',
    icon: '📋',
    config: { selector: '', value: '', byValue: true, searchable: false }
  },
  'upload-file': {
    name: 'Upload File',
    icon: '📤',
    config: { selector: '', filePath: '', multiple: false }
  },
  'press-key': {
    name: 'Press Key',
    icon: '⌨️',
    config: { key: 'Enter', modifiers: [] }
  },
  'check-checkbox': {
    name: 'Check/Uncheck Box',
    icon: '☑️',
    config: { selector: '', action: 'check' }
  },
  'radio-select': {
    name: 'Select Radio Button',
    icon: '🔘',
    config: { selector: '', value: '' }
  },
  'download-trigger': {
    name: 'Trigger Download',
    icon: '📥',
    config: { downloadPath: './downloads', selector: '', timeout: 60000 }
  },
  'download-verify': {
    name: 'Verify Download',
    icon: '✅',
    config: { downloadPath: './downloads', fileName: '', timeout: 60000, fileSize: 0, checkContent: false }
  },
  'file-monitor': {
    name: 'Monitor File Changes',
    icon: '🔍',
    config: { folderPath: './downloads', pattern: '*', timeout: 60000, action: 'newest' }
  },
  'cloud-upload': {
    name: 'Upload to Cloud',
    icon: '☁️',
    config: { provider: 'onedrive', localPath: '', remotePath: '', overwrite: false }
  },
  'extract-text': {
    name: 'Extract Text',
    icon: '📝',
    config: { selector: '', attribute: 'text', saveAs: 'variable1' }
  },
  'extract-table': {
    name: 'Extract Table Data',
    icon: '📊',
    config: { selector: 'table', includeHeaders: true, saveAs: 'tableData' }
  },
  'extract-links': {
    name: 'Extract Links',
    icon: '🔗',
    config: { selector: 'a', attribute: 'href', saveAs: 'links' }
  },
  'screenshot': {
    name: 'Take Screenshot',
    icon: '📸',
    config: { fileName: 'screenshot_{timestamp}.png', fullPage: true, selector: '' }
  },
  'condition': {
    name: 'If Condition',
    icon: '❓',
    config: { type: 'elementExists', selector: '', value: '', operator: 'equals', thenAction: 'continue', elseAction: 'skip' }
  },
  'loop': {
    name: 'Loop Actions',
    icon: '🔁',
    config: { type: 'count', count: 1, maxIterations: 100, breakCondition: '' }
  },
  'try-catch': {
    name: 'Error Handling',
    icon: '🛡️',
    config: { continueOnError: true, logErrors: true, fallbackAction: 'skip' }
  },
  'refresh': {
    name: 'Refresh Page',
    icon: '🔄',
    config: { timeout: 10000 }
  },
  'back': {
    name: 'Go Back',
    icon: '⬅️',
    config: { timeout: 5000 }
  },
  'forward': {
    name: 'Go Forward',
    icon: '➡️',
    config: { timeout: 5000 }
  },
  'javascript': {
    name: 'Execute JavaScript',
    icon: '🔧',
    config: { code: '', returnValue: false, saveAs: 'jsResult' }
  },
  'api-call': {
    name: 'API Request',
    icon: '🌐',
    config: { url: '', method: 'GET', headers: {}, body: '', saveAs: 'apiResponse' }
  },
  'notification': {
    name: 'Send Notification',
    icon: '🔔',
    config: { title: '', message: '', type: 'info' }
  },
  // Add these missing action templates to workflowStore.js actionTemplates object:

  'new-tab': {
    name: 'Open New Tab',
    icon: '📑',
    config: { url: '', switchToTab: true, timeout: 10000 }
  },
  'wait-download': {
    name: 'Wait for Download',
    icon: '📥',
    config: { downloadPath: './downloads', timeout: 60000, fileName: '', exactMatch: false }
  },
  'focus': {
    name: 'Focus Element',
    icon: '🎯',
    config: { selector: '', timeout: 10000, scrollIntoView: true }
  },
  'file-rename': {
    name: 'Rename File',
    icon: '📝',
    config: { currentPath: '', newPath: '', overwrite: false }
  },
  'file-move': {
    name: 'Move File',
    icon: '🚚',
    config: { sourcePath: '', destinationPath: '', createDirectories: true, overwrite: false }
  },
  'extract-images': {
    name: 'Extract Images',
    icon: '🖼️',
    config: { selector: 'img', attribute: 'src', saveAs: 'images', downloadImages: false, downloadPath: './images' }
  },
  'pdf-generate': {
    name: 'Generate PDF',
    icon: '📄',
    config: { fileName: 'document_{timestamp}.pdf', fullPage: true, quality: 80, landscape: false, margins: { top: '20px', right: '20px', bottom: '20px', left: '20px' } }
  },
  'break': {
    name: 'Break Loop',
    icon: '🛑',
    config: { condition: '', immediate: true }
  },
  'variable-set': {
    name: 'Set Variable',
    icon: '📌',
    config: { name: '', value: '', type: 'string' }
  },
  'variable-get': {
    name: 'Get Variable',
    icon: '📌',
    config: { name: '', saveAs: '', defaultValue: '' }
  },
  'database': {
    name: 'Database Query',
    icon: '💾',
    config: { connectionString: '', query: '', parameters: {}, saveAs: 'dbResult' }
  },
  'email': {
    name: 'Send Email',
    icon: '📧',
    config: { to: '', subject: '', message: '', attachments: '', provider: 'smtp', smtpSettings: {} }
  }
};

export const useWorkflowStore = create((set, get) => ({
  workflow: [],
  selectedStep: null,
  
  // Add step with comprehensive error handling
  addStep: (actionType) => {
    try {
      console.log('📝 Adding step:', actionType);
      
      const template = actionTemplates[actionType];
      if (!template) {
        console.error('❌ Unknown action type:', actionType);
        throw new Error(`Unknown action type: ${actionType}`);
      }
      
      const newStep = {
        id: nanoid(),
        type: actionType,
        name: template.name,
        icon: template.icon,
        config: { ...template.config },
        enabled: true,
        order: get().workflow.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('✅ Created step:', newStep);
      
      set(state => ({
        workflow: [...state.workflow, newStep],
        selectedStep: newStep.id
      }));
      
      return newStep;
    } catch (error) {
      console.error('❌ Error in addStep:', error);
      throw error;
    }
  },
  
  // Update step configuration
  updateStep: (stepId, updates) => {
    set(state => ({
      workflow: state.workflow.map(step => 
        step.id === stepId ? { 
          ...step, 
          ...updates, 
          updatedAt: new Date().toISOString() 
        } : step
      )
    }));
  },
  
  // Remove step from workflow
  removeStep: (stepId) => {
    set(state => ({
      workflow: state.workflow.filter(step => step.id !== stepId),
      selectedStep: state.selectedStep === stepId ? null : state.selectedStep
    }));
  },
  
  // Select step for editing
  selectStep: (stepId) => {
    const exists = get().workflow.some(step => step.id === stepId);
    set({ selectedStep: exists ? stepId : null });
  },
  
  // Reorder steps in workflow
  reorderSteps: (oldIndex, newIndex) => {
    const state = get();
    if (oldIndex < 0 || newIndex < 0 || oldIndex >= state.workflow.length || newIndex >= state.workflow.length) {
      return;
    }
    
    const newWorkflow = [...state.workflow];
    const [removed] = newWorkflow.splice(oldIndex, 1);
    newWorkflow.splice(newIndex, 0, removed);
    
    // Update order property
    newWorkflow.forEach((step, index) => {
      step.order = index;
      step.updatedAt = new Date().toISOString();
    });
    
    set({ workflow: newWorkflow });
  },
  
  // Toggle step enabled/disabled
  toggleStep: (stepId) => {
    set(state => ({
      workflow: state.workflow.map(step =>
        step.id === stepId ? { 
          ...step, 
          enabled: !step.enabled, 
          updatedAt: new Date().toISOString() 
        } : step
      )
    }));
  },
  
  // Duplicate existing step
  duplicateStep: (stepId) => {
    const step = get().workflow.find(s => s.id === stepId);
    if (!step) return null;
    
    const duplicatedStep = {
      ...step,
      id: nanoid(),
      name: step.name + ' (Copy)',
      order: get().workflow.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set(state => ({
      workflow: [...state.workflow, duplicatedStep],
      selectedStep: duplicatedStep.id
    }));
    
    return duplicatedStep;
  },
  
  // Clear entire workflow
  clearWorkflow: () => {
    set({ 
      workflow: [], 
      selectedStep: null 
    });
  },
  
  // Bulk operations
  enableAllSteps: () => {
    set(state => ({
      workflow: state.workflow.map(step => ({
        ...step,
        enabled: true,
        updatedAt: new Date().toISOString()
      }))
    }));
  },
  
  disableAllSteps: () => {
    set(state => ({
      workflow: state.workflow.map(step => ({
        ...step,
        enabled: false,
        updatedAt: new Date().toISOString()
      }))
    }));
  },
  
  // Workflow validation with comprehensive checks
  validateWorkflow: () => {
    const workflow = get().workflow;
    const errors = [];
    const warnings = [];
    
    if (workflow.length === 0) {
      errors.push('Workflow is empty');
      return { errors, warnings, isValid: false };
    }
    
    workflow.forEach((step, index) => {
      const stepNum = index + 1;
      
      // Check if step is disabled
      if (!step.enabled) {
        warnings.push(`Step ${stepNum}: "${step.name}" is disabled`);
      }
      
      // Validate step configuration based on type
      const config = step.config;
      
      switch (step.type) {
        case 'navigate':
          if (!config.url) {
            errors.push(`Step ${stepNum}: Navigation URL is required`);
          } else if (!config.url.startsWith('http')) {
            errors.push(`Step ${stepNum}: URL must start with http:// or https://`);
          }
          break;
          
        case 'click':
        case 'double-click':
        case 'hover':
        case 'wait-element':
        case 'wait-disappear':
        case 'wait-clickable':
        case 'extract-text':
          if (!config.selector) {
            errors.push(`Step ${stepNum}: Element selector is required`);
          }
          break;
          
        case 'type':
        case 'clear-type':
          if (!config.selector) {
            errors.push(`Step ${stepNum}: Element selector is required`);
          }
          if (!config.text) {
            warnings.push(`Step ${stepNum}: No text specified for typing`);
          }
          break;
          
        case 'select-dropdown':
          if (!config.selector) {
            errors.push(`Step ${stepNum}: Element selector is required`);
          }
          if (!config.value) {
            warnings.push(`Step ${stepNum}: No value specified for selection`);
          }
          break;
          
        case 'wait-time':
          if (!config.duration || config.duration < 100) {
            errors.push(`Step ${stepNum}: Wait duration must be at least 100ms`);
          }
          if (config.randomDelay && (config.minDelay >= config.maxDelay)) {
            errors.push(`Step ${stepNum}: Min delay must be less than max delay`);
          }
          break;
          
        case 'wait-text':
          if (!config.selector || !config.expectedText) {
            errors.push(`Step ${stepNum}: Both selector and expected text are required`);
          }
          break;
          
        case 'download-verify':
        case 'download-trigger':
          if (!config.downloadPath) {
            errors.push(`Step ${stepNum}: Download path is required`);
          }
          break;
          
        case 'upload-file':
          if (!config.selector) {
            errors.push(`Step ${stepNum}: File input selector is required`);
          }
          if (!config.filePath) {
            errors.push(`Step ${stepNum}: File path is required`);
          }
          break;
          
        case 'condition':
          if (!config.selector && config.type === 'elementExists') {
            errors.push(`Step ${stepNum}: Condition selector is required`);
          }
          break;
          
        case 'loop':
          if (!config.count || config.count < 1) {
            errors.push(`Step ${stepNum}: Loop count must be at least 1`);
          }
          if (config.count > config.maxIterations) {
            warnings.push(`Step ${stepNum}: Loop count exceeds max iterations`);
          }
          break;
          
        case 'api-call':
          if (!config.url) {
            errors.push(`Step ${stepNum}: API URL is required`);
          }
          break;
          
        case 'javascript':
          if (!config.code) {
            warnings.push(`Step ${stepNum}: No JavaScript code specified`);
          }
          break;
          
        default:
          // No validation needed for other step types
          break;
      }
    });
    
    return {
      errors,
      warnings,
      isValid: errors.length === 0,
      totalSteps: workflow.length,
      enabledSteps: workflow.filter(s => s.enabled).length
    };
  },
  
  // Export workflow with metadata
  exportWorkflow: () => {
    const workflow = get().workflow;
    const stats = get().getStats();
    
    return {
      name: 'Automation Workflow',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      steps: workflow,
      metadata: {
        totalSteps: workflow.length,
        enabledSteps: workflow.filter(s => s.enabled).length,
        disabledSteps: workflow.filter(s => !s.enabled).length,
        stepTypes: stats.stepTypes,
        generator: 'Web Automation Studio Pro',
        exportedBy: 'User',
        ...stats
      }
    };
  },
  
  // Import workflow with validation
  importWorkflow: (workflowData) => {
    try {
      const steps = workflowData.steps || workflowData.workflow || [];
      
      // Validate imported steps
      const validSteps = steps.filter(step => 
        step.type && step.name && typeof step.config === 'object'
      ).map((step, index) => ({
        ...step,
        id: nanoid(), // Generate new IDs to avoid conflicts
        order: index,
        enabled: step.enabled !== undefined ? step.enabled : true,
        createdAt: step.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Validate that action types exist in our templates
      const validatedSteps = validSteps.filter(step => {
        if (actionTemplates[step.type]) {
          return true;
        } else {
          console.warn('Unknown step type during import:', step.type);
          return false;
        }
      });
      
      set({
        workflow: validatedSteps,
        selectedStep: validatedSteps.length > 0 ? validatedSteps[0].id : null
      });
      
      return { 
        success: true, 
        imported: validatedSteps.length,
        skipped: steps.length - validatedSteps.length
      };
      
    } catch (error) {
      console.error('Failed to import workflow:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get workflow statistics
  getStats: () => {
    const workflow = get().workflow;
    const stepTypes = workflow.reduce((acc, step) => {
      acc[step.type] = (acc[step.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalSteps: workflow.length,
      enabledSteps: workflow.filter(s => s.enabled).length,
      disabledSteps: workflow.filter(s => !s.enabled).length,
      stepTypes,
      hasNavigation: workflow.some(s => s.type === 'navigate'),
      hasWaits: workflow.some(s => s.type.startsWith('wait-')),
      hasInteractions: workflow.some(s => ['click', 'type', 'hover', 'scroll'].includes(s.type)),
      hasFileOperations: workflow.some(s => ['download-verify', 'upload-file', 'file-monitor'].includes(s.type)),
      hasDataExtraction: workflow.some(s => ['extract-text', 'extract-table', 'screenshot'].includes(s.type)),
      hasLogicFlow: workflow.some(s => ['condition', 'loop', 'try-catch'].includes(s.type)),
      averageStepsPerType: Object.keys(stepTypes).length > 0 ? workflow.length / Object.keys(stepTypes).length : 0,
      mostUsedStepType: Object.entries(stepTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    };
  }
}));

export default useWorkflowStore;
