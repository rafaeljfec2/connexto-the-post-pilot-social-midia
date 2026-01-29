package repositories

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"go.uber.org/zap"
)

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindBySocialProvider(ctx context.Context, provider models.AuthProvider, providerId string) (*models.User, error)
	Create(ctx context.Context, user *models.User) error
	Update(ctx context.Context, user *models.User) error
	FindByID(ctx context.Context, id string) (*models.User, error)
	ClearLinkedInToken(ctx context.Context, userID primitive.ObjectID) error
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

// NewUserRepositoryWithDB creates a new UserRepository with injected database (for Wire DI)
func NewUserRepositoryWithDB(database *mongo.Database) UserRepository {
	return &userRepository{
		collection: database.Collection("users"),
	}
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	user := &models.User{}
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		log.Logger.Error("Failed to find user by email", zap.String("email", email), zap.Error(err))
		return nil, err
	}
	log.Logger.Info("User found by email", zap.String("userId", user.ID.Hex()), zap.String("email", email))
	return user, nil
}

func (r *userRepository) FindBySocialProvider(ctx context.Context, provider models.AuthProvider, providerId string) (*models.User, error) {
	user := &models.User{}
	err := r.collection.FindOne(ctx, bson.M{"provider": provider, "providerId": providerId}).Decode(user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		log.Logger.Error("Failed to find user by social provider", zap.String("provider", string(provider)), zap.String("providerId", providerId), zap.Error(err))
		return nil, err
	}
	log.Logger.Info("User found by social provider", zap.String("userId", user.ID.Hex()), zap.String("provider", string(provider)), zap.String("providerId", providerId))
	return user, nil
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	_, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		log.Logger.Error("Failed to create user", zap.String("email", user.Email), zap.Error(err))
		return err
	}
	log.Logger.Info("User created", zap.String("userId", user.ID.Hex()), zap.String("email", user.Email))
	return nil
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{"$set": user})
	if err != nil {
		log.Logger.Error("Failed to update user", zap.String("userId", user.ID.Hex()), zap.Error(err))
		return err
	}
	log.Logger.Info("User updated", zap.String("userId", user.ID.Hex()))
	return nil
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	user := &models.User{}
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Logger.Error("Invalid ID for ObjectID", zap.String("id", id), zap.Error(err))
		return nil, err
	}
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		log.Logger.Error("Failed to find user by ID", zap.String("userId", id), zap.Error(err))
		return nil, err
	}
	log.Logger.Info("User found by ID", zap.String("userId", user.ID.Hex()))
	return user, nil
}

func (r *userRepository) ClearLinkedInToken(ctx context.Context, userID primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": userID},
		bson.M{"$unset": bson.M{
			"linkedinAccessToken":  "",
			"linkedinRefreshToken": "",
			"linkedinPersonUrn":    "",
		}},
	)
	if err != nil {
		log.Logger.Error("Failed to clear LinkedIn token", zap.String("userId", userID.Hex()), zap.Error(err))
		return err
	}
	log.Logger.Info("LinkedIn token cleared", zap.String("userId", userID.Hex()))
	return nil
}
