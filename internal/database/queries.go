package database

import (
	"context"

	"github.com/rj-2006/techtalk/internal/models"
	"golang.org/x/sync/errgroup"
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

func ListThreads(search string, page int, limit int) ([]models.Thread, error) {
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

	offset := (page - 1) * limit
	query = query.Limit(limit).Offset(offset)

	if err := query.Find(&threads).Error; err != nil {
		return nil, err
	}

	return threads, nil
}

func FetchHomepageBundle() (*HomepageBundle, error) {
	var bundle HomepageBundle
	g, _ := errgroup.WithContext(context.Background())

	// 1. Club Config
	g.Go(func() error {
		return DB.First(&bundle.Club).Error
	})

	// 2. Team Members
	g.Go(func() error {
		return DB.Where("is_active = ?", true).
			Order("display_order ASC").
			Find(&bundle.Team).Error
	})

	// 3. Events
	g.Go(func() error {
		return DB.Where("status IN ?", []string{"upcoming", "ongoing"}).
			Order("date ASC").
			Limit(6).
			Find(&bundle.Events).Error
	})

	// 4. Announcements
	g.Go(func() error {
		return DB.Where("is_pinned = ?", true).
			Preload("Author").
			Order("created_at DESC").
			Limit(5).
			Find(&bundle.Announcements).Error
	})

	// 5. TotalMembers
	g.Go(func() error {
		return DB.Model(&models.User{}).Count(&bundle.Stats.TotalMembers).Error
	})

	// 6. TotalThreads
	g.Go(func() error {
		return DB.Model(&models.Thread{}).Count(&bundle.Stats.TotalThreads).Error
	})

	// 7. TotalChatrooms
	g.Go(func() error {
		return DB.Model(&models.Chatroom{}).Count(&bundle.Stats.TotalChatrooms).Error
	})

	// 8. TotalEvents
	g.Go(func() error {
		return DB.Model(&models.Event{}).Count(&bundle.Stats.TotalEvents).Error
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}

	return &bundle, nil
}
