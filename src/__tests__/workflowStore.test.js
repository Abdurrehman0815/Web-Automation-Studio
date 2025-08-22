import { renderHook, act } from '@testing-library/react';
import { useWorkflowStore } from '../store/workflowStore';

describe('WorkflowStore', () => {
  let result;
  
  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useWorkflowStore());
    result = hookResult;
    
    // Clear workflow before each test
    act(() => {
      result.current.clearWorkflow();
    });
  });

  describe('addStep', () => {
    test('should add a new step to workflow', () => {
      act(() => {
        const step = result.current.addStep('navigate');
        expect(step).toBeDefined();
        expect(step.type).toBe('navigate');
        expect(step.name).toBe('Navigate to URL');
        expect(step.enabled).toBe(true);
      });
      
      expect(result.current.workflow).toHaveLength(1);
      expect(result.current.selectedStep).toBeDefined();
    });

    test('should throw error for unknown action type', () => {
      expect(() => {
        act(() => {
          result.current.addStep('unknown-action');
        });
      }).toThrow('Unknown action type: unknown-action');
    });

    test('should assign correct order to multiple steps', () => {
      act(() => {
        result.current.addStep('navigate');
        result.current.addStep('wait-time');
        result.current.addStep('click');
      });
      
      const workflow = result.current.workflow;
      expect(workflow[0].order).toBe(0);
      expect(workflow[1].order).toBe(1);
      expect(workflow[2].order).toBe(2);
    });
  });

  describe('removeStep', () => {
    test('should remove step from workflow', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('navigate');
        stepId = step.id;
      });
      
      expect(result.current.workflow).toHaveLength(1);
      
      act(() => {
        result.current.removeStep(stepId);
      });
      
      expect(result.current.workflow).toHaveLength(0);
    });

    test('should clear selectedStep if removed step was selected', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('navigate');
        stepId = step.id;
      });
      
      expect(result.current.selectedStep).toBe(stepId);
      
      act(() => {
        result.current.removeStep(stepId);
      });
      
      expect(result.current.selectedStep).toBeNull();
    });
  });

  describe('updateStep', () => {
    test('should update step configuration', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('navigate');
        stepId = step.id;
      });
      
      act(() => {
        result.current.updateStep(stepId, {
          config: { url: 'https://example.com' }
        });
      });
      
      const updatedStep = result.current.workflow.find(s => s.id === stepId);
      expect(updatedStep.config.url).toBe('https://example.com');
      expect(updatedStep.updatedAt).toBeDefined();
    });
  });

  describe('selectStep', () => {
    test('should select existing step', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('navigate');
        stepId = step.id;
      });
      
      act(() => {
        result.current.selectStep(stepId);
      });
      
      expect(result.current.selectedStep).toBe(stepId);
    });

    test('should not select non-existent step', () => {
      act(() => {
        result.current.selectStep('non-existent-id');
      });
      
      expect(result.current.selectedStep).toBeNull();
    });
  });

  describe('toggleStep', () => {
    test('should toggle step enabled status', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('navigate');
        stepId = step.id;
      });
      
      const initialStep = result.current.workflow.find(s => s.id === stepId);
      expect(initialStep.enabled).toBe(true);
      
      act(() => {
        result.current.toggleStep(stepId);
      });
      
      const toggledStep = result.current.workflow.find(s => s.id === stepId);
      expect(toggledStep.enabled).toBe(false);
      
      act(() => {
        result.current.toggleStep(stepId);
      });
      
      const reToggledStep = result.current.workflow.find(s => s.id === stepId);
      expect(reToggledStep.enabled).toBe(true);
    });
  });

  describe('duplicateStep', () => {
    test('should create duplicate of existing step', () => {
      let originalStepId;
      act(() => {
        const step = result.current.addStep('navigate');
        result.current.updateStep(step.id, {
          config: { url: 'https://example.com' }
        });
        originalStepId = step.id;
      });
      
      let duplicatedStep;
      act(() => {
        duplicatedStep = result.current.duplicateStep(originalStepId);
      });
      
      expect(duplicatedStep).toBeDefined();
      expect(duplicatedStep.id).not.toBe(originalStepId);
      expect(duplicatedStep.name).toContain('(Copy)');
      expect(duplicatedStep.config.url).toBe('https://example.com');
      expect(result.current.workflow).toHaveLength(2);
    });

    test('should return null for non-existent step', () => {
      let result_duplicate;
      act(() => {
        result_duplicate = result.current.duplicateStep('non-existent-id');
      });
      
      expect(result_duplicate).toBeNull();
    });
  });

  describe('reorderSteps', () => {
    test('should reorder steps correctly', () => {
      let step1Id, step2Id, step3Id;
      act(() => {
        const step1 = result.current.addStep('navigate');
        const step2 = result.current.addStep('wait-time');
        const step3 = result.current.addStep('click');
        step1Id = step1.id;
        step2Id = step2.id;
        step3Id = step3.id;
      });
      
      // Move first step to last position
      act(() => {
        result.current.reorderSteps(0, 2);
      });
      
      const workflow = result.current.workflow;
      expect(workflow[0].id).toBe(step2Id);
      expect(workflow[1].id).toBe(step3Id);
      expect(workflow[2].id).toBe(step1Id);
      
      // Check order properties are updated
      expect(workflow[0].order).toBe(0);
      expect(workflow[1].order).toBe(1);
      expect(workflow[2].order).toBe(2);
    });

    test('should handle invalid indices gracefully', () => {
      act(() => {
        result.current.addStep('navigate');
        result.current.addStep('wait-time');
      });
      
      const originalWorkflow = [...result.current.workflow];
      
      act(() => {
        result.current.reorderSteps(-1, 1); // Invalid old index
        result.current.reorderSteps(0, 5);  // Invalid new index
        result.current.reorderSteps(5, 0);  // Invalid old index
      });
      
      // Workflow should remain unchanged
      expect(result.current.workflow).toEqual(originalWorkflow);
    });
  });

  describe('clearWorkflow', () => {
    test('should clear entire workflow', () => {
      act(() => {
        result.current.addStep('navigate');
        result.current.addStep('wait-time');
        result.current.addStep('click');
      });
      
      expect(result.current.workflow).toHaveLength(3);
      
      act(() => {
        result.current.clearWorkflow();
      });
      
      expect(result.current.workflow).toHaveLength(0);
      expect(result.current.selectedStep).toBeNull();
    });
  });

  describe('validateWorkflow', () => {
    test('should return error for empty workflow', () => {
      const validation = result.current.validateWorkflow();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Workflow is empty');
    });

    test('should validate navigate step configuration', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('navigate');
        stepId = step.id;
      });
      
      // Test without URL
      let validation = result.current.validateWorkflow();
      expect(validation.errors.some(e => e.includes('Navigation URL is required'))).toBe(true);
      
      // Test with invalid URL
      act(() => {
        result.current.updateStep(stepId, {
          config: { url: 'invalid-url' }
        });
      });
      
      validation = result.current.validateWorkflow();
      expect(validation.errors.some(e => e.includes('URL must start with http'))).toBe(true);
      
      // Test with valid URL
      act(() => {
        result.current.updateStep(stepId, {
          config: { url: 'https://example.com' }
        });
      });
      
      validation = result.current.validateWorkflow();
      expect(validation.isValid).toBe(true);
    });

    test('should validate wait-time step configuration', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('wait-time');
        stepId = step.id;
      });
      
      // Test with invalid duration
      act(() => {
        result.current.updateStep(stepId, {
          config: { duration: 50 } // Too short
        });
      });
      
      const validation = result.current.validateWorkflow();
      expect(validation.errors.some(e => e.includes('Wait duration must be at least 100ms'))).toBe(true);
    });

    test('should identify disabled steps as warnings', () => {
      let stepId;
      act(() => {
        const step = result.current.addStep('navigate');
        stepId = step.id;
        result.current.updateStep(stepId, {
          config: { url: 'https://example.com' }
        });
        result.current.toggleStep(stepId); // Disable the step
      });
      
      const validation = result.current.validateWorkflow();
      expect(validation.warnings.some(w => w.includes('is disabled'))).toBe(true);
    });
  });

  describe('exportWorkflow', () => {
    test('should export workflow with metadata', () => {
      act(() => {
        result.current.addStep('navigate');
        result.current.addStep('wait-time');
        result.current.addStep('click');
      });
      
      const exported = result.current.exportWorkflow();
      
      expect(exported.name).toBe('Automation Workflow');
      expect(exported.version).toBe('1.0.0');
      expect(exported.steps).toHaveLength(3);
      expect(exported.metadata.totalSteps).toBe(3);
      expect(exported.metadata.enabledSteps).toBe(3);
      expect(exported.metadata.generator).toBe('IQBA Web Automation Studio Pro');
    });
  });

  describe('importWorkflow', () => {
    test('should import valid workflow data', () => {
      const workflowData = {
        name: 'Test Workflow',
        steps: [
          {
            type: 'navigate',
            name: 'Navigate to URL',
            icon: '🌐',
            config: { url: 'https://example.com' },
            enabled: true
          },
          {
            type: 'wait-time',
            name: 'Wait Fixed Time',
            icon: '⏰',
            config: { duration: 2000 },
            enabled: true
          }
        ]
      };
      
      let importResult;
      act(() => {
        importResult = result.current.importWorkflow(workflowData);
      });
      
      expect(importResult.success).toBe(true);
      expect(importResult.imported).toBe(2);
      expect(result.current.workflow).toHaveLength(2);
    });

    test('should handle invalid workflow data gracefully', () => {
      const invalidData = {
        steps: [
          { type: 'invalid-type', name: 'Invalid Step' },
          { name: 'Missing Type' }, // Missing required type
        ]
      };
      
      let importResult;
      act(() => {
        importResult = result.current.importWorkflow(invalidData);
      });
      
      expect(importResult.success).toBe(true);
      expect(importResult.imported).toBe(0); // No valid steps imported
      expect(importResult.skipped).toBe(2);
    });
  });

  describe('getStats', () => {
    test('should return comprehensive workflow statistics', () => {
      act(() => {
        result.current.addStep('navigate');
        result.current.addStep('wait-time');
        result.current.addStep('wait-time'); // Duplicate type
        result.current.addStep('click');
        
        // Disable one step
        const workflow = result.current.workflow;
        result.current.toggleStep(workflow[1].id);
      });
      
      const stats = result.current.getStats();
      
      expect(stats.totalSteps).toBe(4);
      expect(stats.enabledSteps).toBe(3);
      expect(stats.disabledSteps).toBe(1);
      expect(stats.stepTypes['wait-time']).toBe(2);
      expect(stats.stepTypes['navigate']).toBe(1);
      expect(stats.stepTypes['click']).toBe(1);
      expect(stats.hasNavigation).toBe(true);
      expect(stats.hasWaits).toBe(true);
      expect(stats.hasInteractions).toBe(true);
      expect(stats.mostUsedStepType).toBe('wait-time');
    });
  });

  describe('bulk operations', () => {
    test('should enable all steps', () => {
      act(() => {
        result.current.addStep('navigate');
        result.current.addStep('wait-time');
        result.current.addStep('click');
        
        // Disable all steps first
        result.current.workflow.forEach(step => {
          result.current.toggleStep(step.id);
        });
      });
      
      expect(result.current.workflow.every(s => !s.enabled)).toBe(true);
      
      act(() => {
        result.current.enableAllSteps();
      });
      
      expect(result.current.workflow.every(s => s.enabled)).toBe(true);
    });

    test('should disable all steps', () => {
      act(() => {
        result.current.addStep('navigate');
        result.current.addStep('wait-time');
        result.current.addStep('click');
      });
      
      expect(result.current.workflow.every(s => s.enabled)).toBe(true);
      
      act(() => {
        result.current.disableAllSteps();
      });
      
      expect(result.current.workflow.every(s => !s.enabled)).toBe(true);
    });
  });
});

// Integration Tests
describe('WorkflowStore Integration', () => {
  test('should handle complex workflow operations', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    act(() => {
      // Build a complex workflow
      const nav = result.current.addStep('navigate');
      result.current.updateStep(nav.id, {
        config: { url: 'https://example.com' }
      });
      
      const wait = result.current.addStep('wait-element');
      result.current.updateStep(wait.id, {
        config: { selector: '#loadingIndicator' }
      });
      
      const click = result.current.addStep('click');
      result.current.updateStep(click.id, {
        config: { selector: '#submitButton' }
      });
      
      const type = result.current.addStep('type');
      result.current.updateStep(type.id, {
        config: { selector: '#inputField', text: 'test data' }
      });
    });
    
    // Validate the complete workflow
    const validation = result.current.validateWorkflow();
    expect(validation.isValid).toBe(true);
    expect(validation.totalSteps).toBe(4);
    expect(validation.enabledSteps).toBe(4);
    
    // Export and reimport
    const exported = result.current.exportWorkflow();
    
    act(() => {
      result.current.clearWorkflow();
    });
    
    expect(result.current.workflow).toHaveLength(0);
    
    act(() => {
      const importResult = result.current.importWorkflow(exported);
      expect(importResult.success).toBe(true);
      expect(importResult.imported).toBe(4);
    });
    
    expect(result.current.workflow).toHaveLength(4);
    
    // Verify workflow integrity after import
    const finalValidation = result.current.validateWorkflow();
    expect(finalValidation.isValid).toBe(true);
  });
});
