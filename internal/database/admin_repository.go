package database

import (
	"context"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Admin struct {
	ID          int       `gorm:"column:id;primaryKey"`
	Username    string    `gorm:"column:username;unique"`
	Password    string    `gorm:"column:password"`
	IsSuperuser bool      `gorm:"column:is_superuser;default:false"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime"`
}

func (Admin) TableName() string {
	return "admins"
}

type AdminService interface {
	CreateAdmin(ctx context.Context, username, password string) (*Admin, error)
	CreateSuperuser(ctx context.Context, username, password string) (*Admin, error)
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

func (s *service) CreateSuperuser(ctx context.Context, username, password string) (*Admin, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	admin := &Admin{
		Username:    username,
		Password:    string(hashedPassword),
		IsSuperuser: true,
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
	// Check if regular admin already exists
	var count int64
	s.db.WithContext(ctx).Model(&Admin{}).Where("username = ?", "admin").Count(&count)
	if count == 0 {
		_, err := s.CreateAdmin(ctx, "admin", "unorcitconnect@25")
		if err != nil {
			return err
		}
	}

	// Check if superuser already exists
	var superuserCount int64
	s.db.WithContext(ctx).Model(&Admin{}).Where("username = ?", "unorcitconnect").Count(&superuserCount)
	if superuserCount == 0 {
		_, err := s.CreateSuperuser(ctx, "unorcitconnect", "unorcitconnect@25")
		if err != nil {
			return err
		}
	}

	return nil
}
