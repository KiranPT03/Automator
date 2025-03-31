"""
Pydantic models for test case data received from NATS consumer.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TestStep(BaseModel):
    """Model representing a test step within a test case."""
    stepId: str
    order: str
    description: str
    stepData: str
    stepStatus: str
    createdAt: str
    updatedAt: str


class TestCase(BaseModel):
    """Model representing a test case with its associated metadata and steps."""
    projectId: str
    projectName: str
    projectStatus: str
    moduleId: str
    moduleName: str
    moduleStatus: str
    testCaseId: str
    testCaseName: str
    testCaseStatus: str
    testCasePriority: str
    precondition: Optional[str] = None
    expectedResult: Optional[str] = None
    testSteps: List[TestStep]
    executionDateTime: str
    
    def get_prompts(self) -> List[str]:
        """
        Extract prompts from test steps.
        
        Returns:
            List[str]: List of prompts derived from test step descriptions
        """
        return [step.description for step in self.testSteps if step.description]