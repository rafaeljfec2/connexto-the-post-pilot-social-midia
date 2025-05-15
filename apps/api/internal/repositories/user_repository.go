package repositories

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/models"
)

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindBySocialProvider(ctx context.Context, provider models.AuthProvider, providerId string) (*models.User, error)
	Create(ctx context.Context, user *models.User) error
	Update(ctx context.Context, user *models.User) error
	FindByID(ctx context.Context, id string) (*models.User, error)
}

type userRepository struct {
	collection *mongo.Collection
}

func NewUserRepository() (UserRepository, error) {
	database, err := db.GetDatabase()
	if err != nil {
		return nil, err
	}
	return &userRepository{
		collection: database.Collection("users"),
	}, nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *userRepository) FindBySocialProvider(ctx context.Context, provider models.AuthProvider, providerId string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"socialAccounts": bson.M{"$elemMatch": bson.M{"provider": provider, "providerId": providerId}}}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	user.ID = primitive.NewObjectID()
	user.CreatedAt = time.Now().UTC()
	user.UpdatedAt = user.CreatedAt
	_, err := r.collection.InsertOne(ctx, user)
	return err
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now().UTC()
	if user.ID.IsZero() {
		return errors.New("user ID is required")
	}
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": user.ID}, user)
	return err
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	var user models.User
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}
