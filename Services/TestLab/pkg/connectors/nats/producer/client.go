package producer

import (
	"encoding/json"
	"fmt"

	"github.com/nats-io/nats.go"

	config "automator/services/testlab/pkg/config"
	log "automator/services/testlab/pkg/utils/loggers"
)

// NATSProducer defines the interface for NATS message publishing
type NATSProducer interface {
	PublishMessage(subject string, data interface{}) error
	Close()
}

// NATSClient implements the NATSProducer interface
type NATSClient struct {
	conn *nats.Conn
}

// NewNATSClient creates a new NATS client for publishing messages
func NewNATSClient(config *config.Config) (*NATSClient, error) {
	// Connect to NATS server
	natsURL := fmt.Sprintf("nats://%s:%s", config.NATS.Host, config.NATS.Port)
	log.Info("Connecting to NATS server at %s", natsURL)

	opts := []nats.Option{nats.Name("TestLab Service")}

	// Add authentication if credentials are provided
	if config.NATS.User != "" && config.NATS.Password != "" {
		opts = append(opts, nats.UserInfo(config.NATS.User, config.NATS.Password))
	}

	// Add reconnection options
	opts = append(opts, nats.ReconnectWait(5))
	opts = append(opts, nats.MaxReconnects(10))
	opts = append(opts, nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
		log.Warn("NATS disconnected: %v", err)
	}))
	opts = append(opts, nats.ReconnectHandler(func(nc *nats.Conn) {
		log.Info("NATS reconnected to %s", nc.ConnectedUrl())
	}))
	opts = append(opts, nats.ClosedHandler(func(nc *nats.Conn) {
		log.Warn("NATS connection closed")
	}))

	conn, err := nats.Connect(natsURL, opts...)
	if err != nil {
		log.Error("Failed to connect to NATS: %v", err)
		return nil, err
	}

	log.Info("Successfully connected to NATS server")
	return &NATSClient{conn: conn}, nil
}

// PublishMessage publishes a message to the specified NATS subject
func (c *NATSClient) PublishMessage(subject string, data interface{}) error {
	// Convert data to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Error("Failed to marshal message data: %v", err)
		return err
	}

	// Publish message
	log.Debug("Publishing message to subject: %s", subject)
	err = c.conn.Publish(subject, jsonData)
	if err != nil {
		log.Error("Failed to publish message: %v", err)
		return err
	}

	log.Debug("Message published successfully to subject: %s", subject)
	return nil
}

// Close closes the NATS connection
func (c *NATSClient) Close() {
	if c.conn != nil {
		log.Info("Closing NATS connection")
		c.conn.Close()
	}
}
