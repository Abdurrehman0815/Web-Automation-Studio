import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Book, 
  Code, 
  MousePointer, 
  Search,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const HelpGuide = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      icon: Book,
      content: [
        {
          type: 'heading',
          level: 1,
          text: 'Getting Started with Web Automation Studio'
        },
        {
          type: 'heading',
          level: 2,
          text: 'What is Web Automation Studio?'
        },
        {
          type: 'paragraph',
          text: 'Web Automation Studio is a visual tool for creating automated web workflows without coding. You can automate repetitive tasks like:'
        },
        {
          type: 'list',
          items: [
            'Filling forms automatically',
            'Downloading files from websites',
            'Extracting data from web pages',
            'Taking screenshots of pages',
            'Sending emails and notifications',
            'And much more!'
          ]
        },
        {
          type: 'heading',
          level: 2,
          text: 'How to Create Your First Workflow'
        },
        {
          type: 'heading',
          level: 3,
          text: 'Step 1: Add Actions'
        },
        {
          type: 'list',
          items: [
            'Look at the Action Library on the left sidebar',
            'Drag any action (like "Navigate to URL") to the Workflow Designer in the center',
            'The action will appear as a step in your workflow'
          ]
        },
        {
          type: 'heading',
          level: 3,
          text: 'Step 2: Configure Actions'
        },
        {
          type: 'list',
          items: [
            'Click on any step in your workflow to select it',
            'The Properties Panel on the right will show configuration options',
            'Fill in the required information (URLs, selectors, text, etc.)'
          ]
        },
        {
          type: 'heading',
          level: 3,
          text: 'Step 3: Test Your Workflow'
        },
        {
          type: 'list',
          items: [
            'Click the "Test Run" button in the header',
            'Watch your automation run step by step',
            'Fix any errors and test again'
          ]
        },
        {
          type: 'heading',
          level: 3,
          text: 'Step 4: Generate Code'
        },
        {
          type: 'list',
          items: [
            'Click "Generate Code" to create the actual automation script',
            'Choose your preferred language (Puppeteer, Selenium, Playwright)',
            'Download and run the generated code'
          ]
        }
      ]
    },
    'selectors': {
      title: 'CSS Selectors & XPath Guide',
      icon: MousePointer,
      content: [
        {
          type: 'heading',
          level: 1,
          text: 'Finding Elements: CSS Selectors & XPath Guide'
        },
        {
          type: 'heading',
          level: 2,
          text: 'What are Selectors?'
        },
        {
          type: 'paragraph',
          text: 'Selectors are used to identify specific elements on a web page that you want to interact with (click, type into, extract text from, etc.).'
        },
        {
          type: 'heading',
          level: 2,
          text: 'CSS Selectors (Recommended)'
        },
        {
          type: 'heading',
          level: 3,
          text: 'By ID (Most Reliable)'
        },
        {
          type: 'code-block',
          language: 'css',
          code: '#submit-button     /* Element with id="submit-button" */\n#login-form       /* Element with id="login-form" */'
        },
        {
          type: 'heading',
          level: 3,
          text: 'By Class'
        },
        {
          type: 'code-block',
          language: 'css',
          code: '.button           /* Element with class="button" */\n.primary-btn      /* Element with class="primary-btn" */\n.form-control     /* Element with class="form-control" */'
        },
        {
          type: 'heading',
          level: 3,
          text: 'By Attributes'
        },
        {
          type: 'code-block',
          language: 'css',
          code: '[name="username"]     /* Input with name="username" */\n[type="password"]     /* Input with type="password" */\n[data-testid="btn"]   /* Element with data-testid="btn" */'
        },
        {
          type: 'heading',
          level: 2,
          text: 'How to Find Selectors'
        },
        {
          type: 'heading',
          level: 3,
          text: 'Method 1: Browser DevTools (Recommended)'
        },
        {
          type: 'list',
          items: [
            'Right-click on the element you want to interact with',
            'Select "Inspect Element" from the menu',
            'The element will be highlighted in the developer tools',
            'Right-click on the highlighted HTML code',
            'Choose "Copy" → "Copy selector" for CSS selector'
          ]
        },
        {
          type: 'heading',
          level: 3,
          text: 'Method 2: Element Picker Tool'
        },
        {
          type: 'list',
          items: [
            'Click the "Element Picker" button in the header',
            'Enter the website URL and click "Open Picker"',
            'Hover over elements to see their selectors',
            'Click to copy the selector to your clipboard'
          ]
        }
      ]
    },
    'actions': {
      title: 'Available Actions Guide',
      icon: Code,
      content: [
        {
          type: 'heading',
          level: 1,
          text: 'Complete Actions Reference'
        },
        {
          type: 'heading',
          level: 2,
          text: 'Navigation & Page Control (🌐)'
        },
        {
          type: 'heading',
          level: 3,
          text: 'Navigate to URL'
        },
        {
          type: 'paragraph',
          text: 'Opens a web page in the browser'
        },
        {
          type: 'list',
          items: [
            'URL: The web address to visit',
            'Timeout: How long to wait for page load',
            'Example: https://google.com'
          ]
        },
        {
          type: 'heading',
          level: 2,
          text: 'User Interactions (🖱️)'
        },
        {
          type: 'heading',
          level: 3,
          text: 'Click Element'
        },
        {
          type: 'paragraph',
          text: 'Clicks on a specific element'
        },
        {
          type: 'list',
          items: [
            'Selector: Element to click',
            'Scroll to Element: Auto-scroll before clicking',
            'Example: #submit-button'
          ]
        },
        {
          type: 'heading',
          level: 3,
          text: 'Type Text'
        },
        {
          type: 'paragraph',
          text: 'Types text into an input field'
        },
        {
          type: 'list',
          items: [
            'Selector: Input field selector',
            'Text: Text to type',
            'Speed: Typing speed (ms per character)'
          ]
        }
      ]
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const filteredSections = Object.entries(sections).filter(([key, section]) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = (content) => {
    return content.map((item, index) => {
      switch (item.type) {
        case 'heading':
          const HeadingTag = `h${item.level}`;
          const headingStyles = {
            1: 'text-2xl font-bold text-white mb-4 mt-6',
            2: 'text-xl font-semibold text-blue-300 mb-3 mt-5',
            3: 'text-lg font-medium text-purple-300 mb-2 mt-4'
          };
          return React.createElement(
            HeadingTag,
            { 
              key: index, 
              className: headingStyles[item.level] 
            },
            item.text
          );

        case 'paragraph':
          return (
            <p key={index} className="mb-4 text-gray-300 leading-relaxed">
              {item.text}
            </p>
          );

        case 'list':
          return (
            <ul key={index} className="mb-4 space-y-2">
              {item.items.map((listItem, listIndex) => (
                <li key={listIndex} className="text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-2">•</span>
                  <span>{listItem}</span>
                </li>
              ))}
            </ul>
          );

        case 'code-block':
          return (
            <pre key={index} className="bg-slate-900 p-4 rounded-lg mb-4 overflow-x-auto">
              <code className="text-cyan-300 text-sm">
                {item.code}
              </code>
            </pre>
          );

        default:
          return null;
      }
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-effect w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Help & Documentation</h2>
                <p className="text-blue-100">Complete guide to web automation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-200" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-white/10 p-6 overflow-y-auto custom-scrollbar">
            <h3 className="font-semibold text-gray-300 mb-4">Documentation Sections</h3>
            <div className="space-y-2">
              {filteredSections.map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeSection === key
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.title}</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                    activeSection === key ? 'rotate-90' : ''
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="prose prose-invert max-w-none"
              >
                <div className="text-gray-300 leading-relaxed">
                  {sections[activeSection] && renderContent(sections[activeSection].content)}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HelpGuide;
