package database

import (
	"log"
	"os"
	"time"

	"github.com/rj-2006/techtalk/internal/models"
)

func Seed() {
	seedClubConfig()
	seedTeamMembers()
	seedEvents()
	seedAnnouncements()
}

func SeedIfEnabled() {
	if os.Getenv("APP_SEED") == "false" {
		return
	}
	Seed()
}

func seedClubConfig() {
	var count int64
	DB.Model(&models.ClubConfig{}).Count(&count)
	if count > 0 {
		return
	}

	club := models.ClubConfig{
		Name:         "Devign",
		Tagline:      "Where Design Meets Development",
		Description:  "Devign is a student-run tech club bridging the gap between design thinking and software development. We build real products, host workshops, run hackathons, and foster a community of creators who believe great software starts with great design.",
		LogoURL:      "/Devign logo v1 pngV.png",
		SocialLinks:  `{"github":"https://github.com/devign-club","discord":"https://discord.gg/devign","twitter":"https://twitter.com/devignclub","instagram":"https://instagram.com/devignclub","linkedin":"https://linkedin.com/company/devign"}`,
		FoundingYear: 2024,
		ContactEmail: "hello@devign.club",
	}

	if err := DB.Create(&club).Error; err != nil {
		log.Println("Failed to seed club config:", err)
	} else {
		log.Println("✓ Seeded club config")
	}
}

func seedTeamMembers() {
	var count int64
	DB.Model(&models.TeamMember{}).Count(&count)
	if count > 0 {
		return
	}

	members := []models.TeamMember{
		{
			Name:         "Rudra Joshi",
			Role:         "Founder & President",
			Bio:          "Backend engineer passionate about systems design, distributed computing, and building tools that developers love.",
			SocialLinks:  `{"github":"https://github.com/rj-2006","linkedin":"https://linkedin.com/in/rudra-joshi"}`,
			DisplayOrder: 1,
			IsActive:     true,
		},
		{
			Name:         "Arjun Mehta",
			Role:         "Vice President",
			Bio:          "Full-stack developer with a keen eye for UX. Leads frontend architecture and design system development.",
			SocialLinks:  `{"github":"https://github.com/arjunm","twitter":"https://twitter.com/arjunmehta"}`,
			DisplayOrder: 2,
			IsActive:     true,
		},
		{
			Name:         "Priya Sharma",
			Role:         "Design Lead",
			Bio:          "UI/UX designer turning complex workflows into intuitive interfaces. Advocates for accessibility-first design.",
			SocialLinks:  `{"linkedin":"https://linkedin.com/in/priya-sharma","instagram":"https://instagram.com/priyaDesigns"}`,
			DisplayOrder: 3,
			IsActive:     true,
		},
		{
			Name:         "Karan Singh",
			Role:         "Tech Lead",
			Bio:          "Cloud-native enthusiast. Builds scalable backends worth over-engineering and manages our infrastructure.",
			SocialLinks:  `{"github":"https://github.com/karansingh"}`,
			DisplayOrder: 4,
			IsActive:     true,
		},
		{
			Name:         "Ananya Patel",
			Role:         "Events Coordinator",
			Bio:          "Organizes hackathons, workshops, and speaker sessions. Makes sure every event is unforgettable.",
			SocialLinks:  `{"instagram":"https://instagram.com/ananya.events"}`,
			DisplayOrder: 5,
			IsActive:     true,
		},
		{
			Name:         "Vikram Rao",
			Role:         "Community Manager",
			Bio:          "Open-source contributor and community builder. Manages our Discord, socials, and member outreach.",
			SocialLinks:  `{"github":"https://github.com/vikramrao","discord":"vikram#0001"}`,
			DisplayOrder: 6,
			IsActive:     true,
		},
	}

	for _, m := range members {
		if err := DB.Create(&m).Error; err != nil {
			log.Println("Failed to seed team member:", m.Name, err)
		}
	}
	log.Printf("✓ Seeded %d team members\n", len(members))
}

func seedEvents() {
	var count int64
	DB.Model(&models.Event{}).Count(&count)
	if count > 0 {
		return
	}

	now := time.Now()

	events := []models.Event{
		{
			Title:       "Design Systems Workshop",
			Description: "Learn to build scalable design systems from scratch. We'll cover tokens, component APIs, theming, and how to bridge the gap between Figma and code.",
			Date:        now.AddDate(0, 0, 14),
			Location:    "Room 302, CS Building",
			EventType:   "workshop",
			Status:      "upcoming",
		},
		{
			Title:       "Devign Hackathon '25",
			Description: "48-hour hackathon where design meets code. Teams of 3–4 build a product from concept to MVP. Prizes, mentors, food, and lots of caffeine.",
			Date:        now.AddDate(0, 1, 0),
			EndDate:     now.AddDate(0, 1, 2),
			Location:    "Innovation Hub, Main Campus",
			EventType:   "hackathon",
			Status:      "upcoming",
		},
		{
			Title:       "Tech Talk: Building at Scale",
			Description: "Industry guest speaker on scaling distributed systems at production. Q&A session included.",
			Date:        now.AddDate(0, 0, 21),
			Location:    "Auditorium B",
			EventType:   "talk",
			Status:      "upcoming",
		},
		{
			Title:       "Weekly Standup & Code Review",
			Description: "Our open weekly session where members demo what they've built, get code reviews, and collaborate on club projects.",
			Date:        now.AddDate(0, 0, 7),
			Location:    "Devign HQ (Room 118)",
			EventType:   "meetup",
			Status:      "upcoming",
		},
	}

	for _, e := range events {
		if err := DB.Create(&e).Error; err != nil {
			log.Println("Failed to seed event:", e.Title, err)
		}
	}
	log.Printf("✓ Seeded %d events\n", len(events))
}

func seedAnnouncements() {
	var count int64
	DB.Model(&models.Announcement{}).Count(&count)
	if count > 0 {
		return
	}

	// We need at least one user to be the author. Create a system user if none exist.
	var user models.User
	if err := DB.First(&user).Error; err != nil {
		user = models.User{
			Username: "devign-bot",
			Email:    "bot@devign.club",
			Password: "$2a$10$c59tXYhmjoub86.ehMV/4e407e9w0w3WZdCCVjlYgiLHNIetG7aVu", // password123
		}
		DB.Create(&user)
	}

	announcements := []models.Announcement{
		{
			Title:    "🚀 Devign Platform is Live!",
			Content:  "Welcome to the new Devign platform! Explore our forum, join chat rooms, and connect with fellow designers and developers. This is just the beginning — more features are on the way.",
			Priority: "high",
			IsPinned: true,
			AuthorID: user.ID,
		},
		{
			Title:    "📝 Registrations Paused",
			Content:  "We've temporarily paused new member registrations while we onboard our current batch. If you're interested, drop us an email and we'll add you to the waitlist.",
			Priority: "normal",
			IsPinned: true,
			AuthorID: user.ID,
		},
		{
			Title:    "🏆 Hackathon Signups Open",
			Content:  "Devign Hackathon '25 signups are now open! Form your team of 3–4 and register before spots fill up. This year's theme: 'Design for Impact'.",
			Priority: "urgent",
			IsPinned: true,
			AuthorID: user.ID,
		},
	}

	for _, a := range announcements {
		if err := DB.Create(&a).Error; err != nil {
			log.Println("Failed to seed announcement:", a.Title, err)
		}
	}
	log.Printf("✓ Seeded %d announcements\n", len(announcements))
}
