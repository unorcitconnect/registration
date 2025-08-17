package database

import (
	"context"
	"time"
)

type Sponsorship struct {
	ID            uint      `json:"ID" gorm:"primaryKey"`
	Email         string    `json:"Email" gorm:"not null"`
	Level         string    `json:"Level" gorm:"not null"`
	Requirement   string    `json:"Requirement"`
	LastName      string    `json:"LastName" gorm:"not null"`
	FirstName     string    `json:"FirstName" gorm:"not null"`
	Company       string    `json:"Company" gorm:"not null"`
	Address       string    `json:"Address" gorm:"not null"`
	ContactNumber string    `json:"ContactNumber" gorm:"not null"`
	Confirmed     bool      `json:"Confirmed" gorm:"default:false"`
	Feedback      string    `json:"Feedback"`
	CreatedAt     time.Time `json:"CreatedAt"`
	UpdatedAt     time.Time `json:"UpdatedAt"`
}

type SponsorshipService interface {
	CreateSponsorship(ctx context.Context, sponsorship *Sponsorship) error
	GetAllSponsorships(ctx context.Context) ([]Sponsorship, error)
	GetSponsorshipByEmail(ctx context.Context, email string) (*Sponsorship, error)
	UpdateSponsorship(ctx context.Context, sponsorship *Sponsorship) error
	UpdateSponsorshipConfirmation(ctx context.Context, id uint, confirmed bool, feedback string) error
	GetSponsorshipStats(ctx context.Context) (map[string]int64, error)
}

func (s *service) CreateSponsorship(ctx context.Context, sponsorship *Sponsorship) error {
	return s.db.WithContext(ctx).Create(sponsorship).Error
}

func (s *service) GetAllSponsorships(ctx context.Context) ([]Sponsorship, error) {
	var sponsorships []Sponsorship
	err := s.db.WithContext(ctx).Order("created_at DESC").Find(&sponsorships).Error
	return sponsorships, err
}

func (s *service) UpdateSponsorshipConfirmation(ctx context.Context, id uint, confirmed bool, feedback string) error {
	return s.db.WithContext(ctx).Model(&Sponsorship{}).Where("id = ?", id).Updates(map[string]interface{}{
		"confirmed": confirmed,
		"feedback":  feedback,
	}).Error
}

func (s *service) GetSponsorshipByEmail(ctx context.Context, email string) (*Sponsorship, error) {
	var sponsorship Sponsorship
	err := s.db.WithContext(ctx).Where("email = ?", email).First(&sponsorship).Error
	if err != nil {
		return nil, err
	}
	return &sponsorship, nil
}

func (s *service) UpdateSponsorship(ctx context.Context, sponsorship *Sponsorship) error {
	return s.db.WithContext(ctx).Save(sponsorship).Error
}

func (s *service) GetSponsorshipStats(ctx context.Context) (map[string]int64, error) {
	stats := make(map[string]int64)

	// Total sponsorships
	var total int64
	if err := s.db.WithContext(ctx).Model(&Sponsorship{}).Count(&total).Error; err != nil {
		return nil, err
	}
	stats["total_sponsorships"] = total

	// Confirmed sponsorships
	var confirmed int64
	if err := s.db.WithContext(ctx).Model(&Sponsorship{}).Where("confirmed = ?", true).Count(&confirmed).Error; err != nil {
		return nil, err
	}
	stats["confirmed_sponsorships"] = confirmed

	// Pending sponsorships
	stats["pending_sponsorships"] = total - confirmed

	return stats, nil
}
