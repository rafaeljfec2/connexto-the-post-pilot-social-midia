package services

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/postpilot/api/internal/models"
	"github.com/postpilot/api/internal/repositories"
)

type AuthService interface {
	Register(ctx context.Context, name, email, password string) (*models.User, error)
	Login(ctx context.Context, email, password string) (*models.User, string, error)
	GenerateJWT(user *models.User) (string, error)
	// Social login
	LoginWithSocial(ctx context.Context, provider models.AuthProvider, providerId, email, name, avatarUrl string) (*models.User, string, error)
	// Refresh token
	GenerateRefreshToken(user *models.User) (string, error)
	ValidateRefreshToken(tokenStr string) (string, error)
	RefreshJWT(refreshToken string) (string, error)
	// Novos métodos
	GetUserByID(ctx context.Context, id string) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) error
}

type authService struct {
	repo          repositories.UserRepository
	jwtSecret     string
	jwtExpiration time.Duration
}

func NewAuthService(repo repositories.UserRepository) AuthService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}
	exp := 24 * time.Hour
	if v := os.Getenv("JWT_EXPIRATION"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			exp = d
		}
	}
	return &authService{
		repo:          repo,
		jwtSecret:     secret,
		jwtExpiration: exp,
	}
}

func (s *authService) Register(ctx context.Context, name, email, password string) (*models.User, error) {
	existing, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("email already registered")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user := &models.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hash),
		Provider:     models.AuthProviderLocal,
		ProviderId:   "",
	}
	err = s.repo.Create(ctx, user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *authService) Login(ctx context.Context, email, password string) (*models.User, string, error) {
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", errors.New("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}
	token, err := s.GenerateJWT(user)
	if err != nil {
		return nil, "", err
	}
	return user, token, nil
}

func (s *authService) GenerateJWT(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID.Hex(),
		"email": user.Email,
		"name":  user.Name,
		"exp":   time.Now().Add(s.jwtExpiration).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *authService) LoginWithSocial(ctx context.Context, provider models.AuthProvider, providerId, email, name, avatarUrl string) (*models.User, string, error) {
	user, err := s.repo.FindBySocialProvider(ctx, provider, providerId)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		// Novo usuário
		user = &models.User{
			Name:       name,
			Email:      email,
			AvatarUrl:  avatarUrl,
			Provider:   provider,
			ProviderId: providerId,
		}
		err = s.repo.Create(ctx, user)
		if err != nil {
			return nil, "", err
		}
	} else {
		// Atualiza dados básicos se necessário
		user.Name = name
		user.AvatarUrl = avatarUrl
		user.Provider = provider
		user.ProviderId = providerId
		err = s.repo.Update(ctx, user)
		if err != nil {
			return nil, "", err
		}
	}
	token, err := s.GenerateJWT(user)
	if err != nil {
		return nil, "", err
	}
	return user, token, nil
}

func (s *authService) GenerateRefreshToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.ID.Hex(),
		"type": "refresh",
		"exp":  time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 dias
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *authService) ValidateRefreshToken(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("invalid refresh token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["type"] != "refresh" {
		return "", errors.New("invalid refresh token type")
	}
	userId, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("invalid refresh token sub")
	}
	return userId, nil
}

func (s *authService) RefreshJWT(refreshToken string) (string, error) {
	userId, err := s.ValidateRefreshToken(refreshToken)
	if err != nil {
		return "", err
	}
	ctx := context.Background()
	user, err := s.repo.FindByID(ctx, userId)
	if err != nil || user == nil {
		return "", errors.New("user not found")
	}
	return s.GenerateJWT(user)
}

func (s *authService) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *authService) UpdateUser(ctx context.Context, user *models.User) error {
	return s.repo.Update(ctx, user)
}
