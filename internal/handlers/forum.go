package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rj-2006/techtalk/internal/database"
	"github.com/rj-2006/techtalk/internal/models"
)

func CreateThread(c *gin.Context) {
	var req struct {
		Title   string `json:"title" binding:"required,min=3,max=200"`
		Content string `json:"content"`
		Images  []struct {
			URL     string `json:"url" binding:"required"`
			Caption string `json:"caption"`
		} `json:"images"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetUint("user_id")

	thread := models.Thread{
		Title:  req.Title,
		UserID: userID,
	}

	if err := database.DB.Create(&thread).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Thread."})
		return
	}

	// If content is provided, create initial post
	if req.Content != "" {
		post := models.Post{
			Content:  req.Content,
			ThreadID: thread.ID,
			UserID:   userID,
		}
		database.DB.Create(&post)
	}

	if len(req.Images) > 0 {
		images := make([]models.ThreadImage, 0, len(req.Images))
		for _, image := range req.Images {
			images = append(images, models.ThreadImage{
				ThreadID: thread.ID,
				URL:      image.URL,
				Caption:  image.Caption,
			})
		}
		if err := database.DB.Create(&images).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to attach thread images."})
			return
		}
	}

	database.DB.Preload("User").Preload("Posts").Preload("Images").First(&thread, thread.ID)

	c.JSON(http.StatusCreated, thread)
}

func GetThread(c *gin.Context) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid thread ID"})
		return
	}

	thread, err := database.FetchThreadByID(uint(threadID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found."})
		return
	}

	c.JSON(http.StatusOK, thread)
}

func GetThreads(c *gin.Context) {
	search := c.Query("search")
	threads, err := database.ListThreads(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch threads"})
		return
	}

	c.JSON(http.StatusOK, threads)
}

func CreatePost(c *gin.Context) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid thread id"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var thread models.Thread

	if err := database.DB.First(&thread, threadID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Thread not Found"})
		return
	}

	userID := c.GetUint("user_id")

	post := models.Post{
		Content:  req.Content,
		ThreadID: uint(threadID),
		UserID:   userID,
	}

	if err := database.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Post."})
		return
	}

	database.DB.Preload("User").First(&post, post.ID)

	c.JSON(http.StatusCreated, post)
}
