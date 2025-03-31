"""
NATS Consumer for browser automation.
Handles incoming messages from the NATS server.
"""

import asyncio
import json
import logging
from typing import Callable, Dict, Any, Optional

import nats
from nats.aio.client import Client as NATS
from nats.aio.errors import ErrConnectionClosed, ErrTimeout, ErrNoServers

from browser_automation.config.settings import NATS_CONFIG, NATS_SUBJECT, NATS_QUEUE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NatsConsumer:
    """
    NATS Consumer class for handling incoming messages.
    """
    
    def __init__(self, servers: list[str] = NATS_CONFIG["servers"]):
        """
        Initialize the NATS consumer.
        
        Args:
            servers: List of NATS server URLs
        """
        self.servers = servers
        self.nc: Optional[NATS] = None
        self.subscription = None
        self.callback_handler = None
        
    async def connect(self) -> bool:
        """
        Connect to the NATS server.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            self.nc = NATS()
            await self.nc.connect(
                servers=self.servers,
                connect_timeout=NATS_CONFIG["connection_timeout"],
                max_reconnect_attempts=NATS_CONFIG["max_reconnect_attempts"],
                reconnect_time_wait=NATS_CONFIG["reconnect_time_wait"]
            )
            logger.info(f"Connected to NATS servers: {self.servers}")
            return True
        except ErrNoServers as e:
            logger.error(f"Could not connect to any NATS server: {e}")
            return False
        except Exception as e:
            logger.error(f"Error connecting to NATS: {e}")
            return False
    
    async def subscribe(self, callback: Callable[[Dict[str, Any]], None]) -> bool:
        """
        Subscribe to the configured NATS subject with the specified queue.
        
        Args:
            callback: Function to call when a message is received
            
        Returns:
            bool: True if subscription successful, False otherwise
        """
        if not self.nc:
            logger.error("Not connected to NATS server")
            return False
        
        try:
            self.callback_handler = callback
            
            async def message_handler(msg):
                subject = msg.subject
                data = msg.data.decode()
                logger.info(f"Received message on {subject}: {data}")
                
                try:
                    # Parse the message data as JSON
                    message_data = json.loads(data)
                    # Call the provided callback with the message data
                    await self.callback_handler(message_data)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse message as JSON: {data}")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
            
            # Subscribe to the subject with the queue group
            self.subscription = await self.nc.subscribe(
                NATS_SUBJECT, 
                queue=NATS_QUEUE,
                cb=message_handler
            )
            
            logger.info(f"Subscribed to {NATS_SUBJECT} with queue {NATS_QUEUE}")
            return True
        except Exception as e:
            logger.error(f"Error subscribing to NATS: {e}")
            return False
    
    async def unsubscribe(self) -> bool:
        """
        Unsubscribe from the NATS subject.
        
        Returns:
            bool: True if unsubscription successful, False otherwise
        """
        if not self.subscription:
            logger.warning("No active subscription to unsubscribe from")
            return False
        
        try:
            await self.subscription.unsubscribe()
            self.subscription = None
            logger.info("Unsubscribed from NATS subject")
            return True
        except Exception as e:
            logger.error(f"Error unsubscribing from NATS: {e}")
            return False
    
    async def disconnect(self) -> bool:
        """
        Disconnect from the NATS server.
        
        Returns:
            bool: True if disconnection successful, False otherwise
        """
        if not self.nc:
            logger.warning("Not connected to NATS server")
            return False
        
        try:
            await self.nc.close()
            self.nc = None
            logger.info("Disconnected from NATS server")
            return True
        except Exception as e:
            logger.error(f"Error disconnecting from NATS: {e}")
            return False

    async def run(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """
        Connect to NATS, subscribe to the subject, and keep running.
        
        Args:
            callback: Function to call when a message is received
        """
        connected = await self.connect()
        if not connected:
            logger.error("Failed to connect to NATS server")
            return
        
        subscribed = await self.subscribe(callback)
        if not subscribed:
            logger.error("Failed to subscribe to NATS subject")
            await self.disconnect()
            return
        
        try:
            # Keep the consumer running
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt, shutting down...")
        except Exception as e:
            logger.error(f"Error in NATS consumer: {e}")
        finally:
            await self.unsubscribe()
            await self.disconnect()


# Example message handler function
async def handle_message(message_data: Dict[str, Any]) -> None:
    """
    Handle incoming messages from NATS.
    
    Args:
        message_data: The parsed JSON message data
    """
    logger.info(f"Processing message: {message_data}")
    # Add your message processing logic here
    # For example:
    if "testcase_id" in message_data:
        logger.info(f"Received test case execution: {message_data['testcase_id']}")
    
    # You can add more specific handling based on the message content


# Main execution block
if __name__ == "__main__":
    async def main():
        consumer = NatsConsumer()
        await consumer.run(handle_message)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Program interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")