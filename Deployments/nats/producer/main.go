package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

// Models
type RawProperty struct {
	PropertyRefID string `json:"referenceId"`
	Value         string `json:"value"`
}

type RawData struct {
	DeviceRefID string        `json:"deviceRefId"`
	Properties  []RawProperty `json:"properties"`
}

// Producer Config
type NatsProducerConfig struct {
	Servers []string
	Stream  string
	Subject string
}

// NatsProducer
type NatsProducer struct {
	js     nats.JetStreamContext
	nc     *nats.Conn
	config NatsProducerConfig
}

// NewNatsProducer
func NewNatsProducer(config NatsProducerConfig) (*NatsProducer, error) {
	np := &NatsProducer{
		config: config,
	}
	err := np.init()
	if err != nil {
		return nil, err
	}
	return np, nil
}

func (np *NatsProducer) init() error {
	var err error
	np.nc, err = nats.Connect(np.config.Servers[0])
	if err != nil {
		log.Printf("Error connecting to NATS: %v", err)
		return err
	}

	np.js, err = np.nc.JetStream()
	if err != nil {
		log.Printf("Error creating JetStream context: %v", err)
		return err
	}

	_, err = np.js.AddStream(&nats.StreamConfig{
		Name:     np.config.Stream,
		Subjects: []string{np.config.Subject},
		Storage:  nats.FileStorage,
	})

	if err != nil {
		log.Printf("Warning: stream may already exist: %v", err)
	}

	return nil
}

// Produce
func (np *NatsProducer) Produce(ctx context.Context, key, value []byte) error {
	_, err := np.js.Publish(np.config.Subject, value)
	if err != nil {
		log.Printf("Error publishing message to NATS: %v", err)
		return err
	}
	return nil
}

// Close
func (np *NatsProducer) Close() {
	if np.nc != nil {
		np.nc.Drain()
		np.nc.Close()
	}
	log.Println("NATS producer closed.")
}

func main() {
	// Configure the NATS producer
	producerConfig := NatsProducerConfig{
		Servers: []string{"nats://localhost:4222"}, // Replace with your NATS server address
		Stream:  "NATS_INGEST_STREAM",            // Replace with your inlet stream name
		Subject: "data.rawData",                        // Replace with your inlet subject
	}

	// Create the NATS producer
	producer, err := NewNatsProducer(producerConfig)
	if err != nil {
		log.Fatalf("Error creating NATS producer: %v", err)
	}
	defer producer.Close()

	// Publish the message to NATS
	ctx := context.Background()
	rawData2 := RawData{
		DeviceRefID: "ref-awtbwrc4w",
		Properties: []RawProperty{
			{
				PropertyRefID: "prop-ref-5zanfqn2m",
				Value:         "45",
			},
		},
	}

	jsonData2, err := json.Marshal(rawData2)

	if err != nil {
		log.Fatalf("Error marshaling JSON: %v", err)
	}

	err = producer.Produce(ctx, nil, jsonData2)

	if err != nil {
		log.Fatalf("Error producing message: %v", err)
	}

	time.Sleep(1 * time.Second) // Give some time for the message to be processed.
	log.Println("Second message published successfully!")
}
