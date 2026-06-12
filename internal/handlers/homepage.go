package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rj-2006/techtalk/internal/database"
	"github.com/rj-2006/techtalk/internal/models"
)

type HomepageStats struct {
	TotalMembers   int64 `json:"total_members"`
	TotalThreads   int64 `json:"total_threads"`
	TotalChatrooms int64 `json:"total_chatrooms"`
	TotalEvents    int64 `json:"total_events"`
}

type HomepageResponse struct {
	Club          models.ClubConfig     `json:"club"`
	Team          []models.TeamMember   `json:"team"`
	Events        []models.Event        `json:"events"`
	Announcements []models.Announcement `json:"announcements"`
	Stats         HomepageStats         `json:"stats"`
}

func GetHomepage(c *gin.Context) {
	bundle, err := database.FetchHomepageBundle()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Club config not found"})
		return
	}

	c.JSON(http.StatusOK, HomepageResponse{
		Club:          bundle.Club,
		Team:          bundle.Team,
		Events:        bundle.Events,
		Announcements: bundle.Announcements,
		Stats: HomepageStats{
			TotalMembers:   bundle.Stats.TotalMembers,
			TotalThreads:   bundle.Stats.TotalThreads,
			TotalChatrooms: bundle.Stats.TotalChatrooms,
			TotalEvents:    bundle.Stats.TotalEvents,
		},
	})
}
