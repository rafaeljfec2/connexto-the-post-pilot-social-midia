package db

import (
	"context"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	clientInstance    *mongo.Client
	clientInstanceErr error
	mongoOnce         sync.Once
)

const (
	defaultMongoURI = "mongodb://localhost:27017"
	defaultDBName   = "thepostpilot"
)

// GetMongoClient returns a singleton MongoDB client
func GetMongoClient() (*mongo.Client, error) {
	mongoOnce.Do(func() {
		uri := os.Getenv("MONGO_URI")
		if uri == "" {
			uri = defaultMongoURI
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err != nil {
			clientInstanceErr = err
			return
		}
		clientInstance = client
		clientInstanceErr = nil
	})
	return clientInstance, clientInstanceErr
}

// GetDatabase returns the main application database
func GetDatabase() (*mongo.Database, error) {
	client, err := GetMongoClient()
	if err != nil {
		return nil, err
	}
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = defaultDBName
	}
	return client.Database(dbName), nil
}
