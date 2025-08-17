package database

import (
	"context"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Admin struct {
	ID        int       `gorm:"column:id;primaryKey"`
	Username  string    `gorm:"column:username;unique"`
	Password  string    `gorm:"column:password"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime"`
}

func (Admin) TableName() string {
	return "admins"
}

type AdminService interface {
	CreateAdmin(ctx context.Context, username, password string) (*Admin, error)
	AuthenticateAdmin(ctx context.Context, username, password string) (*Admin, error)
	SeedDefaultAdmin(ctx context.Context) error
}

func (s *service) CreateAdmin(ctx context.Context, username, password string) (*Admin, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	admin := &Admin{
		Username: username,
		Password: string(hashedPassword),
	}

	result := s.db.WithContext(ctx).Create(admin)
	return admin, result.Error
}

func (s *service) AuthenticateAdmin(ctx context.Context, username, password string) (*Admin, error) {
	var admin Admin
	result := s.db.WithContext(ctx).Where("username = ?", username).First(&admin)
	if result.Error != nil {
		return nil, result.Error
	}

	err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(password))
	if err != nil {
		return nil, err
	}

	return &admin, nil
}

func (s *service) SeedDefaultAdmin(ctx context.Context) error {
	// Check if admin already exists
	var count int64
	s.db.WithContext(ctx).Model(&Admin{}).Where("username = ?", "admin").Count(&count)
	if count > 0 {
		return nil // Admin already exists
	}

	_, err := s.CreateAdmin(ctx, "admin", "PassW0rd^")
	return err
}
