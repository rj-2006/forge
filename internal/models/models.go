package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

type SocialLinks map[string]string

func (sl SocialLinks) Value() (driver.Value, error) {
	if len(sl) == 0 {
		return "{}", nil
	}
	b, err := json.Marshal(sl)
	return string(b), err
}

func (sl *SocialLinks) Scan(value interface{}) error {
	if value == nil {
		*sl = make(map[string]string)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		str, ok := value.(string)
		if !ok {
			return errors.New("invalid type for SocialLinks")
		}
		bytes = []byte(str)
	}
	*sl = make(map[string]string)
	return json.Unmarshal(bytes, sl)
}

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"unique;not null" json:"username"`
	Email     string         `gorm:"unique;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Avatar    string         `gorm:"default:null" json:"avatar,omitempty"`
	Name      string         `gorm:"type:varchar(100)" json:"name"`
	Bio       string         `gorm:"type:text" json:"bio"`
}

type Thread struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	Title     string           `gorm:"not null" json:"title"`
	UserID    uint             `gorm:"not null" json:"user_id"`
	User      User             `gorm:"foreignKey:UserID" json:"user"`
	Posts     []Post           `gorm:"foreignKey:ThreadID;constraint:OnDelete:CASCADE;" json:"posts,omitempty"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
	Images    []ThreadImage    `gorm:"foreignKey:ThreadID;constraint:OnDelete:CASCADE;" json:"images,omitempty"`
	Reactions []ThreadReaction `gorm:"foreignKey:ThreadID;constraint:OnDelete:CASCADE;" json:"reactions,omitempty"`
}

type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ThreadID  uint      `gorm:"not null" json:"thread_id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Chatroom struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedBy   uint      `gorm:"not null" json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

type ChatMessage struct {
	ID         uint              `gorm:"primaryKey" json:"id"`
	ChatroomID uint              `gorm:"not null;index" json:"chatroom_id"`
	UserID     uint              `gorm:"not null" json:"user_id"`
	User       User              `gorm:"foreignKey:UserID" json:"user"`
	Content    string            `gorm:"type:text;not null" json:"content"`
	CreatedAt  time.Time         `json:"created_at"`
	Reactions  []MessageReaction `gorm:"foreignKey:MessageID" json:"reactions,omitempty"`
}

type ThreadImage struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	ThreadID uint   `gorm:"not null;index" json:"thread_id"`
	URL      string `gorm:"not null" json:"url"`
	Caption  string `json:"caption,omitempty"`
}

type ThreadReaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ThreadID  uint      `gorm:"not null;index" json:"thread_id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Emoji     string    `gorm:"not null" json:"emoji"`
	CreatedAt time.Time `json:"created_at"`
}

type MessageReaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	MessageID uint      `gorm:"not null;index" json:"message_id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Emoji     string    `gorm:"not null" json:"emoji"`
	CreatedAt time.Time `json:"created_at"`
}

type CustomEmoji struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"unique;not null" json:"name"`
	URL       string    `gorm:"not null" json:"url"`
	CreatedBy uint      `gorm:"not null" json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

// ── Club Homepage Models ──

type ClubConfig struct {
	ID           uint        `gorm:"primaryKey" json:"id"`
	Name         string      `gorm:"not null" json:"name"`
	Tagline      string      `json:"tagline"`
	Description  string      `gorm:"type:text" json:"description"`
	LogoURL      string      `json:"logo_url"`
	HeroImageURL string      `json:"hero_image_url"`
	SocialLinks  SocialLinks `gorm:"type:text" json:"social_links"` // Structured Map
	FoundingYear int         `json:"founding_year"`
	ContactEmail string      `json:"contact_email"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

type TeamMember struct {
	ID           uint        `gorm:"primaryKey" json:"id"`
	Name         string      `gorm:"not null" json:"name"`
	Role         string      `gorm:"not null" json:"role"`
	Bio          string      `gorm:"type:text" json:"bio"`
	AvatarURL    string      `json:"avatar_url"`
	SocialLinks  SocialLinks `gorm:"type:text" json:"social_links"` // Structured Map
	DisplayOrder int         `gorm:"default:0" json:"display_order"`
	IsActive     bool        `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time   `json:"created_at"`
}

type Event struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	Title            string    `gorm:"not null" json:"title"`
	Description      string    `gorm:"type:text" json:"description"`
	Date             time.Time `gorm:"not null" json:"date"`
	EndDate          time.Time `json:"end_date,omitempty"`
	Location         string    `json:"location"`
	EventType        string    `gorm:"not null;default:'meetup'" json:"event_type"` // workshop, meetup, hackathon, talk
	Status           string    `gorm:"not null;default:'upcoming'" json:"status"`   // upcoming, ongoing, completed
	ImageURL         string    `json:"image_url"`
	RegistrationLink string    `json:"registration_link"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Announcement struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"not null" json:"title"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	Priority  string    `gorm:"not null;default:'normal'" json:"priority"` // normal, high, urgent
	IsPinned  bool      `gorm:"default:false" json:"is_pinned"`
	AuthorID  uint      `gorm:"not null" json:"author_id"`
	Author    User      `gorm:"foreignKey:AuthorID" json:"author"`
	ExpiresAt time.Time `json:"expires_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type RefreshToken struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"-"`
	Token     string         `gorm:"uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time      `gorm:"not null" json:"expires_at"`
	FamilyID  string         `gorm:"index;not null" json:"family_id"`
	Used      bool           `gorm:"default:false" json:"used"`
	Revoked   bool           `gorm:"default:false" json:"revoked"`
	CreatedAt time.Time      `json:"created_at"`
}
