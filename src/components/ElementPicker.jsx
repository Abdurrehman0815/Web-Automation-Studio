import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crosshair, ExternalLink, Copy, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const ElementPicker = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [selectedElements, setSelectedElements] = useState([]);

  const openPicker = () => {
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      const pickerWindow = window.open(url, 'ElementPicker', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      
      if (!pickerWindow) {
        toast.error('Popup blocked. Please allow popups for this site.');
        return;
      }

      // Inject picker script after page loads
      pickerWindow.addEventListener('load', () => {
        injectPickerScript(pickerWindow);
      });

      toast.success('Element picker opened! Hover and click elements to select them.');
      
    } catch (error) {
      toast.error('Failed to open element picker: ' + error.message);
    }
  };

  const injectPickerScript = (targetWindow) => {
    try {
      const script = targetWindow.document.createElement('script');
      script.textContent = getPickerScript();
      targetWindow.document.head.appendChild(script);
      
      const styles = targetWindow.document.createElement('style');
      styles.textContent = getPickerStyles();
      targetWindow.document.head.appendChild(styles);
      
    } catch (error) {
      console.error('Failed to inject picker script:', error);
      showManualInstructions();
    }
  };

  const getPickerScript = () => {
    return `
      (function() {
        let isActive = true;
        let highlighted = null;
        let tooltip = null;

        // Create tooltip
        tooltip = document.createElement('div');
        tooltip.id = 'element-picker-tooltip';
        tooltip.style.cssText = \`
          position: fixed;
          background: #1f2937;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-family: monospace;
          z-index: 999999;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid #3b82f6;
        \`;
        document.body.appendChild(tooltip);

        // Generate selector
        function generateSelector(element) {
          if (element.id) return '#' + element.id;
          
          if (element.className) {
            const classes = element.className.split(' ').filter(c => c.length > 0);
            if (classes.length > 0) return '.' + classes.join('.');
          }
          
          // Generate CSS path
          let path = [];
          let current = element;
          
          while (current && current.nodeType === Node.ELEMENT_NODE) {
            let selector = current.nodeName.toLowerCase();
            
            if (current.id) {
              selector += '#' + current.id;
              path.unshift(selector);
              break;
            } else {
              let sibling = current;
              let nth = 1;
              while (sibling = sibling.previousElementSibling) {
                if (sibling.nodeName.toLowerCase() === selector) nth++;
              }
              if (nth !== 1) selector += \`:nth-of-type(\${nth})\`;
            }
            
            path.unshift(selector);
            current = current.parentNode;
          }
          
          return path.join(' > ');
        }

        function handleMouseMove(e) {
          if (!isActive) return;
          
          if (highlighted) {
            highlighted.style.outline = '';
          }
          
          highlighted = e.target;
          e.target.style.outline = '2px solid #3b82f6';
          
          const selector = generateSelector(e.target);
          tooltip.innerHTML = \`
            <strong>\${e.target.tagName.toLowerCase()}</strong><br>
            <code>\${selector}</code><br>
            <em>Click to copy</em>
          \`;
          
          tooltip.style.left = (e.clientX + 10) + 'px';
          tooltip.style.top = (e.clientY + 10) + 'px';
        }

        function handleClick(e) {
          if (!isActive) return;
          
          e.preventDefault();
          e.stopPropagation();
          
          const selector = generateSelector(e.target);
          
          // Try to send to parent window
          try {
            navigator.clipboard.writeText(selector).then(() => {
              alert('Selector copied: ' + selector);
            });
          } catch (err) {
            prompt('Copy this selector:', selector);
          }
        }

        function handleKeyPress(e) {
          if (e.key === 'Escape') {
            cleanup();
            window.close();
          }
        }

        function cleanup() {
          isActive = false;
          if (highlighted) highlighted.style.outline = '';
          if (tooltip) tooltip.remove();
          
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('click', handleClick);
          document.removeEventListener('keydown', handleKeyPress);
        }

        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyPress);

        // Show instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = \`
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 999998;
          font-family: system-ui;
          border: 1px solid #3b82f6;
        \`;
        instructions.innerHTML = '🎯 Element Picker Active - Hover to inspect, click to copy selector. Press ESC to exit.';
        document.body.appendChild(instructions);
        
        setTimeout(() => instructions.remove(), 4000);
      })();
    `;
  };

  const getPickerStyles = () => {
    return `
      .element-picker-active * {
        cursor: crosshair !important;
      }
    `;
  };

  const showManualInstructions = () => {
    toast.error('Automatic picker failed. Use browser DevTools to inspect elements manually.');
  };

  const copySelector = (selector) => {
    navigator.clipboard.writeText(selector);
    toast.success('Selector copied to clipboard!');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass w-full max-w-2xl rounded-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crosshair className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">Element Picker</h2>
                <p className="text-blue-100 text-sm">Find CSS selectors visually</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">How to use:</h3>
          <ol className="text-gray-300 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              Enter the website URL you want to inspect
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              Click "Open Picker" to launch the element inspector
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              Hover over elements to see their selectors
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">4.</span>
              Click on any element to copy its CSS selector
            </li>
          </ol>
        </div>

        {/* URL Input */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:border-blue-400/50 focus:outline-none text-white placeholder-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              className="btn-gradient px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openPicker}
            >
              <ExternalLink className="w-4 h-4" />
              Open Picker
            </motion.button>
            
            <motion.button
              className="glass px-4 py-3 rounded-xl hover:bg-white/20 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                toast.info('Manual mode: Use browser DevTools to inspect elements');
              }}
            >
              <Eye className="w-4 h-4" />
              Manual Mode
            </motion.button>
          </div>
        </div>

        {/* Tips */}
        <div className="p-6 bg-slate-800/30 border-t border-white/10">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Tips</h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• ID selectors (#id) are most reliable</li>
            <li>• Class selectors (.class) are good for styling-based elements</li>
            <li>• CSS paths work but may break if page structure changes</li>
            <li>• Test selectors in browser console: document.querySelector('your-selector')</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ElementPicker;
