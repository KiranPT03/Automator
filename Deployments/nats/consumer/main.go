package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"
)

// Config holds the configuration for the NATS consumer.
type Config struct {
	Server       string   `yaml:"server"`
	StreamName   string   `yaml:"stream_name"`
	ConsumerName string   `yaml:"consumer_name"`
	Subjects     []string `yaml:"subjects"`
	QueueName    string   `yaml:"queue_name"`
}

// Consumer is the NATS consumer struct.
type Consumer struct {
	nc       *nats.Conn
	js       nats.JetStreamContext
	config   Config
	stopChan chan os.Signal
}

// NewConsumer creates a new NATS consumer instance.
func NewConsumer(config Config) (*Consumer, error) {
	nc, err := nats.Connect(config.Server)
	if err != nil {
		return nil, err
	}

	js, err := nc.JetStream()
	if err != nil {
		nc.Close() // Close the connection if JetStream fails
		return nil, err
	}

	c := &Consumer{
		nc:       nc,
		js:       js,
		config:   config,
		stopChan: make(chan os.Signal, 1),
	}

	return c, nil
}

// Start starts the NATS consumer.
func (c *Consumer) Start() error {
	// Create or ensure the stream exists
	_, err := c.js.AddStream(&nats.StreamConfig{
		Name:     c.config.StreamName,
		Subjects: c.config.Subjects,
		Storage:  nats.FileStorage,
	})

	if err != nil {
		log.Printf("Warning: stream may already exist: %v", err)
	}

	// Create or ensure the consumer exists
	_, err = c.js.AddConsumer(c.config.StreamName, &nats.ConsumerConfig{
		Durable:      c.config.ConsumerName,
		DeliverGroup: c.config.QueueName,
	})

	if err != nil {
		log.Printf("Warning: consumer may already exist: %v", err)
	}

	// Create queue subscriptions for each subject
	for _, subject := range c.config.Subjects {
		sub, err := c.js.QueueSubscribe(subject, c.config.QueueName, func(msg *nats.Msg) {
			log.Printf("Received message on subject %s: %s", msg.Subject, msg.Data)
			msg.Ack()
		})

		if err != nil {
			return err
		}
		defer sub.Unsubscribe()
	}

	log.Println("Consumer started.")

	// Handle graceful shutdown
	signal.Notify(c.stopChan, syscall.SIGINT, syscall.SIGTERM)
	<-c.stopChan

	log.Println("Consumer shutting down...")

	// Drain the connection to ensure messages are processed before closing.
	c.nc.Drain()

	log.Println("Consumer stopped.")

	return nil
}

// Stop stops the NATS consumer.
func (c *Consumer) Stop() {
	c.stopChan <- syscall.SIGTERM
}

// Close closes the NATS connection.
func (c *Consumer) Close() {
	if c.nc != nil {
		c.nc.Close()
	}
}
func main() {
	// Define your configuration
	config := Config{
		Server:       "nats://localhost:4222",
		StreamName:   "MY_STREAM",
		ConsumerName: "MY_CONSUMER",
		Subjects:     []string{"test_topic", "another_topic", "yet_another_topic"},
		QueueName:    "test_queue",
	}

	// Create the NATS consumer
	consumer, err := NewConsumer(config)
	if err != nil {
		log.Fatalf("Error creating NATS consumer: %v", err)
	}
	defer consumer.Close()

	// Start the consumer in a goroutine
	go func() {
		if err := consumer.Start(); err != nil {
			log.Fatalf("Consumer Start error: %v", err)
		}
	}()

	// Handle graceful shutdown
	signalCh := make(chan os.Signal, 1)
	signal.Notify(signalCh, syscall.SIGINT, syscall.SIGTERM)
	<-signalCh

	log.Println("Main: Received shutdown signal. Stopping consumer...")

	// Stop the consumer
	consumer.Stop()

	log.Println("Main: Consumer stopped. Exiting.")
}
