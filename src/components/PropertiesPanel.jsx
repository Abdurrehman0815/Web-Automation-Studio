import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  MousePointer, 
  Crosshair, 
  Eye, 
  Clock, 
  Globe,
  Save,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  Mail,
  Bell
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import toast from 'react-hot-toast';

const PropertiesPanel = () => {
  const { selectedStep, workflow, updateStep } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState('config');
  const [showHelp, setShowHelp] = useState(false);
  
  const selectedStepData = workflow.find(step => step.id === selectedStep);

  const handleConfigChange = (key, value) => {
    if (selectedStepData) {
      const newConfig = { ...selectedStepData.config, [key]: value };
      updateStep(selectedStep, { config: newConfig });
      toast.success('Configuration updated', { duration: 1500 });
    }
  };

  const handleSaveConfig = () => {
    if (selectedStepData) {
      toast.success(`✅ Configuration saved for "${selectedStepData.name}"`);
    }
  };

  const handleResetConfig = () => {
    if (selectedStepData && confirm('Reset to default configuration?')) {
      // Reset to default config based on step type
      const defaultConfigs = {
        'navigate': { url: '', waitForLoad: true, timeout: 30000 },
        'wait-time': { duration: 2000, randomDelay: false, minDelay: 1000, maxDelay: 3000 },
        'click': { selector: '', timeout: 10000, waitForElement: true },
        'type': { selector: '', text: '', speed: 50, clearFirst: false },
        'wait-text': { selector: '', expectedText: '', timeout: 30000, exact: false },
        'wait-clickable': { selector: '', timeout: 30000 },
        'wait-page-load': { timeout: 30000, waitFor: 'networkidle2' },
        // Add more defaults as needed
      };
      
      const defaultConfig = defaultConfigs[selectedStepData.type] || {};
      updateStep(selectedStep, { config: defaultConfig });
      toast.success('Configuration reset to defaults');
    }
  };

  const getStepHelp = (stepType) => {
    const helpTexts = {
      'navigate': {
        title: 'Navigate to URL',
        description: 'Opens a web page in the browser',
        fields: {
          url: 'The web address to visit (must start with http:// or https://)',
          waitForLoad: 'Wait for the page to fully load before continuing',
          timeout: 'Maximum time to wait for page load (in milliseconds)'
        },
        examples: ['https://google.com', 'https://example.com/login']
      },
      'click': {
        title: 'Click Element',
        description: 'Clicks on a specific element on the page',
        fields: {
          selector: 'CSS selector or XPath to identify the element',
          timeout: 'How long to wait for element to appear',
          waitForElement: 'Wait for element to be clickable before clicking'
        },
        examples: ['#submit-button', '.login-btn', 'button[type="submit"]']
      },
      'type': {
        title: 'Type Text',
        description: 'Types text into an input field',
        fields: {
          selector: 'CSS selector to identify the input field',
          text: 'The text to type into the field',
          speed: 'Typing speed in milliseconds per character',
          clearFirst: 'Clear the field before typing new text'
        },
        examples: ['#username', 'input[name="email"]', '.search-input']
      },
      'select-dropdown': {
        title: 'Select from Dropdown',
        description: 'Selects an option from a dropdown menu',
        fields: {
          selector: 'CSS selector for the dropdown element',
          value: 'The value or text of the option to select',
          byValue: 'Select by value attribute (true) or by visible text (false)'
        },
        examples: ['select[name="country"]', '#category-select']
      },
      'pdf-generate': {
        title: 'Generate PDF',
        description: 'Creates a PDF document from the current page',
        fields: {
          fileName: 'Name for the generated PDF file',
          fullPage: 'Include entire page or just visible area',
          quality: 'PDF quality (1-100, higher = better quality)'
        },
        examples: ['report.pdf', 'page-{timestamp}.pdf']
      },
      'send-email': {
        title: 'Send Email',
        description: 'Sends an email notification',
        fields: {
          to: 'Recipient email address',
          subject: 'Email subject line',
          message: 'Email content/body',
          attachments: 'Files to attach (optional)'
        },
        examples: ['user@example.com', 'Automation Report']
      },
      'send-notification': {
        title: 'Send Notification',
        description: 'Sends a system notification',
        fields: {
          title: 'Notification title',
          message: 'Notification message',
          type: 'Notification type (info, success, warning, error)'
        },
        examples: ['Task Complete', 'Automation finished successfully']
      },
      // Add these cases to the getStepHelp function in PropertiesPanel.jsx:

      'new-tab': {
        title: 'Open New Tab',
        description: 'Opens a new browser tab with optional URL',
        fields: {
          url: 'Optional URL to load in the new tab (leave empty for blank tab)',
          switchToTab: 'Whether to switch focus to the new tab immediately',
          timeout: 'Maximum time to wait for tab creation'
        },
        examples: ['https://google.com', 'about:blank']
      },
      'wait-download': {
        title: 'Wait for Download',
        description: 'Waits for a file to be downloaded to a specific folder',
        fields: {
          downloadPath: 'Path to the download folder to monitor',
          fileName: 'Expected filename pattern (use * for wildcards)',
          timeout: 'Maximum time to wait for download completion',
          exactMatch: 'Whether to match filename exactly or use pattern matching'
        },
        examples: ['./downloads', '*.pdf', 'document.xlsx']
      },
      'focus': {
        title: 'Focus Element',
        description: 'Sets focus on a specific input element or interactive component',
        fields: {
          selector: 'CSS selector or XPath to identify the element',
          timeout: 'Maximum time to wait for element to become focusable',
          scrollIntoView: 'Scroll the element into viewport before focusing'
        },
        examples: ['#username', 'input[name="email"]', '.search-input']
      },
      'file-rename': {
        title: 'Rename File',
        description: 'Renames a file from one path to another',
        fields: {
          currentPath: 'Current file path and name',
          newPath: 'New file path and name',
          overwrite: 'Whether to overwrite if destination file exists'
        },
        examples: ['./downloads/old-name.pdf', './downloads/new-name.pdf']
      },
      'file-move': {
        title: 'Move File',
        description: 'Moves a file from source location to destination',
        fields: {
          sourcePath: 'Source file path',
          destinationPath: 'Destination file path',
          createDirectories: 'Create destination directories if they don\'t exist',
          overwrite: 'Whether to overwrite if destination file exists'
        },
        examples: ['./downloads/file.pdf', './processed/file.pdf']
      },
      'extract-images': {
        title: 'Extract Images',
        description: 'Extracts image URLs or downloads images from the page',
        fields: {
          selector: 'CSS selector to find image elements',
          attribute: 'Image attribute to extract (src, data-src, etc.)',
          saveAs: 'Variable name to store extracted URLs',
          downloadImages: 'Whether to download images locally',
          downloadPath: 'Local folder path for downloaded images'
        },
        examples: ['img', '.gallery img', 'img[data-src]']
      },
      'break': {
        title: 'Break Loop',
        description: 'Breaks out of the current loop based on a condition',
        fields: {
          condition: 'Optional condition to evaluate before breaking',
          immediate: 'Break immediately without condition evaluation'
        },
        examples: ['counter > 10', 'element.exists', 'variable === "stop"']
      },
      'variable-set': {
        title: 'Set Variable',
        description: 'Creates or updates a variable with a specific value',
        fields: {
          name: 'Variable name (no spaces or special characters)',
          value: 'Value to assign to the variable',
          type: 'Data type of the variable (string, number, boolean, etc.)'
        },
        examples: ['myCounter', 'Hello World', '42']
      },
      'variable-get': {
        title: 'Get Variable',
        description: 'Retrieves the value of a previously set variable',
        fields: {
          name: 'Name of the variable to retrieve',
          saveAs: 'New variable name to store the retrieved value',
          defaultValue: 'Default value if the variable doesn\'t exist'
        },
        examples: ['myCounter', 'retrievedValue', 'defaultText']
      },
      'database': {
        title: 'Database Query',
        description: 'Executes a database query and stores results',
        fields: {
          connectionString: 'Database connection string',
          query: 'SQL query to execute',
          parameters: 'Query parameters in JSON format',
          saveAs: 'Variable name to store query results'
        },
        examples: ['SELECT * FROM users', 'postgresql://user:pass@localhost:5432/db']
      },
      'email': {
        title: 'Send Email',
        description: 'Sends an email with specified content and attachments',
        fields: {
          to: 'Recipient email address',
          subject: 'Email subject line',
          message: 'Email content/body',
          provider: 'Email service provider (SMTP, Gmail, Outlook)',
          attachments: 'Comma-separated list of files to attach',
          smtpSettings: 'SMTP configuration for custom email servers'
        },
        examples: ['user@example.com', 'Automation Report', 'file1.pdf,file2.jpg']
      },
      'wait-time': {
        title: 'Wait Fixed Time',
        description: 'Pauses execution for a specified duration',
        fields: {
          duration: 'Time to wait in milliseconds',
          randomDelay: 'Add random variation to the delay',
          minDelay: 'Minimum delay when using random variation',
          maxDelay: 'Maximum delay when using random variation'
        },
        examples: ['2000', '5000', '1000-3000']
      },
      'wait-disappear': {
        title: 'Wait Until Disappears',
        description: 'Waits for an element to disappear from the page',
        fields: {
          selector: 'CSS selector or XPath to identify the element',
          timeout: 'Maximum time to wait for element to disappear'
        },
        examples: ['.loading-spinner', '#modal-dialog', '.error-message']
      },
      'wait-text': {
        title: 'Wait for Text Content',
        description: 'Waits for specific text to appear in an element',
        fields: {
          selector: 'CSS selector to identify the element',
          expectedText: 'Text content to wait for',
          timeout: 'Maximum time to wait for text to appear',
          exact: 'Whether to match text exactly or partially'
        },
        examples: ['.status', 'Processing complete', 'Success']
      },
      'wait-clickable': {
        title: 'Wait Until Clickable',
        description: 'Waits for an element to become clickable',
        fields: {
          selector: 'CSS selector to identify the element',
          timeout: 'Maximum time to wait for element to be clickable'
        },
        examples: ['#submit-button', '.action-btn:not([disabled])']
      },
      'wait-page-load': {
        title: 'Wait for Page Load',
        description: 'Waits for the page to finish loading completely',
        fields: {
          timeout: 'Maximum time to wait for page load',
          waitFor: 'Load condition to wait for (networkidle, domcontentloaded)'
        },
        examples: ['networkidle', 'domcontentloaded']
      },
      'double-click': {
        title: 'Double Click',
        description: 'Performs a double-click action on an element',
        fields: {
          selector: 'CSS selector to identify the element',
          timeout: 'Maximum time to wait for element',
          delay: 'Delay between the two clicks in milliseconds'
        },
        examples: ['.file-item', '#folder-icon', 'tr.table-row']
      },
      'right-click': {
        title: 'Right Click',
        description: 'Performs a right-click (context menu) on an element',
        fields: {
          selector: 'CSS selector to identify the element',
          timeout: 'Maximum time to wait for element'
        },
        examples: ['.context-target', '#menu-trigger', '.right-clickable']
      },
      'hover': {
        title: 'Hover Over Element',
        description: 'Hovers the mouse cursor over an element',
        fields: {
          selector: 'CSS selector to identify the element',
          timeout: 'Maximum time to wait for element',
          duration: 'How long to maintain hover state'
        },
        examples: ['.tooltip-trigger', '.dropdown-menu', '.hover-effect']
      },
      'scroll': {
        title: 'Scroll Page',
        description: 'Scrolls the page or a specific element',
        fields: {
          direction: 'Scroll direction (up, down, left, right)',
          amount: 'Amount to scroll in pixels',
          smooth: 'Whether to use smooth scrolling animation',
          element: 'Target element to scroll (default: page)'
        },
        examples: ['down', '500px', '.scrollable-content']
      },
      'clear-type': {
        title: 'Clear & Type',
        description: 'Clears an input field and types new text',
        fields: {
          selector: 'CSS selector to identify the input field',
          text: 'Text to type after clearing',
          speed: 'Typing speed in milliseconds per character'
        },
        examples: ['#search-input', 'input[name="username"]', '.form-field']
      },
      'upload-file': {
        title: 'Upload File',
        description: 'Uploads a file through a file input element',
        fields: {
          selector: 'CSS selector for the file input element',
          filePath: 'Path to the file to upload',
          multiple: 'Whether to upload multiple files'
        },
        examples: ['input[type="file"]', './documents/file.pdf', '#file-upload']
      },
      'press-key': {
        title: 'Press Key',
        description: 'Simulates pressing a keyboard key or key combination',
        fields: {
          key: 'Key to press (Enter, Tab, Escape, etc.)',
          modifiers: 'Modifier keys to hold (Ctrl, Alt, Shift)'
        },
        examples: ['Enter', 'Tab', 'Ctrl+S', 'Alt+F4']
      },
      'check-checkbox': {
        title: 'Check/Uncheck Box',
        description: 'Checks or unchecks a checkbox element',
        fields: {
          selector: 'CSS selector to identify the checkbox',
          action: 'Action to perform (check, uncheck, toggle)'
        },
        examples: ['input[type="checkbox"]', '#agree-terms', '.form-checkbox']
      },
      'radio-select': {
        title: 'Select Radio Button',
        description: 'Selects a radio button from a group',
        fields: {
          selector: 'CSS selector to identify the radio button',
          value: 'Value of the radio button to select'
        },
        examples: ['input[name="gender"]', 'input[value="male"]', '.radio-option']
      },
      'download-trigger': {
        title: 'Trigger Download',
        description: 'Initiates a file download by clicking a download link',
        fields: {
          downloadPath: 'Path where downloads should be saved',
          selector: 'CSS selector for the download trigger element',
          timeout: 'Maximum time to wait for download to start'
        },
        examples: ['.download-btn', 'a[download]', '#export-button']
      },
      'download-verify': {
        title: 'Verify Download',
        description: 'Verifies that a file was successfully downloaded',
        fields: {
          downloadPath: 'Path to the download folder',
          fileName: 'Expected filename or pattern',
          timeout: 'Maximum time to wait for download completion',
          fileSize: 'Expected minimum file size in bytes',
          checkContent: 'Whether to verify file content'
        },
        examples: ['./downloads', 'report.pdf', '1024']
      },
      'file-monitor': {
        title: 'Monitor File Changes',
        description: 'Monitors a folder for file changes or new files',
        fields: {
          folderPath: 'Path to the folder to monitor',
          pattern: 'File pattern to watch for (* for all files)',
          timeout: 'Maximum time to wait for changes',
          action: 'What to do with detected files (newest, oldest, all)'
        },
        examples: ['./downloads', '*.pdf', './incoming']
      },
      'cloud-upload': {
        title: 'Upload to Cloud',
        description: 'Uploads files to cloud storage services',
        fields: {
          provider: 'Cloud storage provider (OneDrive, Google Drive, etc.)',
          localPath: 'Local file path to upload',
          remotePath: 'Remote destination path',
          overwrite: 'Whether to overwrite existing files'
        },
        examples: ['onedrive', './documents/file.pdf', '/uploads/']
      },
      'extract-table': {
        title: 'Extract Table Data',
        description: 'Extracts data from HTML tables',
        fields: {
          selector: 'CSS selector to identify the table',
          includeHeaders: 'Whether to include table headers',
          saveAs: 'Variable name to store extracted data'
        },
        examples: ['table.data', '.results-table', '#pricing-table']
      },
      'extract-links': {
        title: 'Extract Links',
        description: 'Extracts all links from the page or specific elements',
        fields: {
          selector: 'CSS selector to find link elements',
          attribute: 'Link attribute to extract (href, title, etc.)',
          saveAs: 'Variable name to store extracted links'
        },
        examples: ['a', '.nav-links a', 'a[href^="http"]']
      },
      'screenshot': {
        title: 'Take Screenshot',
        description: 'Captures a screenshot of the page or specific element',
        fields: {
          fileName: 'Filename for the screenshot',
          fullPage: 'Capture entire page or just visible area',
          selector: 'CSS selector for specific element (optional)'
        },
        examples: ['screenshot.png', 'page_{timestamp}.jpg', '.main-content']
      },
      'condition': {
        title: 'If Condition',
        description: 'Executes different actions based on a condition',
        fields: {
          type: 'Condition type (elementExists, textContains, etc.)',
          selector: 'CSS selector for element-based conditions',
          value: 'Expected value for comparison',
          operator: 'Comparison operator (equals, contains, etc.)',
          thenAction: 'Action to take if condition is true',
          elseAction: 'Action to take if condition is false'
        },
        examples: ['elementExists', '.success-message', 'equals']
      },
      'loop': {
        title: 'Loop Actions',
        description: 'Repeats a set of actions multiple times',
        fields: {
          type: 'Loop type (count, while, foreach)',
          count: 'Number of iterations for count-based loops',
          maxIterations: 'Maximum iterations to prevent infinite loops',
          breakCondition: 'Condition to break out of the loop'
        },
        examples: ['count', '10', 'counter > maxValue']
      },
      'try-catch': {
        title: 'Error Handling',
        description: 'Handles errors and exceptions during automation',
        fields: {
          continueOnError: 'Whether to continue workflow on error',
          logErrors: 'Whether to log error details',
          fallbackAction: 'Action to take when error occurs'
        },
        examples: ['continue', 'skip', 'retry']
      },
      'refresh': {
        title: 'Refresh Page',
        description: 'Refreshes the current browser page',
        fields: {
          timeout: 'Maximum time to wait for page reload'
        },
        examples: ['10000', '30000']
      },
      'back': {
        title: 'Go Back',
        description: 'Navigates back to the previous page in browser history',
        fields: {
          timeout: 'Maximum time to wait for navigation'
        },
        examples: ['5000', '10000']
      },
      'forward': {
        title: 'Go Forward',
        description: 'Navigates forward to the next page in browser history',
        fields: {
          timeout: 'Maximum time to wait for navigation'
        },
        examples: ['5000', '10000']
      },
      'javascript': {
        title: 'Execute JavaScript',
        description: 'Runs custom JavaScript code in the browser context',
        fields: {
          code: 'JavaScript code to execute',
          returnValue: 'Whether to capture and return the result',
          saveAs: 'Variable name to store the result'
        },
        examples: ['document.title', 'window.scrollTo(0, 0)', 'localStorage.getItem("key")']
      },
      'api-call': {
        title: 'API Request',
        description: 'Makes HTTP requests to external APIs',
        fields: {
          url: 'API endpoint URL',
          method: 'HTTP method (GET, POST, PUT, DELETE)',
          headers: 'Request headers in JSON format',
          body: 'Request body content',
          saveAs: 'Variable name to store API response'
        },
        examples: ['https://api.example.com/data', 'GET', 'POST']
      }
    };
    
    return helpTexts[stepType] || {
      title: 'Step Configuration',
      description: 'Configure this automation step',
      fields: {},
      examples: []
    };
  };

  const renderProperties = () => {
    if (!selectedStepData) {
      return (
        <motion.div 
          className="flex flex-col items-center justify-center h-96 text-center p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MousePointer className="w-20 h-20 text-gray-400 mb-6" />
          <h3 className="text-xl font-medium text-gray-300 mb-3">No Step Selected</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Click on a workflow step to configure its properties and settings. 
            You can modify selectors, timeouts, and other parameters here.
          </p>
          
          <div className="mt-6 p-4 glass-dark rounded-lg">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Quick Tips</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Use Element Picker to find selectors easily</li>
              <li>• Test individual steps before running full workflow</li>
              <li>• Configure timeouts based on page load speed</li>
            </ul>
          </div>
        </motion.div>
      );
    }

    const { type, config } = selectedStepData;
    const helpInfo = getStepHelp(type);

    switch (type) {
      case 'navigate':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website URL *
              </label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Enter the full URL including http:// or https://</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeout (milliseconds)
              </label>
              <input
                type="number"
                value={config.timeout || 30000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                min="1000"
                max="120000"
                step="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
              <div className="flex items-center gap-4 mt-2">
                <button 
                  onClick={() => handleConfigChange('timeout', 10000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Fast (10s)
                </button>
                <button 
                  onClick={() => handleConfigChange('timeout', 30000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Normal (30s)
                </button>
                <button 
                  onClick={() => handleConfigChange('timeout', 60000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Slow (60s)
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="waitForLoad"
                checked={config.waitForLoad || false}
                onChange={(e) => handleConfigChange('waitForLoad', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="waitForLoad" className="text-sm text-gray-300">
                Wait for page to fully load
              </label>
            </div>
          </div>
        );

      case 'click':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MousePointer className="w-4 h-4 inline mr-2" />
                Element Selector *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.selector || ''}
                  onChange={(e) => handleConfigChange('selector', e.target.value)}
                  placeholder="#button-id or .button-class"
                  className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-colors">
                  <Crosshair className="w-4 h-4 text-blue-400" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Use CSS selectors like #id, .class, or [attribute="value"]
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selector Type
              </label>
              <select
                value={config.selectorType || 'css'}
                onChange={(e) => handleConfigChange('selectorType', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
              >
                <option value="css" className="bg-slate-800">CSS Selector</option>
                <option value="xpath" className="bg-slate-800">XPath</option>
                <option value="text" className="bg-slate-800">Link Text</option>
                <option value="partial-text" className="bg-slate-800">Partial Link Text</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Click Options
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="waitForElement"
                    checked={config.waitForElement || false}
                    onChange={(e) => handleConfigChange('waitForElement', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="waitForElement" className="text-sm text-gray-300">
                    Wait for element to be clickable
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="scrollToElement"
                    checked={config.scrollToElement || false}
                    onChange={(e) => handleConfigChange('scrollToElement', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="scrollToElement" className="text-sm text-gray-300">
                    Scroll to element before clicking
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'wait-element':
        return (
          <div className="space-y-6">
            {/* Element Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Eye className="w-4 h-4 inline mr-2" />
                Element Selector *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.selector || ''}
                  onChange={(e) => handleConfigChange('selector', e.target.value)}
                  placeholder="#element-id, .class-name, or xpath"
                  className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <button 
                  className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-colors"
                  title="Use Element Picker"
                >
                  <Crosshair className="w-4 h-4 text-blue-400" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                CSS selector, XPath, or element identifier to wait for
              </p>
            </div>

            {/* Selector Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selector Type
              </label>
              <select
                value={config.selectorType || 'css'}
                onChange={(e) => handleConfigChange('selectorType', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
              >
                <option value="css" className="bg-slate-800">CSS Selector</option>
                <option value="xpath" className="bg-slate-800">XPath</option>
                <option value="id" className="bg-slate-800">Element ID</option>
                <option value="class" className="bg-slate-800">Class Name</option>
                <option value="name" className="bg-slate-800">Name attribute</option>
                <option value="tag" className="bg-slate-800">Tag Name</option>
              </select>
            </div>

            {/* Wait Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Wait Condition
              </label>
              <select
                value={config.condition || 'visible'}
                onChange={(e) => handleConfigChange('condition', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
              >
                <option value="visible" className="bg-slate-800">Element becomes visible</option>
                <option value="present" className="bg-slate-800">Element is present in DOM</option>
                <option value="clickable" className="bg-slate-800">Element becomes clickable</option>
                <option value="enabled" className="bg-slate-800">Element becomes enabled</option>
                <option value="selected" className="bg-slate-800">Element becomes selected</option>
                <option value="invisible" className="bg-slate-800">Element becomes invisible</option>
                <option value="stale" className="bg-slate-800">Element becomes stale</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Condition that must be met before continuing
              </p>
            </div>

            {/* Timeout Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeout (milliseconds)
              </label>
              <input
                type="number"
                value={config.timeout || 30000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                min="1000"
                max="300000"
                step="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
              <div className="flex items-center gap-4 mt-2">
                <button 
                  onClick={() => handleConfigChange('timeout', 10000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Fast (10s)
                </button>
                <button 
                  onClick={() => handleConfigChange('timeout', 30000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Normal (30s)
                </button>
                <button 
                  onClick={() => handleConfigChange('timeout', 60000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Slow (60s)
                </button>
                <button 
                  onClick={() => handleConfigChange('timeout', 120000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Very Slow (2min)
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Maximum time to wait for the condition to be met
              </p>
            </div>

            {/* Polling Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Polling Interval (milliseconds)
              </label>
              <input
                type="number"
                value={config.pollingInterval || 500}
                onChange={(e) => handleConfigChange('pollingInterval', parseInt(e.target.value))}
                min="100"
                max="5000"
                step="100"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
              <div className="flex items-center gap-4 mt-2">
                <button 
                  onClick={() => handleConfigChange('pollingInterval', 250)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Aggressive (250ms)
                </button>
                <button 
                  onClick={() => handleConfigChange('pollingInterval', 500)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Normal (500ms)
                </button>
                <button 
                  onClick={() => handleConfigChange('pollingInterval', 1000)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Conservative (1s)
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                How often to check if the condition is met
              </p>
            </div>

            {/* Advanced Options */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Advanced Options
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="scrollToElement"
                    checked={config.scrollToElement || false}
                    onChange={(e) => handleConfigChange('scrollToElement', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="scrollToElement" className="text-sm text-gray-300">
                    Scroll to element if not in viewport
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="throwOnTimeout"
                    checked={config.throwOnTimeout !== false}
                    onChange={(e) => handleConfigChange('throwOnTimeout', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="throwOnTimeout" className="text-sm text-gray-300">
                    Throw error if timeout is reached
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="waitForStable"
                    checked={config.waitForStable || false}
                    onChange={(e) => handleConfigChange('waitForStable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="waitForStable" className="text-sm text-gray-300">
                    Wait for element to be stable (not moving)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ignoreErrors"
                    checked={config.ignoreErrors || false}
                    onChange={(e) => handleConfigChange('ignoreErrors', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ignoreErrors" className="text-sm text-gray-300">
                    Continue workflow if element is not found
                  </label>
                </div>
              </div>
            </div>

            {/* Expected Text (conditional) */}
            {(config.condition === 'text-present' || config.condition === 'text-changed') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Text
                </label>
                <input
                  type="text"
                  value={config.expectedText || ''}
                  onChange={(e) => handleConfigChange('expectedText', e.target.value)}
                  placeholder="Text to wait for in the element"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="exactMatch"
                    checked={config.exactMatch || false}
                    onChange={(e) => handleConfigChange('exactMatch', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="exactMatch" className="text-sm text-gray-300">
                    Exact text match (case sensitive)
                  </label>
                </div>
              </div>
            )}

            {/* Save Variable */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Save Result To Variable (optional)
              </label>
              <input
                type="text"
                value={config.saveAs || ''}
                onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                placeholder="variableName"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Variable name to store whether the element was found (true/false)
              </p>
            </div>

            {/* Configuration Preview */}
            <div className="glass-dark rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">Configuration Summary</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <div><strong>Action:</strong> Wait for element to be {config.condition || 'visible'}</div>
                <div><strong>Selector:</strong> {config.selector || 'Not specified'}</div>
                <div><strong>Timeout:</strong> {(config.timeout || 30000) / 1000}s</div>
                <div><strong>Check every:</strong> {(config.pollingInterval || 500)}ms</div>
                {config.expectedText && <div><strong>Expected text:</strong> "{config.expectedText}"</div>}
              </div>
            </div>
          </div>
        );

      case 'type':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Element Selector *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.selector || ''}
                  onChange={(e) => handleConfigChange('selector', e.target.value)}
                  placeholder="#input-id or .input-class"
                  className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-colors">
                  <Crosshair className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text to Type *
              </label>
              <textarea
                value={config.text || ''}
                onChange={(e) => handleConfigChange('text', e.target.value)}
                placeholder="Enter the text to type..."
                rows={3}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use {'{'}variable{'}'} for dynamic values or {'{'}date{'}'} for current date
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Typing Speed (milliseconds per character)
              </label>
              <input
                type="number"
                value={config.speed || 50}
                onChange={(e) => handleConfigChange('speed', parseInt(e.target.value))}
                min="0"
                max="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
              <div className="flex items-center gap-4 mt-2">
                <button 
                  onClick={() => handleConfigChange('speed', 0)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Instant (0ms)
                </button>
                <button 
                  onClick={() => handleConfigChange('speed', 50)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Fast (50ms)
                </button>
                <button 
                  onClick={() => handleConfigChange('speed', 100)}
                  className="text-xs px-2 py-1 glass-effect rounded hover:bg-white/10 transition-colors"
                >
                  Human-like (100ms)
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="clearFirst"
                checked={config.clearFirst || false}
                onChange={(e) => handleConfigChange('clearFirst', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="clearFirst" className="text-sm text-gray-300">
                Clear field before typing
              </label>
            </div>
          </div>
        );

        case 'new-tab':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={config.url || ''}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  placeholder="https://example.com (leave empty for blank tab)"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="switchToTab"
                  checked={config.switchToTab !== false}
                  onChange={(e) => handleConfigChange('switchToTab', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="switchToTab" className="text-sm text-gray-300">
                  Switch to new tab immediately
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeout (milliseconds)
                </label>
                <input
                  type="number"
                  value={config.timeout || 10000}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  min="1000"
                  max="60000"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
            </div>
          );

        case 'wait-download':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Download Folder Path
                </label>
                <input
                  type="text"
                  value={config.downloadPath || './downloads'}
                  onChange={(e) => handleConfigChange('downloadPath', e.target.value)}
                  placeholder="./downloads"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected File Name (optional)
                </label>
                <input
                  type="text"
                  value={config.fileName || ''}
                  onChange={(e) => handleConfigChange('fileName', e.target.value)}
                  placeholder="document.pdf or *.pdf for any PDF"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use * for wildcards. Leave empty to wait for any new file.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeout (milliseconds)
                </label>
                <input
                  type="number"
                  value={config.timeout || 60000}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  min="5000"
                  max="300000"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="exactMatch"
                  checked={config.exactMatch || false}
                  onChange={(e) => handleConfigChange('exactMatch', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="exactMatch" className="text-sm text-gray-300">
                  Exact file name match (no wildcards)
                </label>
              </div>
            </div>
          );

        case 'focus':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Eye className="w-4 h-4 inline mr-2" />
                  Element Selector *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.selector || ''}
                    onChange={(e) => handleConfigChange('selector', e.target.value)}
                    placeholder="#input-field or .form-input"
                    className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                  />
                  <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-colors">
                    <Crosshair className="w-4 h-4 text-blue-400" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeout (milliseconds)
                </label>
                <input
                  type="number"
                  value={config.timeout || 10000}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  min="1000"
                  max="60000"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="scrollIntoView"
                  checked={config.scrollIntoView !== false}
                  onChange={(e) => handleConfigChange('scrollIntoView', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="scrollIntoView" className="text-sm text-gray-300">
                  Scroll element into view if needed
                </label>
              </div>
            </div>
          );

        case 'file-rename':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current File Path *
                </label>
                <input
                  type="text"
                  value={config.currentPath || ''}
                  onChange={(e) => handleConfigChange('currentPath', e.target.value)}
                  placeholder="./downloads/document.pdf"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New File Path *
                </label>
                <input
                  type="text"
                  value={config.newPath || ''}
                  onChange={(e) => handleConfigChange('newPath', e.target.value)}
                  placeholder="./downloads/new-document.pdf"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="overwrite"
                  checked={config.overwrite || false}
                  onChange={(e) => handleConfigChange('overwrite', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="overwrite" className="text-sm text-gray-300">
                  Overwrite if destination file exists
                </label>
              </div>
            </div>
          );

        case 'file-move':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source File Path *
                </label>
                <input
                  type="text"
                  value={config.sourcePath || ''}
                  onChange={(e) => handleConfigChange('sourcePath', e.target.value)}
                  placeholder="./downloads/document.pdf"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destination Path *
                </label>
                <input
                  type="text"
                  value={config.destinationPath || ''}
                  onChange={(e) => handleConfigChange('destinationPath', e.target.value)}
                  placeholder="./processed/document.pdf"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="createDirectories"
                    checked={config.createDirectories !== false}
                    onChange={(e) => handleConfigChange('createDirectories', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="createDirectories" className="text-sm text-gray-300">
                    Create destination directories if they don't exist
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="overwrite"
                    checked={config.overwrite || false}
                    onChange={(e) => handleConfigChange('overwrite', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="overwrite" className="text-sm text-gray-300">
                    Overwrite if destination file exists
                  </label>
                </div>
              </div>
            </div>
          );

        case 'extract-images':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Selector
                </label>
                <input
                  type="text"
                  value={config.selector || 'img'}
                  onChange={(e) => handleConfigChange('selector', e.target.value)}
                  placeholder="img or .gallery img"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attribute to Extract
                </label>
                <select
                  value={config.attribute || 'src'}
                  onChange={(e) => handleConfigChange('attribute', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
                >
                  <option value="src" className="bg-slate-800">Source URL (src)</option>
                  <option value="data-src" className="bg-slate-800">Data Source (data-src)</option>
                  <option value="srcset" className="bg-slate-800">Source Set (srcset)</option>
                  <option value="alt" className="bg-slate-800">Alt Text</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Save Results As Variable
                </label>
                <input
                  type="text"
                  value={config.saveAs || 'images'}
                  onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                  placeholder="images"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="downloadImages"
                  checked={config.downloadImages || false}
                  onChange={(e) => handleConfigChange('downloadImages', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="downloadImages" className="text-sm text-gray-300">
                  Download images to local folder
                </label>
              </div>
              
              {config.downloadImages && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Download Path
                  </label>
                  <input
                    type="text"
                    value={config.downloadPath || './images'}
                    onChange={(e) => handleConfigChange('downloadPath', e.target.value)}
                    placeholder="./images"
                    className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                  />
                </div>
              )}
            </div>
          );

        case 'break':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Break Condition (optional)
                </label>
                <input
                  type="text"
                  value={config.condition || ''}
                  onChange={(e) => handleConfigChange('condition', e.target.value)}
                  placeholder="variable === 'value' or element.exists"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to always break. Use variable names or element conditions.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="immediate"
                  checked={config.immediate !== false}
                  onChange={(e) => handleConfigChange('immediate', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="immediate" className="text-sm text-gray-300">
                  Break immediately (don't wait for condition evaluation)
                </label>
              </div>
            </div>
          );

        case 'variable-set':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Variable Name *
                </label>
                <input
                  type="text"
                  value={config.name || ''}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                  placeholder="myVariable"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Variable Value *
                </label>
                <textarea
                  value={config.value || ''}
                  onChange={(e) => handleConfigChange('value', e.target.value)}
                  placeholder="Hello World or {otherVariable} or 42"
                  rows={3}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use {'{'}variable{'}'} to reference other variables or functions
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Variable Type
                </label>
                <select
                  value={config.type || 'string'}
                  onChange={(e) => handleConfigChange('type', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
                >
                  <option value="string" className="bg-slate-800">String</option>
                  <option value="number" className="bg-slate-800">Number</option>
                  <option value="boolean" className="bg-slate-800">Boolean</option>
                  <option value="json" className="bg-slate-800">JSON Object</option>
                  <option value="array" className="bg-slate-800">Array</option>
                </select>
              </div>
            </div>
          );

        case 'variable-get':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Variable Name *
                </label>
                <input
                  type="text"
                  value={config.name || ''}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                  placeholder="myVariable"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Save As Variable
                </label>
                <input
                  type="text"
                  value={config.saveAs || ''}
                  onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                  placeholder="retrievedValue"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Value (if variable doesn't exist)
                </label>
                <input
                  type="text"
                  value={config.defaultValue || ''}
                  onChange={(e) => handleConfigChange('defaultValue', e.target.value)}
                  placeholder="default value"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>
          );

        case 'database':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connection String *
                </label>
                <input
                  type="text"
                  value={config.connectionString || ''}
                  onChange={(e) => handleConfigChange('connectionString', e.target.value)}
                  placeholder="mongodb://localhost:27017/mydb or postgresql://user:pass@localhost:5432/mydb"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SQL Query *
                </label>
                <textarea
                  value={config.query || ''}
                  onChange={(e) => handleConfigChange('query', e.target.value)}
                  placeholder="SELECT * FROM users WHERE active = ?"
                  rows={4}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parameters (JSON format)
                </label>
                <textarea
                  value={JSON.stringify(config.parameters || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleConfigChange('parameters', parsed);
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  placeholder='{"param1": "value1", "param2": 123}'
                  rows={3}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Save Results As Variable
                </label>
                <input
                  type="text"
                  value={config.saveAs || 'dbResult'}
                  onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                  placeholder="dbResult"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>
          );

        case 'email':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={config.to || ''}
                  onChange={(e) => handleConfigChange('to', e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={config.subject || ''}
                  onChange={(e) => handleConfigChange('subject', e.target.value)}
                  placeholder="Email subject line"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={config.message || ''}
                  onChange={(e) => handleConfigChange('message', e.target.value)}
                  placeholder="Email message content..."
                  rows={4}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Provider
                </label>
                <select
                  value={config.provider || 'smtp'}
                  onChange={(e) => handleConfigChange('provider', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
                >
                  <option value="smtp" className="bg-slate-800">SMTP</option>
                  <option value="gmail" className="bg-slate-800">Gmail</option>
                  <option value="outlook" className="bg-slate-800">Outlook</option>
                  <option value="sendgrid" className="bg-slate-800">SendGrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attachments (comma-separated)
                </label>
                <input
                  type="text"
                  value={config.attachments || ''}
                  onChange={(e) => handleConfigChange('attachments', e.target.value)}
                  placeholder="file1.pdf,file2.jpg"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              
              {config.provider === 'smtp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SMTP Settings (JSON format)
                  </label>
                  <textarea
                    value={JSON.stringify(config.smtpSettings || {
                      host: 'smtp.gmail.com',
                      port: 587,
                      secure: false,
                      auth: {
                        user: 'your-email@gmail.com',
                        pass: 'your-app-password'
                      }
                    }, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleConfigChange('smtpSettings', parsed);
                      } catch (err) {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={6}
                    className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none font-mono text-sm"
                  />
                </div>
              )}
            </div>
          );



























      case 'double-click':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".file-item"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout || 10000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Delay (ms)</label>
              <input
                type="number"
                value={config.delay || 100}
                onChange={(e) => handleConfigChange('delay', parseInt(e.target.value))}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'right-click':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".context-target"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout || 10000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'hover':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".tooltip-trigger"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout || 10000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (ms)</label>
              <input
                type="number"
                value={config.duration || 500}
                onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'scroll':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
              <select
                value={config.direction || 'down'}
                onChange={(e) => handleConfigChange('direction', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
              >
                <option value="down" className="bg-slate-800">Down</option>
                <option value="up" className="bg-slate-800">Up</option>
                <option value="left" className="bg-slate-800">Left</option>
                <option value="right" className="bg-slate-800">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (pixels)</label>
              <input
                type="number"
                value={config.amount || 500}
                onChange={(e) => handleConfigChange('amount', parseInt(e.target.value))}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="smooth"
                checked={config.smooth || false}
                onChange={(e) => handleConfigChange('smooth', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="smooth" className="text-sm text-gray-300">
                Smooth scroll
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element (optional)</label>
              <input
                type="text"
                value={config.element || ''}
                onChange={(e) => handleConfigChange('element', e.target.value)}
                placeholder="Leave empty to scroll page"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );
      case 'select-dropdown':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dropdown Selector *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.selector || ''}
                  onChange={(e) => handleConfigChange('selector', e.target.value)}
                  placeholder="select[name='country'] or #dropdown-id"
                  className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-colors">
                  <Crosshair className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Value to Select *
              </label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder="Option value or visible text"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selection Method
              </label>
              <select
                value={config.byValue ? 'value' : 'text'}
                onChange={(e) => handleConfigChange('byValue', e.target.value === 'value')}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
              >
                <option value="value" className="bg-slate-800">By Value Attribute</option>
                <option value="text" className="bg-slate-800">By Visible Text</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="searchable"
                checked={config.searchable || false}
                onChange={(e) => handleConfigChange('searchable', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="searchable" className="text-sm text-gray-300">
                Searchable dropdown (type to filter)
              </label>
            </div>
          </div>
        );

      case 'pdf-generate':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                PDF File Name *
              </label>
              <input
                type="text"
                value={config.fileName || ''}
                onChange={(e) => handleConfigChange('fileName', e.target.value)}
                placeholder="report.pdf or document-{timestamp}.pdf"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use {'{'}timestamp{'}'} for unique file names
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                PDF Options
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="fullPage"
                    checked={config.fullPage || false}
                    onChange={(e) => handleConfigChange('fullPage', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="fullPage" className="text-sm text-gray-300">
                    Capture full page (including content below fold)
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="landscape"
                    checked={config.landscape || false}
                    onChange={(e) => handleConfigChange('landscape', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="landscape" className="text-sm text-gray-300">
                    Landscape orientation
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quality (1-100)
              </label>
              <input
                type="number"
                value={config.quality || 80}
                onChange={(e) => handleConfigChange('quality', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'send-email':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Recipient Email *
              </label>
              <input
                type="email"
                value={config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)}
                placeholder="recipient@example.com"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                placeholder="Email subject line"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Email message content..."
                rows={4}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attachments (optional)
              </label>
              <input
                type="text"
                value={config.attachments || ''}
                onChange={(e) => handleConfigChange('attachments', e.target.value)}
                placeholder="file1.pdf,file2.jpg (comma-separated)"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'send-notification':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Bell className="w-4 h-4 inline mr-2" />
                Notification Title *
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Notification title"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Notification message..."
                rows={3}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Type
              </label>
              <select
                value={config.type || 'info'}
                onChange={(e) => handleConfigChange('type', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white bg-transparent"
              >
                <option value="info" className="bg-slate-800">Information</option>
                <option value="success" className="bg-slate-800">Success</option>
                <option value="warning" className="bg-slate-800">Warning</option>
                <option value="error" className="bg-slate-800">Error</option>
              </select>
            </div>
          </div>
        );

      // ⬇️ Add these missing cases inside the `switch (type) { ... }` of PropertiesPanel.jsx
// Sidebar action IDs reference: :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3}

      case 'clear-type':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.selector || ''}
                  onChange={(e) => handleConfigChange('selector', e.target.value)}
                  placeholder="#input-id or .input-class"
                  className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-colors">
                  <Crosshair className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Text to Type *</label>
              <textarea
                value={config.text || ''}
                onChange={(e) => handleConfigChange('text', e.target.value)}
                placeholder="Enter the text to type..."
                rows={3}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Typing Speed (ms/char)</label>
              <input
                type="number"
                value={config.speed ?? 50}
                onChange={(e) => handleConfigChange('speed', parseInt(e.target.value))}
                min="0" max="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="clearFirst"
                checked={config.clearFirst !== false}
                onChange={(e) => handleConfigChange('clearFirst', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="clearFirst" className="text-sm text-gray-300">Clear field before typing</label>
            </div>
          </div>
        );

      case 'press-key':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key *</label>
              <input
                type="text"
                value={config.key || 'Enter'}
                onChange={(e) => handleConfigChange('key', e.target.value)}
                placeholder="Enter, Tab, Escape, Ctrl+s, ArrowDown"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Modifiers (optional)</label>
              <input
                type="text"
                value={config.modifiers || ''}
                onChange={(e) => handleConfigChange('modifiers', e.target.value)}
                placeholder="Ctrl, Alt, Shift (comma separated)"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'check-checkbox':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Checkbox Selector *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.selector || ''}
                  onChange={(e) => handleConfigChange('selector', e.target.value)}
                  placeholder='input[type="checkbox"] or #agree'
                  className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
                <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-colors">
                  <Crosshair className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
              <select
                value={config.action || 'check'}
                onChange={(e) => handleConfigChange('action', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
              >
                <option value="check" className="bg-slate-800">Check</option>
                <option value="uncheck" className="bg-slate-800">Uncheck</option>
                <option value="toggle" className="bg-slate-800">Toggle</option>
              </select>
            </div>
          </div>
        );

      case 'radio-select':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Radio Selector *</label>
              <input
                type="text"
                value={config.selector || 'input[name="groupName"]'}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder='input[name="gender"]'
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value *</label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder='male, female, etc.'
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'download-trigger': // :contentReference[oaicite:4]{index=4}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Download Path</label>
              <input
                type="text"
                value={config.downloadPath || './downloads'}
                onChange={(e) => handleConfigChange('downloadPath', e.target.value)}
                placeholder="./downloads"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trigger Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".download-btn or a[download]"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout ?? 15000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                min="1000" max="300000" step="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'download-verify': // :contentReference[oaicite:5]{index=5}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Download Folder *</label>
              <input
                type="text"
                value={config.downloadPath || './downloads'}
                onChange={(e) => handleConfigChange('downloadPath', e.target.value)}
                placeholder="./downloads"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Expected File Name / Pattern</label>
              <input
                type="text"
                value={config.fileName || ''}
                onChange={(e) => handleConfigChange('fileName', e.target.value)}
                placeholder="report.pdf or *.pdf"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  value={config.timeout ?? 60000}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  min="5000" max="300000"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Min File Size (bytes)</label>
                <input
                  type="number"
                  value={config.fileSize ?? 0}
                  onChange={(e) => handleConfigChange('fileSize', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="checkContent"
                checked={config.checkContent || false}
                onChange={(e) => handleConfigChange('checkContent', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="checkContent" className="text-sm text-gray-300">Perform content verification</label>
            </div>
          </div>
        );

      case 'file-monitor': // :contentReference[oaicite:6]{index=6}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Folder Path *</label>
              <input
                type="text"
                value={config.folderPath || './downloads'}
                onChange={(e) => handleConfigChange('folderPath', e.target.value)}
                placeholder="./downloads"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pattern</label>
              <input
                type="text"
                value={config.pattern || '*'}
                onChange={(e) => handleConfigChange('pattern', e.target.value)}
                placeholder="*.pdf"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  value={config.timeout ?? 60000}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  min="1000" max="300000"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                <select
                  value={config.action || 'newest'}
                  onChange={(e) => handleConfigChange('action', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
                >
                  <option value="newest" className="bg-slate-800">Pick newest</option>
                  <option value="oldest" className="bg-slate-800">Pick oldest</option>
                  <option value="all" className="bg-slate-800">Return all</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'cloud-upload': // :contentReference[oaicite:7]{index=7}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
              <select
                value={config.provider || 'onedrive'}
                onChange={(e) => handleConfigChange('provider', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
              >
                <option value="onedrive" className="bg-slate-800">OneDrive</option>
                <option value="gdrive" className="bg-slate-800">Google Drive</option>
                <option value="s3" className="bg-slate-800">Amazon S3</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Local Path *</label>
                <input
                  type="text"
                  value={config.localPath || ''}
                  onChange={(e) => handleConfigChange('localPath', e.target.value)}
                  placeholder="./documents/file.pdf"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Remote Path *</label>
                <input
                  type="text"
                  value={config.remotePath || '/uploads/'}
                  onChange={(e) => handleConfigChange('remotePath', e.target.value)}
                  placeholder="/uploads/"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="overwrite"
                checked={config.overwrite || false}
                onChange={(e) => handleConfigChange('overwrite', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="overwrite" className="text-sm text-gray-300">Overwrite if exists</label>
            </div>
          </div>
        );

      case 'extract-text': // :contentReference[oaicite:8]{index=8}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".title, #price, .item p"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Attribute (optional)</label>
                <input
                  type="text"
                  value={config.attribute || ''}
                  onChange={(e) => handleConfigChange('attribute', e.target.value)}
                  placeholder="href, src, value (leave empty for textContent)"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-3 mt-7">
                <input
                  type="checkbox"
                  id="allMatches"
                  checked={config.allMatches || false}
                  onChange={(e) => handleConfigChange('allMatches', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="allMatches" className="text-sm text-gray-300">Extract all matches (array)</label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="trim"
                checked={config.trim !== false}
                onChange={(e) => handleConfigChange('trim', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="trim" className="text-sm text-gray-300">Trim whitespace</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Save As</label>
              <input
                type="text"
                value={config.saveAs || 'text'}
                onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                placeholder="variableName"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'extract-table': // :contentReference[oaicite:9]{index=9}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Table Selector *</label>
              <input
                type="text"
                value={config.selector || 'table'}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".results-table or #pricing-table"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeHeaders"
                checked={config.includeHeaders !== false}
                onChange={(e) => handleConfigChange('includeHeaders', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="includeHeaders" className="text-sm text-gray-300">Include headers</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Save As</label>
              <input
                type="text"
                value={config.saveAs || 'tableData'}
                onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                placeholder="variableName"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'extract-links': // :contentReference[oaicite:10]{index=10}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Link Selector</label>
              <input
                type="text"
                value={config.selector || 'a'}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder='a, .nav a, a[href^="http"]'
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Attribute</label>
              <select
                value={config.attribute || 'href'}
                onChange={(e) => handleConfigChange('attribute', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
              >
                <option value="href" className="bg-slate-800">href</option>
                <option value="title" className="bg-slate-800">title</option>
                <option value="text" className="bg-slate-800">textContent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Save As</label>
              <input
                type="text"
                value={config.saveAs || 'links'}
                onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                placeholder="variableName"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'screenshot': // :contentReference[oaicite:11]{index=11}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filename *</label>
              <input
                type="text"
                value={config.fileName || 'screenshot.png'}
                onChange={(e) => handleConfigChange('fileName', e.target.value)}
                placeholder="screenshot_{timestamp}.png"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fullPage"
                checked={config.fullPage || false}
                onChange={(e) => handleConfigChange('fullPage', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="fullPage" className="text-sm text-gray-300">Capture full page</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector (optional)</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".main-content"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'screenshot': // :contentReference[oaicite:11]{index=11}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filename *</label>
              <input
                type="text"
                value={config.fileName || 'screenshot.png'}
                onChange={(e) => handleConfigChange('fileName', e.target.value)}
                placeholder="screenshot_{timestamp}.png"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fullPage"
                checked={config.fullPage || false}
                onChange={(e) => handleConfigChange('fullPage', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="fullPage" className="text-sm text-gray-300">Capture full page</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector (optional)</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".main-content"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'pdf-generate': // (present in Sidebar) :contentReference[oaicite:12]{index=12}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">File Name *</label>
              <input
                type="text"
                value={config.fileName || 'page.pdf'}
                onChange={(e) => handleConfigChange('fileName', e.target.value)}
                placeholder="report_{timestamp}.pdf"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fullPage"
                checked={config.fullPage !== false}
                onChange={(e) => handleConfigChange('fullPage', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="fullPage" className="text-sm text-gray-300">Include entire page</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quality (1-100)</label>
              <input
                type="number"
                value={config.quality ?? 90}
                onChange={(e) => handleConfigChange('quality', parseInt(e.target.value))}
                min="1" max="100"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'condition': // :contentReference[oaicite:13]{index=13}
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Condition Type</label>
                <select
                  value={config.type || 'elementExists'}
                  onChange={(e) => handleConfigChange('type', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
                >
                  <option value="elementExists" className="bg-slate-800">elementExists</option>
                  <option value="textContains" className="bg-slate-800">textContains</option>
                  <option value="equals" className="bg-slate-800">equals</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Operator</label>
                <select
                  value={config.operator || 'equals'}
                  onChange={(e) => handleConfigChange('operator', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
                >
                  <option value="equals" className="bg-slate-800">equals</option>
                  <option value="contains" className="bg-slate-800">contains</option>
                  <option value="not" className="bg-slate-800">not</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Selector (optional)</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".status or #message"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value (optional)</label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder="Expected value/text"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Then Action</label>
                <input
                  type="text"
                  value={config.thenAction || ''}
                  onChange={(e) => handleConfigChange('thenAction', e.target.value)}
                  placeholder="action id or label"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Else Action</label>
                <input
                  type="text"
                  value={config.elseAction || ''}
                  onChange={(e) => handleConfigChange('elseAction', e.target.value)}
                  placeholder="action id or label"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        );

      case 'loop': // :contentReference[oaicite:14]{index=14}
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Loop Type</label>
                <select
                  value={config.type || 'count'}
                  onChange={(e) => handleConfigChange('type', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
                >
                  <option value="count" className="bg-slate-800">count</option>
                  <option value="while" className="bg-slate-800">while</option>
                  <option value="foreach" className="bg-slate-800">foreach</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Count</label>
                <input
                  type="number"
                  value={config.count ?? 1}
                  onChange={(e) => handleConfigChange('count', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Iterations</label>
                <input
                  type="number"
                  value={config.maxIterations ?? 100}
                  onChange={(e) => handleConfigChange('maxIterations', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Break Condition (optional)</label>
              <input
                type="text"
                value={config.breakCondition || ''}
                onChange={(e) => handleConfigChange('breakCondition', e.target.value)}
                placeholder="counter > items.length"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'try-catch': // :contentReference[oaicite:15]{index=15}
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="continueOnError"
                checked={config.continueOnError !== false}
                onChange={(e) => handleConfigChange('continueOnError', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="continueOnError" className="text-sm text-gray-300">Continue on error</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="logErrors"
                checked={config.logErrors !== false}
                onChange={(e) => handleConfigChange('logErrors', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="logErrors" className="text-sm text-gray-300">Log error details</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fallback Action (optional)</label>
              <input
                type="text"
                value={config.fallbackAction || ''}
                onChange={(e) => handleConfigChange('fallbackAction', e.target.value)}
                placeholder="retry / skip / custom"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'refresh':
      case 'back':    // :contentReference[oaicite:17]{index=17}
      case 'forward': // :contentReference[oaicite:18]{index=18}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout ?? 10000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                min="1000" max="60000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'javascript': // :contentReference[oaicite:19]{index=19}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Code *</label>
              <textarea
                value={config.code || ''}
                onChange={(e) => handleConfigChange('code', e.target.value)}
                placeholder="// your JS here"
                rows={6}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="returnValue"
                checked={config.returnValue || false}
                onChange={(e) => handleConfigChange('returnValue', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="returnValue" className="text-sm text-gray-300">Capture return value</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Save As (optional)</label>
              <input
                type="text"
                value={config.saveAs || ''}
                onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                placeholder="variableName"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'api-call': // :contentReference[oaicite:20]{index=20}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="https://api.example.com/data"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Method</label>
                <select
                  value={config.method || 'GET'}
                  onChange={(e) => handleConfigChange('method', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
                >
                  <option value="GET" className="bg-slate-800">GET</option>
                  <option value="POST" className="bg-slate-800">POST</option>
                  <option value="PUT" className="bg-slate-800">PUT</option>
                  <option value="DELETE" className="bg-slate-800">DELETE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Save As</label>
                <input
                  type="text"
                  value={config.saveAs || 'response'}
                  onChange={(e) => handleConfigChange('saveAs', e.target.value)}
                  placeholder="variableName"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Headers (JSON)</label>
              <textarea
                value={config.headers || '{ }'}
                onChange={(e) => handleConfigChange('headers', e.target.value)}
                placeholder='{"Authorization":"Bearer ..."}'
                rows={3}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Body (JSON)</label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                placeholder='{"key":"value"}'
                rows={4}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        );

      case 'wait-time': // :contentReference[oaicite:21]{index=21}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (ms)</label>
              <input
                type="number"
                value={config.duration ?? 2000}
                onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
                min="0" max="300000" step="100"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="randomDelay"
                  checked={config.randomDelay || false}
                  onChange={(e) => handleConfigChange('randomDelay', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="randomDelay" className="text-sm text-gray-300">Randomize delay</label>
              </div>
              {config.randomDelay && (
                <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min (ms)</label>
                    <input
                      type="number"
                      value={config.minDelay ?? 1000}
                      onChange={(e) => handleConfigChange('minDelay', parseInt(e.target.value))}
                      min="0"
                      className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max (ms)</label>
                    <input
                      type="number"
                      value={config.maxDelay ?? 3000}
                      onChange={(e) => handleConfigChange('maxDelay', parseInt(e.target.value))}
                      min="0"
                      className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'wait-disappear': // :contentReference[oaicite:22]{index=22}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".loading, #modal"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout ?? 30000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                min="1000" max="300000" step="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'wait-text': // :contentReference[oaicite:23]{index=23}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder=".status or #message"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Expected Text *</label>
              <input
                type="text"
                value={config.expectedText || ''}
                onChange={(e) => handleConfigChange('expectedText', e.target.value)}
                placeholder="Success"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="exact"
                  checked={config.exact || false}
                  onChange={(e) => handleConfigChange('exact', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="exact" className="text-sm text-gray-300">Exact match</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout ?? 30000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                min="1000" max="300000" step="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'wait-clickable': // :contentReference[oaicite:24]{index=24}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element Selector *</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => handleConfigChange('selector', e.target.value)}
                placeholder="#submit-button"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout ?? 30000}
                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                min="1000" max="300000" step="1000"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
              />
            </div>
          </div>
        );

      case 'wait-page-load': // :contentReference[oaicite:25]{index=25}
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wait For</label>
                <select
                  value={config.waitFor || 'networkidle'}
                  onChange={(e) => handleConfigChange('waitFor', e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
                >
                  <option value="networkidle" className="bg-slate-800">networkidle</option>
                  <option value="domcontentloaded" className="bg-slate-800">domcontentloaded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  value={config.timeout ?? 30000}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  min="1000" max="120000" step="1000"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'notification': // Sidebar id uses 'notification' (map to send-notification help) :contentReference[oaicite:26]{index=26}
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Task Complete"
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Automation finished successfully"
                rows={3}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={config.type || 'info'}
                onChange={(e) => handleConfigChange('type', e.target.value)}
                className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 bg-transparent focus:border-blue-400/50 focus:outline-none text-white"
              >
                <option value="info" className="bg-slate-800">info</option>
                <option value="success" className="bg-slate-800">success</option>
                <option value="warning" className="bg-slate-800">warning</option>
                <option value="error" className="bg-slate-800">error</option>
              </select>
            </div>
          </div>
        );
  

      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Properties for "{type}" will be available soon.</p>
            <p className="text-xs text-gray-500 mt-2">This action type is recognized but configuration UI is pending.</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      className="w-96 glass-effect border-l border-white/10 overflow-y-auto custom-scrollbar"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Step Configuration
        </h3>
        {selectedStepData && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">{selectedStepData.icon}</span>
            <span className="text-gray-300">{selectedStepData.name}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      {selectedStepData && (
        <div className="flex border-b border-white/10">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'config'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'help'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('help')}
          >
            Help & Guide
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'config' ? (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderProperties()}
            </motion.div>
          ) : (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {selectedStepData && (
                <div className="space-y-4">
                  <div className="glass-dark rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">
                      {getStepHelp(selectedStepData.type).title}
                    </h4>
                    <p className="text-sm text-gray-300 mb-4">
                      {getStepHelp(selectedStepData.type).description}
                    </p>
                    
                    {Object.entries(getStepHelp(selectedStepData.type).fields).length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Field Descriptions:</h5>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {Object.entries(getStepHelp(selectedStepData.type).fields).map(([field, description]) => (
                            <li key={field}>
                              <strong className="text-blue-300">{field}:</strong> {description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {getStepHelp(selectedStepData.type).examples.length > 0 && (
                    <div className="glass-dark rounded-lg p-4">
                      <h4 className="font-semibold text-green-300 mb-2">Examples:</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {getStepHelp(selectedStepData.type).examples.map((example, i) => (
                          <li key={i} className="font-mono bg-black/30 px-2 py-1 rounded">
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {selectedStepData && activeTab === 'config' && (
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-2">
            <motion.button
              onClick={handleSaveConfig}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-2 rounded-xl text-white font-medium flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              Save
            </motion.button>
            
            <motion.button
              onClick={handleResetConfig}
              className="px-4 py-2 glass-effect hover:bg-white/20 rounded-xl text-gray-300 hover:text-white flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PropertiesPanel;
