package app

import (
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.Engine, handler *AuthHandler) {
	auth := r.Group("/api/v1/auth")
	auth.POST("/register", handler.Register)
	auth.POST("/login", handler.Login)
	auth.POST("/social", handler.SocialLogin)
	auth.POST("/refresh", handler.RefreshToken)
}
