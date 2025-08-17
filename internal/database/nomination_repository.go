package database

import (
	"context"
	"fmt"
	"strings"
	"time"
)

type Nomination struct {
	ID             int       `gorm:"column:id;primaryKey;autoIncrement"`
	FirstName      string    `gorm:"column:first_name"`
	LastName       string    `gorm:"column:last_name"`
	NominatedEmail string    `gorm:"column:nominated_email"` // optional
	NominatorEmail string    `gorm:"column:nominator_email;not null;index:idx_nominator_category,unique"`
	Year           int       `gorm:"column:year"`
	Category       string    `gorm:"column:category;index:idx_nominator_category,unique"`
	CreatedAt      time.Time `gorm:"column:created_at;autoCreateTime"` // auto on insert
	UpdatedAt      time.Time `gorm:"column:updated_at;autoUpdateTime"` // auto on update
}

type NomineeGroup struct {
	FirstName string
	LastName  string
	Year      int
	Category  string
	Count     int
}

func (Nomination) TableName() string {
	return "nomination"
}

type NominationService interface {
	SaveNomination(ctx context.Context, n *Nomination) error
	DeleteNomination(ctx context.Context, id int) error
	FindNominationsByCategory(ctx context.Context, category string) ([]Nomination, error)
	FindNominationsByCategoryGrouped(ctx context.Context, category string) ([]NomineeGroup, error)
}

func (s *service) SaveNomination(ctx context.Context, n *Nomination) error {
	// Normalize names to uppercase
	n.FirstName = strings.ToUpper(n.FirstName)
	n.LastName = strings.ToUpper(n.LastName)

	err := s.db.WithContext(ctx).Create(n).Error
	if err != nil {
		if isUniqueConstraintError(err) {
			return fmt.Errorf("you have already submitted a nomination for this category")
		}
		return fmt.Errorf("failed to save nomination: %w", err)
	}
	return nil
}

func (s *service) DeleteNomination(ctx context.Context, id int) error {
	result := s.db.WithContext(ctx).Delete(&Nomination{}, id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete nomination: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("nomination not found")
	}
	return nil
}

func (s *service) FindNominationsByCategory(ctx context.Context, category string) ([]Nomination, error) {
	var nominations []Nomination
	query := s.db.WithContext(ctx)

	if category != "" {
		query = query.Where("category = ?", category)
	}

	result := query.Find(&nominations)
	return nominations, result.Error
}

func (s *service) FindNominationsByCategoryGrouped(ctx context.Context, category string) ([]NomineeGroup, error) {
	var results []NomineeGroup

	query := s.db.WithContext(ctx).
		Model(&Nomination{}).
		Select("first_name, last_name, year, category, COUNT(*) as count")

	if category != "" {
		query = query.Where("category = ?", category)
	}

	err := query.
		Group("first_name, last_name, year, category").
		Order("count DESC").
		Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("failed to group nominations: %w", err)
	}

	return results, nil
}

func isUniqueConstraintError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "duplicate key value violates unique constraint")
}
