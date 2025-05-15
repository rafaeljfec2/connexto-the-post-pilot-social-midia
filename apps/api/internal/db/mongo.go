package db

import (
	"context"
	"log"
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
		uri := os.Getenv("MONGO_URL")
		if uri == "" {
			log.Println("MONGO_URL não encontrada, usando URI padrão:", defaultMongoURI)
			uri = defaultMongoURI
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Cria cliente com a URI
		client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err != nil {
			log.Printf("Erro ao conectar no MongoDB: %v", err)
			clientInstanceErr = err
			return
		}

		// Testa a conexão com Ping
		if err := client.Ping(ctx, nil); err != nil {
			log.Printf("Erro ao fazer ping no MongoDB: %v", err)
			clientInstanceErr = err
			return
		}

		log.Println("✅ Conectado com sucesso ao MongoDB Atlas!")
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
		log.Printf("MONGO_DB não encontrado, usando banco padrão: %s", defaultDBName)
		dbName = defaultDBName
	} else {
		log.Printf("Usando banco de dados: %s", dbName)
	}
	return client.Database(dbName), nil
}
