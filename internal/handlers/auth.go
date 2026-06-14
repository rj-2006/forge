package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rj-2006/techtalk/internal/database"
	"github.com/rj-2006/techtalk/internal/middleware"
	"github.com/rj-2006/techtalk/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func issueAccessToken(user models.User) (string, error) {
	claims := &middleware.Claims{
		UserID:   user.ID,
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	secret := middleware.JWTSecret()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

func generateRandomToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func issueRefreshToken(userID uint, familyID string) (string, error) {
	token, err := generateRandomToken()
	if err != nil {
		return "", err
	}

	if familyID == "" {
		familyID, err = generateRandomToken()
		if err != nil {
			return "", err
		}
	}

	rt := models.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		FamilyID:  familyID,
	}

	if err := database.DB.Create(&rt).Error; err != nil {
		return "", err
	}

	return token, nil
}

func setRefreshTokenCookie(c *gin.Context, token string) {
	secure := os.Getenv("ENV") == "production" || os.Getenv("APP_ENV") == "production"
	c.SetCookie("refresh-token", token, int(7*24*time.Hour/time.Second), "/", "", secure, true)
}

func clearRefreshTokenCookie(c *gin.Context) {
	secure := os.Getenv("ENV") == "production" || os.Getenv("APP_ENV") == "production"
	c.SetCookie("refresh-token", "", -1, "/", "", secure, true)
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//hashing passwords

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user := models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	accessToken, err := issueAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token."})
		return
	}

	refreshToken, err := issueRefreshToken(user.ID, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate session."})
		return
	}

	setRefreshTokenCookie(c, refreshToken)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"token":   accessToken,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"avatar":   user.Avatar,
			"name":     user.Name,
			"bio":      user.Bio,
		},
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User

	if err := database.DB.Where("email=?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}

	accessToken, err := issueAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token."})
		return
	}

	refreshToken, err := issueRefreshToken(user.ID, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate session."})
		return
	}

	setRefreshTokenCookie(c, refreshToken)

	c.JSON(http.StatusOK, gin.H{
		"token": accessToken,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"avatar":   user.Avatar,
			"name":     user.Name,
			"bio":      user.Bio,
		},
	})
}

func GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User

	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User Not Found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"avatar":   user.Avatar,
			"name":     user.Name,
			"bio":      user.Bio,
		},
	})
}

type UpdateProfileRequest struct {
	Name string `json:"name" binding:"max=100"`
	Bio  string `json:"bio"`
}

func UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User Not Found"})
		return
	}

	user.Name = req.Name
	user.Bio = req.Bio

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"avatar":   user.Avatar,
			"name":     user.Name,
			"bio":      user.Bio,
		},
	})
}

func RefreshTokenHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh-token")
	if err != nil || cookieToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token required"})
		return
	}

	var rt models.RefreshToken
	if err := database.DB.Where("token = ?", cookieToken).First(&rt).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	// Reuse detection
	if rt.Used || rt.Revoked {
		// Revoke the entire token family
		database.DB.Model(&models.RefreshToken{}).
			Where("family_id = ?", rt.FamilyID).
			Update("revoked", true)

		clearRefreshTokenCookie(c)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Compromised session. Please log in again."})
		return
	}

	// Check expiration
	if time.Now().After(rt.ExpiresAt) {
		rt.Revoked = true
		database.DB.Save(&rt)
		clearRefreshTokenCookie(c)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token expired"})
		return
	}

	// Get user
	var user models.User
	if err := database.DB.First(&user, rt.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Rotate token
	accessToken, err := issueAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	newRefreshToken, err := issueRefreshToken(user.ID, rt.FamilyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Mark current token as used
	rt.Used = true
	if err := database.DB.Save(&rt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update token status"})
		return
	}

	setRefreshTokenCookie(c, newRefreshToken)

	c.JSON(http.StatusOK, gin.H{
		"token": accessToken,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"avatar":   user.Avatar,
		},
	})
}

func LogoutHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh-token")
	if err == nil && cookieToken != "" {
		database.DB.Model(&models.RefreshToken{}).
			Where("token = ?", cookieToken).
			Update("revoked", true)
	}

	clearRefreshTokenCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
