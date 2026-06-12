package database

import (
	"github.com/rj-2006/techtalk/internal/models"
	"gorm.io/gorm"
)

type HomepageStats struct {
	TotalMembers   int64
	TotalThreads   int64
	TotalChatrooms int64
	TotalEvents    int64
}

type HomepageBundle struct {
	Club          models.ClubConfig
	Team          []models.TeamMember
	Events        []models.Event
	Announcements []models.Announcement
	Stats         HomepageStats
}

func FetchThreadByID(threadID uint) (*models.Thread, error) {
	var thread models.Thread

	if err := DB.
		Preload("User").
		Preload("Posts", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Preload("Posts.User").
		Preload("Images").
		Preload("Reactions", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Preload("Reactions.User").
		First(&thread, threadID).Error; err != nil {
		return nil, err
	}

	return &thread, nil
}

func ListThreads(search string) ([]models.Thread, error) {
	var threads []models.Thread

	query := DB.
		Preload("User").
		Preload("Posts").
		Preload("Posts.User").
		Preload("Images").
		Preload("Reactions").
		Preload("Reactions.User").
		Order("created_at DESC")

	if search != "" {
		query = query.Where("title ILIKE ?", "%"+search+"%")
	}

	if err := query.Find(&threads).Error; err != nil {
		return nil, err
	}

	return threads, nil
}

func FetchHomepageBundle() (*HomepageBundle, error) {
	var bundle HomepageBundle

	if err := DB.First(&bundle.Club).Error; err != nil {
		return nil, err
	}

	if err := DB.Where("is_active = ?", true).
		Order("display_order ASC").
		Find(&bundle.Team).Error; err != nil {
		return nil, err
	}

	if err := DB.Where("status IN ?", []string{"upcoming", "ongoing"}).
		Order("date ASC").
		Limit(6).
		Find(&bundle.Events).Error; err != nil {
		return nil, err
	}

	if err := DB.Where("is_pinned = ?", true).
		Preload("Author").
		Order("created_at DESC").
		Limit(5).
		Find(&bundle.Announcements).Error; err != nil {
		return nil, err
	}

	DB.Model(&models.User{}).Count(&bundle.Stats.TotalMembers)
	DB.Model(&models.Thread{}).Count(&bundle.Stats.TotalThreads)
	DB.Model(&models.Chatroom{}).Count(&bundle.Stats.TotalChatrooms)
	DB.Model(&models.Event{}).Count(&bundle.Stats.TotalEvents)

	return &bundle, nil
}
