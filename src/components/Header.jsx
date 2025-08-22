import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Play, 
  Save, 
  Upload, 
  Crosshair, 
  Sparkles,
  Zap,
  CheckCircle,
  Trash2,
  Settings,
  Download,
  FileText,
  Pause,
  Square,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkflowStore } from '../store/workflowStore';

const Header = ({ 
  onGenerateCode, 
  onOpenElementPicker, 
  onValidateWorkflow, 
  onClearWorkflow,
  onSaveWorkflow,
  onLoadWorkflow 
}) => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [testResults, setTestResults] = useState([]);
  const [canCancelTest, setCanCancelTest] = useState(false);
  
  const { workflow, validateWorkflow, exportWorkflow, importWorkflow } = useWorkflowStore();

  // **✅ COMPLETE TEST RUN IMPLEMENTATION**
  const handleTestRun = async () => {
    if (workflow.length === 0) {
      toast.error('❌ No workflow to test! Add some actions first.', {
        icon: '⚠️',
        duration: 4000
      });
      return;
    }

    // Validate workflow before running
    const validation = validateWorkflow();
    if (!validation.isValid) {
      toast.error(`❌ Cannot run test: Found ${validation.errors.length} errors`, {
        icon: '🚫',
        duration: 5000
      });
      
      // Show validation details
      validation.errors.forEach((error, index) => {
        setTimeout(() => {
          toast.error(error, { duration: 4000 });
        }, index * 1000);
      });
      return;
    }

    // Start test execution
    setIsTestRunning(true);
    setCanCancelTest(true);
    setCurrentStepIndex(0);
    setTestResults([]);
    
    const enabledSteps = workflow.filter(step => step.enabled);
    const totalSteps = enabledSteps.length;

    toast.loading(`🧪 Starting test run (${totalSteps} steps)...`, { 
      id: 'test-run-status',
      duration: 2000 
    });

    try {
      const results = [];
      
      // Execute each step with proper simulation
      for (let i = 0; i < enabledSteps.length; i++) {
        if (!canCancelTest) break; // Check for cancellation
        
        const step = enabledSteps[i];
        setCurrentStepIndex(i);
        
        toast.loading(`⏳ Executing Step ${i + 1}/${totalSteps}: ${step.name}`, { 
          id: 'test-run-status' 
        });

        const stepResult = await simulateStepExecution(step, i + 1);
        results.push(stepResult);

        if (stepResult.status === 'success') {
          toast.success(`✅ Step ${i + 1}: ${step.name} completed`, {
            duration: 2000
          });
          await new Promise(resolve => setTimeout(resolve, 800));
        } else {
          toast.error(`❌ Step ${i + 1} failed: ${stepResult.error}`, {
            duration: 4000
          });
          const shouldContinue = await showErrorDialog(step, { message: stepResult.error });
          if (!shouldContinue) break;
        }
      }

      // Test completion
      setTestResults(results);
      const successCount = results.filter(r => r.status === 'success').length;
      const failCount = results.filter(r => r.status === 'failed').length;
      
      if (failCount === 0) {
        toast.success(`🎉 Test completed successfully! ${successCount}/${totalSteps} steps passed`, { 
          id: 'test-run-status',
          duration: 5000 
        });
      } else {
        toast.error(`⚠️ Test completed with issues: ${successCount} passed, ${failCount} failed`, { 
          id: 'test-run-status',
          duration: 5000 
        });
      }

      // Show detailed results
      setTimeout(() => {
        showTestResults(results);
      }, 1000);

    } catch (error) {
      // This catch block is for errors outside of individual step execution
      toast.error('❌ Test run failed: ' + error.message, { 
        id: 'test-run-status',
        duration: 5000 
      });
      console.error('Test run error:', error);
    } finally {
      setIsTestRunning(false);
      setCanCancelTest(false);
      setCurrentStepIndex(-1);
    }
  };

  // **STEP SIMULATION FUNCTION**
  const simulateStepExecution = async (step, stepNumber) => {
    const startTime = Date.now();
    
    try {
      switch (step.type) {
        case 'navigate':
          if (!step.config.url) {
            throw new Error('URL is required for navigation');
          }
          // Simulate navigation delay
          await simulateDelay(1500, 3000);
          console.log(`🌐 Simulated navigation to: ${step.config.url}`);
          break;

        case 'wait-time':
          const waitTime = step.config.duration || 2000;
          console.log(`⏰ Simulated wait for ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 3000))); // Cap simulation wait
          break;

        case 'click':
          if (!step.config.selector) {
            throw new Error('Element selector is required for click action');
          }
          await simulateDelay(500, 1200);
          console.log(`🖱️ Simulated click on: ${step.config.selector}`);
          break;

        case 'type':
          if (!step.config.selector || !step.config.text) {
            throw new Error('Both selector and text are required for type action');
          }
          const typingTime = Math.min(step.config.text.length * (step.config.speed || 50), 2000);
          await new Promise(resolve => setTimeout(resolve, typingTime));
          console.log(`⌨️ Simulated typing "${step.config.text}" into: ${step.config.selector}`);
          break;

        case 'select-dropdown':
          if (!step.config.selector || !step.config.value) {
            throw new Error('Both selector and value are required for dropdown selection');
          }
          await simulateDelay(600, 1000);
          console.log(`📋 Simulated dropdown selection: ${step.config.value} in ${step.config.selector}`);
          break;

        case 'screenshot':
          await simulateDelay(800, 1500);
          console.log(`📸 Simulated screenshot: ${step.config.fileName || 'screenshot.png'}`);
          break;

        case 'download-verify':
          await simulateDelay(1000, 2000);
          console.log(`📥 Simulated download verification: ${step.config.fileName || 'any file'}`);
          break;

        case 'extract-text':
          if (!step.config.selector) {
            throw new Error('Element selector is required for text extraction');
          }
          await simulateDelay(400, 800);
          console.log(`📝 Simulated text extraction from: ${step.config.selector}`);
          break;

        case 'pdf-generate':
          await simulateDelay(2000, 4000);
          console.log(`📄 Simulated PDF generation: ${step.config.fileName || 'document.pdf'}`);
          break;

        case 'send-email':
          if (!step.config.to || !step.config.subject) {
            throw new Error('Recipient and subject are required for email');
          }
          await simulateDelay(1500, 2500);
          console.log(`📧 Simulated email sent to: ${step.config.to}`);
          break;

        case 'send-notification':
          if (!step.config.title || !step.config.message) {
            throw new Error('Title and message are required for notification');
          }
          await simulateDelay(300, 600);
          console.log(`🔔 Simulated notification: ${step.config.title}`);
          break;

        default:
          await simulateDelay(500, 1000);
          console.log(`⚙️ Simulated execution of: ${step.name}`);
          break;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        stepIndex: stepNumber,
        stepName: step.name,
        stepType: step.type,
        status: 'success',
        duration: duration,
        config: step.config,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        stepIndex: stepNumber,
        stepName: step.name,
        stepType: step.type,
        status: 'failed',
        duration: duration,
        error: error.message,
        config: step.config,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Helper function for realistic delays
  const simulateDelay = (min, max) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  };

  // Error dialog for test failures
  const showErrorDialog = (step, error) => {
    return new Promise((resolve) => {
      const shouldContinue = confirm(
        `❌ Step "${step.name}" failed:\n\n${error.message}\n\nDo you want to continue with the remaining steps?`
      );
      resolve(shouldContinue);
    });
  };

  // Show detailed test results
  const showTestResults = (results) => {
    const summary = results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      acc.totalDuration += result.duration || 0;
      return acc;
    }, { success: 0, failed: 0, totalDuration: 0 });

    const resultsMessage = `
📊 Test Results Summary:
✅ Passed: ${summary.success}
❌ Failed: ${summary.failed}
⏱️ Total Duration: ${(summary.totalDuration / 1000).toFixed(2)}s
📝 Total Steps: ${results.length}

${results.map(r => 
  `${r.status === 'success' ? '✅' : '❌'} Step ${r.stepIndex}: ${r.stepName} (${(r.duration / 1000).toFixed(2)}s)`
).join('\n')}
    `;

    console.log(resultsMessage);
    
    // Show results in a more user-friendly way
    toast.success('📊 Test results logged to console. Check browser DevTools!', {
      duration: 5000
    });
  };

  // Cancel test run
  const handleCancelTest = () => {
    if (canCancelTest) {
      setCanCancelTest(false);
      toast.error('🛑 Test run cancelled by user', {
        id: 'test-run-status',
        duration: 3000
      });
    }
  };

  // **WORKING SAVE/LOAD FUNCTIONS**
  const handleSaveWorkflow = () => {
    if (workflow.length === 0) {
      toast.error('❌ No workflow to save!');
      return;
    }

    try {
      const workflowData = exportWorkflow();
      const dataStr = JSON.stringify(workflowData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `automation-workflow-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success(`💾 Workflow saved! (${workflow.length} steps)`);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('❌ Failed to save workflow');
    }
  };

  const handleLoadWorkflow = () => {
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
            if (result.skipped > 0) {
              toast.warning(`⚠️ Skipped ${result.skipped} invalid steps`);
            }
          } else {
            toast.error(`❌ Failed to load workflow: ${result.error}`);
          }
        } catch (error) {
          toast.error('❌ Invalid workflow file format');
          console.error('Error loading workflow:', error);
        }
      };
      reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  return (
    <motion.header 
      className="glass-effect border-b border-white/10 px-6 py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              IQBA Automation Studio Pro
            </h1>
            <p className="text-xs text-gray-400">
              {isTestRunning ? `Testing Step ${currentStepIndex + 1}...` : 'Visual Web Automation Builder'}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Element Picker */}
          <motion.button
            className="glass-effect px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenElementPicker}
            disabled={isTestRunning}
          >
            <Crosshair className="w-4 h-4" />
            Element Picker
          </motion.button>

          {/* Validate */}
          <motion.button
            className="glass-effect px-4 py-2 rounded-xl hover:bg-green-500/20 hover:border-green-400/50 transition-all duration-300 flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onValidateWorkflow}
            disabled={isTestRunning}
          >
            <CheckCircle className="w-4 h-4" />
            Validate
          </motion.button>

          {/* Clear Workflow */}
          <motion.button
            className="glass-effect px-4 py-2 rounded-xl hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearWorkflow}
            disabled={isTestRunning}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </motion.button>

          {/* Save Workflow */}
          <motion.button
            className="glass-effect px-4 py-2 rounded-xl hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveWorkflow}
            disabled={isTestRunning}
          >
            <Save className="w-4 h-4" />
            Save
          </motion.button>

          {/* Load Workflow */}
          <motion.button
            className="glass-effect px-4 py-2 rounded-xl hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoadWorkflow}
            disabled={isTestRunning}
          >
            <Upload className="w-4 h-4" />
            Load
          </motion.button>

          {/* Generate Code */}
          <motion.button
            className="gradient-button px-6 py-2 rounded-xl text-white font-medium flex items-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGenerateCode}
            disabled={isTestRunning}
          >
            <Code className="w-4 h-4" />
            Generate Code
          </motion.button>

          {/* Test Run Button - ENHANCED */}
          {!isTestRunning ? (
            <motion.button
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2 transform transition-all duration-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTestRun}
            >
              <Play className="w-4 h-4" />
              Test Run
            </motion.button>
          ) : (
            <motion.button
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelTest}
            >
              <Square className="w-4 h-4" />
              Cancel
            </motion.button>
          )}
        </div>
      </div>

      {/* Test Progress Bar */}
      {isTestRunning && (
        <motion.div 
          className="mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Test Progress</span>
            <span>{currentStepIndex + 1} / {workflow.filter(s => s.enabled).length}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStepIndex + 1) / workflow.filter(s => s.enabled).length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
