package database

import (
	"context"
	"time"
)

type Course struct {
	ID        int       `gorm:"column:id;primaryKey"`
	Code      string    `gorm:"column:code;unique"`
	Name      string    `gorm:"column:name"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime"`
}

func (Course) TableName() string {
	return "courses"
}

type CourseService interface {
	GetAllCourses(ctx context.Context) ([]Course, error)
	SeedCourses(ctx context.Context) error
}

func (s *service) GetAllCourses(ctx context.Context) ([]Course, error) {
	var courses []Course
	result := s.db.WithContext(ctx).Order("name ASC").Find(&courses)
	return courses, result.Error
}

func (s *service) SeedCourses(ctx context.Context) error {
	// Check if courses already exist
	var count int64
	s.db.WithContext(ctx).Model(&Course{}).Count(&count)
	if count > 0 {
		return nil // Courses already seeded
	}

	courses := []Course{
		{Code: "BSCS", Name: "Bachelor of Science in Computer Science"},
		{Code: "BSIT", Name: "Bachelor of Science in Information Technology"},
		{Code: "BSIM", Name: "Bachelor of Science in Information Management"},
		{Code: "BSIS", Name: "Bachelor of Science in Information Systems"},
		{Code: "BSEMC", Name: "Bachelor of Science in Entertainment and Multimedia Computing"},
		{Code: "BSCCS", Name: "Commerce major in Computer Science"},
	}

	for _, course := range courses {
		if err := s.db.WithContext(ctx).Create(&course).Error; err != nil {
			return err
		}
	}

	return nil
}
