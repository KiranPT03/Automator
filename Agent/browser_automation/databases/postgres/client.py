"""
PostgreSQL client for database operations.
"""
import logging
import psycopg2
from psycopg2 import pool
from ...config.settings import POSTGRES_CONFIG

logger = logging.getLogger(__name__)

class PostgresClient:
    """
    Client for PostgreSQL database operations.
    """
    _connection_pool = None
    
    @classmethod
    def initialize_pool(cls):
        """Initialize the connection pool if it doesn't exist."""
        if cls._connection_pool is None:
            try:
                cls._connection_pool = pool.ThreadedConnectionPool(
                    POSTGRES_CONFIG["min_connections"],
                    POSTGRES_CONFIG["max_connections"],
                    host=POSTGRES_CONFIG["host"],
                    port=POSTGRES_CONFIG["port"],
                    database=POSTGRES_CONFIG["database"],
                    user=POSTGRES_CONFIG["user"],
                    password=POSTGRES_CONFIG["password"],
                    connect_timeout=POSTGRES_CONFIG["connection_timeout"]
                )
                logger.info("PostgreSQL connection pool initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing PostgreSQL connection pool: {e}")
                raise
    
    @classmethod
    def get_connection(cls):
        """Get a connection from the pool."""
        if cls._connection_pool is None:
            cls.initialize_pool()
        return cls._connection_pool.getconn()
    
    @classmethod
    def release_connection(cls, conn):
        """Release a connection back to the pool."""
        if cls._connection_pool is not None:
            cls._connection_pool.putconn(conn)
    
    @classmethod
    def close_pool(cls):
        """Close all connections in the pool."""
        if cls._connection_pool is not None:
            cls._connection_pool.closeall()
            cls._connection_pool = None
            logger.info("PostgreSQL connection pool closed")
    
    def __init__(self):
        """Initialize the PostgreSQL client."""
        self.initialize_pool()
    
    def execute_query(self, query, params=None, fetch=True):
        """
        Execute a SQL query with optional parameters.
        
        Args:
            query: SQL query string
            params: Optional parameters for the query
            fetch: Whether to fetch results (True) or just execute (False)
            
        Returns:
            Query results if fetch=True, otherwise None
        """
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params or ())
            
            if fetch:
                result = cursor.fetchall()
                return result
            else:
                conn.commit()
                return None
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error executing query: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                self.release_connection(conn)
    
    def create_record(self, table, data):
        """
        Create a new record in the specified table.
        
        Args:
            table: Table name
            data: Dictionary of column names and values
            
        Returns:
            ID of the created record
        """
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["%s"] * len(data))
        values = list(data.values())
        
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders}) RETURNING id"
        
        result = self.execute_query(query, values)
        return result[0][0] if result else None
    
    def update_record(self, table, data, condition):
        """
        Update records in the specified table.
        
        Args:
            table: Table name
            data: Dictionary of column names and values to update
            condition: SQL WHERE condition string
            
        Returns:
            Number of updated records
        """
        set_clause = ", ".join([f"{key} = %s" for key in data.keys()])
        values = list(data.values())
        
        query = f"UPDATE {table} SET {set_clause} WHERE {condition}"
        
        # Execute without fetching results
        self.execute_query(query, values, fetch=False)
        
        # Since we're not returning IDs, we can't count them
        # Return None or another indicator that the update was executed
        return None
    
        result = self.execute_query(query, values)
        return len(result) if result else 0
    
    def get_record_by_id(self, table, record_id):
        """
        Get a record by its ID.
        
        Args:
            table: Table name
            record_id: ID of the record
            
        Returns:
            Record data as a tuple
        """
        query = f"SELECT * FROM {table} WHERE id = %s"
        result = self.execute_query(query, (record_id,))
        return result[0] if result else None
    
    def get_records(self, table, condition=None, params=None):
        """
        Get records from the specified table.
        
        Args:
            table: Table name
            condition: Optional SQL WHERE condition string
            params: Optional parameters for the condition
            
        Returns:
            List of records
        """
        query = f"SELECT * FROM {table}"
        if condition:
            query += f" WHERE {condition}"
        
        return self.execute_query(query, params)
    
    def delete_record(self, table, record_id):
        """
        Delete a record by its ID.
        
        Args:
            table: Table name
            record_id: ID of the record
            
        Returns:
            True if successful, False otherwise
        """
        query = f"DELETE FROM {table} WHERE id = %s RETURNING id"
        result = self.execute_query(query, (record_id,))
        return bool(result)