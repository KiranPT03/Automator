"""
Database utility functions for the browser automation project.
"""
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def update_test_step_status(postgres_client, step_id, status):
    """
    Update the status of a test step in the database.
    
    Args:
        postgres_client: PostgreSQL client instance
        step_id: ID of the test step to update (string UUID)
        status: New status for the test step
    """
    try:
        # Add logging to debug
        print(f"Updating step {step_id} status to {status}")
        
        # Don't convert step_id to int since it's a UUID string
        
        # SQL query to update the test step status
        query = """
        UPDATE test_steps
        SET status = %s, updated_at = NOW()
        WHERE id = %s
        """
        
        # Execute the query
        postgres_client.execute_query(query, (status, step_id))
        
        print(f"Successfully updated step {step_id} status to {status}")
        return True
    except Exception as e:
        print(f"Error updating test step status: {e}")
        return False