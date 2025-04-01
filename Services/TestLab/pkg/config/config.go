package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server   Server   `yaml:"server"`
	Logger   Logger   `yaml:"logger"`
	Postgres Postgres `yaml:"Postgres"`
	NATS     NATS     `yaml:"NATS"`
    ScreenshotsPath string `yaml:"screenshots_path"`
}

type Server struct {
	Port       string `yaml:"port"`
	ViewEngine string `yaml:"viewEngine"`
}

type Logger struct {
	Level    string `yaml:"level"`
	Filepath string `yaml:"filepath"`
}

type Postgres struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBname   string `yaml:"dbname"`
}

type NATS struct {
	Host     string `yaml:"host"`
	Port     string `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	err = yaml.Unmarshal(data, &cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}
