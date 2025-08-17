package database

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Alumni struct {
	ID               int       `gorm:"column:id;primaryKey"`
	FirstName        string    `gorm:"column:first_name"`
	LastName         string    `gorm:"column:last_name"`
	Email            string    `gorm:"column:email;unique"`
	Phone            string    `gorm:"column:phone"`
	Year             int       `gorm:"column:year"`
	Course           string    `gorm:"column:course"`
	Company          string    `gorm:"column:company"`
	Position         string    `gorm:"column:position"`
	Country          string    `gorm:"column:country"`
	City             string    `gorm:"column:city"`
	Latitude         float64   `gorm:"column:latitude"`
	Longitude        float64   `gorm:"column:longitude"`
	IsVerified       bool      `gorm:"column:is_verified;default:false"`
	Paid             bool      `gorm:"column:paid;default:false"`
	PaymentProof     string    `gorm:"column:payment_proof"`
	PaymentProofData []byte    `gorm:"column:payment_proof_data"`
	PaymentProofType string    `gorm:"column:payment_proof_type"`
	PaymentProofSize int64     `gorm:"column:payment_proof_size"`
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime"` // auto on insert
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime"` // auto on update
}

type OTP struct {
	ID        int       `gorm:"column:id;primaryKey"`
	Email     string    `gorm:"column:email;index"`
	Code      string    `gorm:"column:code"`
	Purpose   string    `gorm:"column:purpose"` // "registration" or "nomination"
	ExpiresAt time.Time `gorm:"column:expires_at"`
	Used      bool      `gorm:"column:used;default:false"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime"`
}

func (Alumni) TableName() string {
	return "alumni"
}

func (OTP) TableName() string {
	return "otp"
}

type AlumniService interface {
	GetAllAlumni(ctx context.Context) ([]Alumni, error)
	GetPaginatedAlumni(ctx context.Context, page int, pageSize int) ([]Alumni, int64, error)
	FindAlumniByEmail(ctx context.Context, email string) (*Alumni, error)
	GetAlumniByID(ctx context.Context, id int) (*Alumni, error)
	SaveAlumni(ctx context.Context, a *Alumni) error
	GetAlumniWithLocation(ctx context.Context) ([]Alumni, error)
}

type OTPService interface {
	CreateOTP(ctx context.Context, email, purpose string) (*OTP, error)
	VerifyOTP(ctx context.Context, email, code, purpose string) (*OTP, error)
	CleanupExpiredOTPs(ctx context.Context) error
}

func (s *service) GetAllAlumni(ctx context.Context) ([]Alumni, error) {
	var alumni []Alumni
	result := s.db.WithContext(ctx).Find(&alumni)
	return alumni, result.Error
}

func (s *service) GetPaginatedAlumni(ctx context.Context, page int, pageSize int) ([]Alumni, int64, error) {
	var alumni []Alumni
	var total int64

	if err := s.db.WithContext(ctx).Model(&Alumni{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count alumni: %w", err)
	}

	offset := (page - 1) * pageSize
	result := s.db.WithContext(ctx).
		Order("id ASC").
		Limit(pageSize).
		Offset(offset).
		Find(&alumni)

	if result.Error != nil {
		return nil, total, fmt.Errorf("failed to fetch paginated alumni: %w", result.Error)
	}

	return alumni, total, nil
}

func (s *service) FindAlumniByEmail(ctx context.Context, email string) (*Alumni, error) {
	var alumni Alumni
	result := s.db.WithContext(ctx).Where("email = ?", email).First(&alumni)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find alumni by email: %w", result.Error)
	}

	return &alumni, nil
}

func (s *service) GetAlumniByID(ctx context.Context, id int) (*Alumni, error) {
	var alumni Alumni
	result := s.db.WithContext(ctx).Where("id = ?", id).First(&alumni)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("alumni not found")
		}
		return nil, fmt.Errorf("failed to find alumni by ID: %w", result.Error)
	}

	return &alumni, nil
}

func (s *service) SaveAlumni(ctx context.Context, a *Alumni) error {
	a.FirstName = strings.ToUpper(a.FirstName)
	a.LastName = strings.ToUpper(a.LastName)

	if a.ID == 0 {
		if err := s.db.WithContext(ctx).Create(a).Error; err != nil {
			return fmt.Errorf("failed to create alumni: %w", err)
		}
	} else {
		if err := s.db.WithContext(ctx).Save(a).Error; err != nil {
			return fmt.Errorf("failed to update alumni: %w", err)
		}
	}
	return nil
}

func (s *service) GetAlumniWithLocation(ctx context.Context) ([]Alumni, error) {
	var alumni []Alumni
	result := s.db.WithContext(ctx).Where("latitude != 0 AND longitude != 0").Find(&alumni)
	return alumni, result.Error
}

// OTP Service Methods
func (s *service) CreateOTP(ctx context.Context, email, purpose string) (*OTP, error) {
	// Generate 4-digit OTP
	code := fmt.Sprintf("%04d", time.Now().UnixNano()%10000)

	// Set expiration to 2 minutes from now
	expiresAt := time.Now().Add(2 * time.Minute)

	otp := &OTP{
		Email:     email,
		Code:      code,
		Purpose:   purpose,
		ExpiresAt: expiresAt,
		Used:      false,
	}

	if err := s.db.WithContext(ctx).Create(otp).Error; err != nil {
		return nil, fmt.Errorf("failed to create OTP: %w", err)
	}

	return otp, nil
}

func (s *service) VerifyOTP(ctx context.Context, email, code, purpose string) (*OTP, error) {
	var otp OTP
	result := s.db.WithContext(ctx).Where(
		"email = ? AND code = ? AND purpose = ? AND used = false AND expires_at > ?",
		email, code, purpose, time.Now(),
	).First(&otp)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("invalid or expired OTP")
		}
		return nil, fmt.Errorf("failed to verify OTP: %w", result.Error)
	}

	// Mark OTP as used
	otp.Used = true
	if err := s.db.WithContext(ctx).Save(&otp).Error; err != nil {
		return nil, fmt.Errorf("failed to mark OTP as used: %w", err)
	}

	return &otp, nil
}

func (s *service) CleanupExpiredOTPs(ctx context.Context) error {
	result := s.db.WithContext(ctx).Where("expires_at < ?", time.Now()).Delete(&OTP{})
	return result.Error
}
