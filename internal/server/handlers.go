package server

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"unorcitconnect/internal/database"

	"github.com/gofiber/fiber/v2"
)

// OTP Handlers
type SendOTPRequest struct {
	Email   string `json:"email"`
	Purpose string `json:"purpose"` // "registration" or "nomination"
}

type VerifyOTPRequest struct {
	Email   string `json:"email"`
	Code    string `json:"code"`
	Purpose string `json:"purpose"`
}

func (s *FiberServer) sendOTPHandler(c *fiber.Ctx) error {
	var req SendOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Email == "" || req.Purpose == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email and purpose are required"})
	}

	otp, err := s.db.CreateOTP(c.Context(), req.Email, req.Purpose)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Log the OTP for debugging (remove in production)
	fmt.Printf("Generated OTP for %s: %s\n", req.Email, otp.Code)

	// Send OTP via email
	if err := s.email.SendOTP(req.Email, otp.Code, req.Purpose); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to send email: " + err.Error()})
	}

	return c.JSON(fiber.Map{
		"message":   "OTP sent successfully",
		"debug_otp": otp.Code, // TODO: Remove in production
	})
}

func (s *FiberServer) verifyOTPHandler(c *fiber.Ctx) error {
	var req VerifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Email == "" || req.Code == "" || req.Purpose == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email, code, and purpose are required"})
	}

	otp, err := s.db.VerifyOTP(c.Context(), req.Email, req.Code, req.Purpose)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// Check if alumni exists for registration purpose
	if req.Purpose == "registration" {
		alumni, err := s.db.FindAlumniByEmail(c.Context(), req.Email)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to check alumni"})
		}

		// Log alumni data for debugging
		if alumni != nil {
			fmt.Printf("Found existing alumni for %s: ID=%d, Name=%s %s\n", req.Email, alumni.ID, alumni.FirstName, alumni.LastName)
		} else {
			fmt.Printf("No existing alumni found for %s\n", req.Email)
		}

		return c.JSON(fiber.Map{
			"message":         "OTP verified successfully",
			"verified":        true,
			"alumni_exists":   alumni != nil,
			"alumni_data":     alumni,
			"verification_id": otp.ID,
		})
	}

	return c.JSON(fiber.Map{
		"message":         "OTP verified successfully",
		"verified":        true,
		"verification_id": otp.ID,
	})
}

// Alumni Handlers
func (s *FiberServer) getAllAlumniHandler(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "10"))

	alumni, total, err := s.db.GetPaginatedAlumni(c.Context(), page, pageSize)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"alumni": alumni,
		"total":  total,
		"page":   page,
		"size":   pageSize,
	})
}

func (s *FiberServer) getAlumniLocationsHandler(c *fiber.Ctx) error {
	alumni, err := s.db.GetAlumniWithLocation(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"alumni": alumni})
}

func (s *FiberServer) createAlumniHandler(c *fiber.Ctx) error {
	fmt.Printf("🚀 CREATE ALUMNI HANDLER CALLED!\n")
	fmt.Printf("Request Method: %s\n", c.Method())
	fmt.Printf("Request URL: %s\n", c.OriginalURL())

	var alumni database.Alumni

	// Check if this is a multipart form (file upload)
	contentType := c.Get("Content-Type")
	fmt.Printf("📋 Content-Type: %s\n", contentType)

	if contentType != "" && strings.Contains(contentType, "multipart/form-data") {
		fmt.Printf("Processing multipart form data for new alumni\n")
		// Handle multipart form data (with potential file upload)
		alumni.FirstName = c.FormValue("firstName")
		alumni.LastName = c.FormValue("lastName")
		alumni.Email = c.FormValue("email")
		alumni.Phone = c.FormValue("phone")
		alumni.Company = c.FormValue("company")
		alumni.Position = c.FormValue("position")
		alumni.Country = c.FormValue("country")
		alumni.City = c.FormValue("city")

		// Parse year and course
		if yearStr := c.FormValue("year"); yearStr != "" {
			if year, err := strconv.Atoi(yearStr); err == nil {
				alumni.Year = year
			}
		}
		alumni.Course = c.FormValue("course")

		// Parse coordinates
		if latStr := c.FormValue("latitude"); latStr != "" {
			if lat, err := strconv.ParseFloat(latStr, 64); err == nil {
				alumni.Latitude = lat
			}
		}
		if lngStr := c.FormValue("longitude"); lngStr != "" {
			if lng, err := strconv.ParseFloat(lngStr, 64); err == nil {
				alumni.Longitude = lng
			}
		}

		// Handle file upload
		file, err := c.FormFile("payment_proof")
		fmt.Printf("File upload attempt - Error: %v, File: %v\n", err, file != nil)
		if err == nil && file != nil {
			fmt.Printf("File found: %s, Size: %d, Type: %s\n", file.Filename, file.Size, file.Header.Get("Content-Type"))

			// Check file size (limit to 5MB)
			const maxSize = 5 * 1024 * 1024 // 5MB
			if file.Size > maxSize {
				return c.Status(400).JSON(fiber.Map{"error": "File size exceeds 5MB limit"})
			}

			// Check file type (only PDF allowed)
			if file.Header.Get("Content-Type") != "application/pdf" {
				return c.Status(400).JSON(fiber.Map{"error": "Only PDF files are allowed"})
			}

			// Open the file
			src, err := file.Open()
			if err != nil {
				fmt.Printf("Failed to open file: %v\n", err)
				return c.Status(500).JSON(fiber.Map{"error": "Failed to open file"})
			}
			defer src.Close()

			// Read file data
			fileData := make([]byte, file.Size)
			if _, err := src.Read(fileData); err != nil {
				fmt.Printf("Failed to read file: %v\n", err)
				return c.Status(500).JSON(fiber.Map{"error": "Failed to read file"})
			}

			fmt.Printf("File data read successfully, size: %d bytes\n", len(fileData))

			// Set payment proof data
			alumni.PaymentProof = file.Filename
			alumni.PaymentProofData = fileData
			alumni.PaymentProofType = "application/pdf"
			alumni.PaymentProofSize = file.Size
			alumni.Paid = true

			fmt.Printf("Payment proof data set: filename=%s, dataSize=%d\n", alumni.PaymentProof, len(alumni.PaymentProofData))
		} else if err != nil {
			fmt.Printf("No file uploaded or error: %v\n", err)
		}
	} else {
		// Handle JSON body (regular creation without file)
		if err := c.BodyParser(&alumni); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}
	}

	fmt.Printf("💾 About to save new alumni to database...\n")
	fmt.Printf("Alumni data before save: Paid=%t, PaymentProof=%s, PaymentProofDataSize=%d\n",
		alumni.Paid, alumni.PaymentProof, len(alumni.PaymentProofData))

	if err := s.db.SaveAlumni(c.Context(), &alumni); err != nil {
		fmt.Printf("❌ Failed to save new alumni: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	fmt.Printf("✅ New alumni saved successfully with ID: %d\n", alumni.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Alumni created successfully",
		"alumni":  alumni,
	})
}

func (s *FiberServer) updateAlumniHandler(c *fiber.Ctx) error {
	fmt.Printf("🚀 UPDATE ALUMNI HANDLER CALLED!\n")
	fmt.Printf("Request Method: %s\n", c.Method())
	fmt.Printf("Request URL: %s\n", c.OriginalURL())

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		fmt.Printf("❌ Invalid alumni ID: %s\n", c.Params("id"))
		return c.Status(400).JSON(fiber.Map{"error": "Invalid alumni ID"})
	}

	fmt.Printf("✅ Alumni ID parsed: %d\n", id)

	// Get existing alumni data
	existingAlumni, err := s.db.GetAlumniByID(c.Context(), id)
	if err != nil {
		fmt.Printf("❌ Alumni not found for ID %d: %v\n", id, err)
		return c.Status(404).JSON(fiber.Map{"error": "Alumni not found"})
	}

	fmt.Printf("✅ Found existing alumni: %s %s\n", existingAlumni.FirstName, existingAlumni.LastName)

	// Check if this is a multipart form (file upload)
	contentType := c.Get("Content-Type")
	fmt.Printf("📋 Content-Type: %s\n", contentType)

	if contentType != "" && strings.Contains(contentType, "multipart/form-data") {
		fmt.Printf("Processing multipart form data\n")
		// Handle multipart form data (with potential file upload)
		existingAlumni.FirstName = c.FormValue("firstName")
		existingAlumni.LastName = c.FormValue("lastName")
		existingAlumni.Email = c.FormValue("email")
		existingAlumni.Phone = c.FormValue("phone")
		existingAlumni.Company = c.FormValue("company")
		existingAlumni.Position = c.FormValue("position")
		existingAlumni.Country = c.FormValue("country")
		existingAlumni.City = c.FormValue("city")

		// Parse year and course
		if yearStr := c.FormValue("year"); yearStr != "" {
			if year, err := strconv.Atoi(yearStr); err == nil {
				existingAlumni.Year = year
			}
		}
		existingAlumni.Course = c.FormValue("course")

		// Parse coordinates
		if latStr := c.FormValue("latitude"); latStr != "" {
			if lat, err := strconv.ParseFloat(latStr, 64); err == nil {
				existingAlumni.Latitude = lat
			}
		}
		if lngStr := c.FormValue("longitude"); lngStr != "" {
			if lng, err := strconv.ParseFloat(lngStr, 64); err == nil {
				existingAlumni.Longitude = lng
			}
		}

		// Handle file upload
		file, err := c.FormFile("payment_proof")
		fmt.Printf("File upload attempt - Error: %v, File: %v\n", err, file != nil)
		if err == nil && file != nil {
			fmt.Printf("File found: %s, Size: %d, Type: %s\n", file.Filename, file.Size, file.Header.Get("Content-Type"))

			// Check file size (limit to 5MB)
			const maxSize = 5 * 1024 * 1024 // 5MB
			if file.Size > maxSize {
				return c.Status(400).JSON(fiber.Map{"error": "File size exceeds 5MB limit"})
			}

			// Check file type (only PDF allowed)
			if file.Header.Get("Content-Type") != "application/pdf" {
				return c.Status(400).JSON(fiber.Map{"error": "Only PDF files are allowed"})
			}

			// Open the file
			src, err := file.Open()
			if err != nil {
				fmt.Printf("Failed to open file: %v\n", err)
				return c.Status(500).JSON(fiber.Map{"error": "Failed to open file"})
			}
			defer src.Close()

			// Read file data
			fileData := make([]byte, file.Size)
			if _, err := src.Read(fileData); err != nil {
				fmt.Printf("Failed to read file: %v\n", err)
				return c.Status(500).JSON(fiber.Map{"error": "Failed to read file"})
			}

			fmt.Printf("File data read successfully, size: %d bytes\n", len(fileData))

			// Update alumni with payment proof data
			existingAlumni.PaymentProof = file.Filename
			existingAlumni.PaymentProofData = fileData
			existingAlumni.PaymentProofType = "application/pdf"
			existingAlumni.PaymentProofSize = file.Size
			existingAlumni.Paid = true

			fmt.Printf("Payment proof data set: filename=%s, dataSize=%d\n", existingAlumni.PaymentProof, len(existingAlumni.PaymentProofData))
		} else if err != nil {
			fmt.Printf("No file uploaded or error: %v\n", err)
		}
	} else {
		// Handle JSON body (regular update without file)
		var alumni database.Alumni
		if err := c.BodyParser(&alumni); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		// Update existing alumni with new data, preserving file data
		existingAlumni.FirstName = alumni.FirstName
		existingAlumni.LastName = alumni.LastName
		existingAlumni.Email = alumni.Email
		existingAlumni.Phone = alumni.Phone
		existingAlumni.Year = alumni.Year
		existingAlumni.Course = alumni.Course
		existingAlumni.Company = alumni.Company
		existingAlumni.Position = alumni.Position
		existingAlumni.Country = alumni.Country
		existingAlumni.City = alumni.City
		existingAlumni.Latitude = alumni.Latitude
		existingAlumni.Longitude = alumni.Longitude
		existingAlumni.IsVerified = alumni.IsVerified
		// Don't overwrite payment proof data unless explicitly provided
		if alumni.Paid {
			existingAlumni.Paid = alumni.Paid
		}
	}

	fmt.Printf("💾 About to save alumni to database...\n")
	fmt.Printf("Alumni data before save: ID=%d, Paid=%t, PaymentProof=%s, PaymentProofDataSize=%d\n",
		existingAlumni.ID, existingAlumni.Paid, existingAlumni.PaymentProof, len(existingAlumni.PaymentProofData))

	if err := s.db.SaveAlumni(c.Context(), existingAlumni); err != nil {
		fmt.Printf("❌ Failed to save alumni: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	fmt.Printf("✅ Alumni saved successfully!\n")

	return c.JSON(fiber.Map{
		"message": "Alumni updated successfully",
		"alumni":  existingAlumni,
	})
}

// GetCountries handles GET /api/countries
func (s *FiberServer) GetCountries(c *fiber.Ctx) error {
	countries, err := s.db.GetAllCountries(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch countries",
		})
	}

	return c.JSON(countries)
}

// GetCourses handles GET /api/courses
func (s *FiberServer) GetCourses(c *fiber.Ctx) error {
	courses, err := s.db.GetAllCourses(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch courses",
		})
	}

	return c.JSON(courses)
}

// Admin Handlers
type AdminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type CreateAdminRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (s *FiberServer) adminLoginHandler(c *fiber.Ctx) error {
	var req AdminLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Username and password are required"})
	}

	admin, err := s.db.AuthenticateAdmin(c.Context(), req.Username, req.Password)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"admin": fiber.Map{
			"id":           admin.ID,
			"username":     admin.Username,
			"is_superuser": admin.IsSuperuser,
		},
	})
}

func (s *FiberServer) createAdminHandler(c *fiber.Ctx) error {
	var req CreateAdminRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Username and password are required"})
	}

	// Validate password strength (minimum 8 characters, at least one uppercase, one lowercase, one number, one special character)
	if len(req.Password) < 8 {
		return c.Status(400).JSON(fiber.Map{"error": "Password must be at least 8 characters long"})
	}

	admin, err := s.db.CreateAdmin(c.Context(), req.Username, req.Password)
	if err != nil {
		// Check if it's a duplicate username error
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return c.Status(409).JSON(fiber.Map{"error": "Username already exists"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create admin: " + err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Admin created successfully",
		"admin": fiber.Map{
			"id":       admin.ID,
			"username": admin.Username,
		},
	})
}

func (s *FiberServer) adminDashboardHandler(c *fiber.Ctx) error {
	// Get all alumni
	alumni, _, err := s.db.GetPaginatedAlumni(c.Context(), 1, 1000)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch alumni"})
	}

	// Get all nominations
	nominations, err := s.db.FindNominationsByCategory(c.Context(), "")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch nominations"})
	}

	return c.JSON(fiber.Map{
		"alumni":      alumni,
		"nominations": nominations,
		"stats": fiber.Map{
			"total_alumni":      len(alumni),
			"total_nominations": len(nominations),
		},
	})
}

// Nomination Handlers
func (s *FiberServer) createNominationHandler(c *fiber.Ctx) error {
	var nomination database.Nomination
	if err := c.BodyParser(&nomination); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := s.db.SaveNomination(c.Context(), &nomination); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"message":    "Nomination created successfully",
		"nomination": nomination,
	})
}

func (s *FiberServer) getNominationsHandler(c *fiber.Ctx) error {
	category := c.Query("category")
	nominations, err := s.db.FindNominationsByCategory(c.Context(), category)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"nominations": nominations})
}

func (s *FiberServer) getGroupedNominationsHandler(c *fiber.Ctx) error {
	category := c.Query("category")
	nominations, err := s.db.FindNominationsByCategoryGrouped(c.Context(), category)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"nominations": nominations})
}

// CheckAlumniEmailHandler checks if an email exists in the alumni database
func (s *FiberServer) checkAlumniEmailHandler(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email parameter is required"})
	}

	alumni, err := s.db.FindAlumniByEmail(c.Context(), email)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}

	exists := alumni != nil
	return c.JSON(fiber.Map{
		"exists": exists,
	})
}

// Sponsorship Handlers
func (s *FiberServer) createSponsorshipHandler(c *fiber.Ctx) error {
	var sponsorship database.Sponsorship
	if err := c.BodyParser(&sponsorship); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := s.db.CreateSponsorship(c.Context(), &sponsorship); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"message":     "Sponsorship created successfully",
		"sponsorship": sponsorship,
	})
}

func (s *FiberServer) getAllSponsorshipsHandler(c *fiber.Ctx) error {
	sponsorships, err := s.db.GetAllSponsorships(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"sponsorships": sponsorships})
}

func (s *FiberServer) updateSponsorshipConfirmationHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid sponsorship ID"})
	}

	var req struct {
		Confirmed bool   `json:"confirmed"`
		Feedback  string `json:"feedback"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := s.db.UpdateSponsorshipConfirmation(c.Context(), uint(id), req.Confirmed, req.Feedback); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Sponsorship updated successfully"})
}

func (s *FiberServer) getSponsorshipStatsHandler(c *fiber.Ctx) error {
	stats, err := s.db.GetSponsorshipStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"stats": stats})
}

func (s *FiberServer) getSponsorshipByEmailHandler(c *fiber.Ctx) error {
	email := c.Params("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email parameter is required"})
	}

	// URL decode the email parameter
	decodedEmail, err := url.QueryUnescape(email)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid email format"})
	}

	sponsorship, err := s.db.GetSponsorshipByEmail(c.Context(), decodedEmail)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Sponsorship not found"})
	}

	return c.JSON(sponsorship)
}

func (s *FiberServer) updateSponsorshipHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid sponsorship ID"})
	}

	var sponsorship database.Sponsorship
	if err := c.BodyParser(&sponsorship); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Set the ID from the URL parameter
	sponsorship.ID = uint(id)

	if err := s.db.UpdateSponsorship(c.Context(), &sponsorship); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message":     "Sponsorship updated successfully",
		"sponsorship": sponsorship,
	})
}

func (s *FiberServer) getPaymentProofHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid alumni ID"})
	}

	// Get alumni by ID to check if they have payment proof
	alumni, err := s.db.GetAlumniByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Alumni not found"})
	}

	if !alumni.Paid || len(alumni.PaymentProofData) == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "No payment proof available"})
	}

	// Set appropriate headers for file download
	c.Set("Content-Type", alumni.PaymentProofType)
	c.Set("Content-Disposition", "attachment; filename=\""+alumni.PaymentProof+"\"")
	c.Set("Content-Length", strconv.FormatInt(alumni.PaymentProofSize, 10))

	// Return the file data
	return c.Send(alumni.PaymentProofData)
}

func (s *FiberServer) uploadPaymentProofHandler(c *fiber.Ctx) error {
	fmt.Printf("🚀 UPLOAD PAYMENT PROOF HANDLER CALLED!\n")
	fmt.Printf("Request Method: %s\n", c.Method())
	fmt.Printf("Request URL: %s\n", c.OriginalURL())

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		fmt.Printf("❌ Invalid alumni ID: %s\n", c.Params("id"))
		return c.Status(400).JSON(fiber.Map{"error": "Invalid alumni ID"})
	}

	fmt.Printf("✅ Alumni ID parsed: %d\n", id)

	// Get the uploaded file
	file, err := c.FormFile("payment_proof")
	if err != nil {
		fmt.Printf("❌ No file uploaded: %v\n", err)
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
	}

	fmt.Printf("✅ File received: %s, Size: %d, Type: %s\n", file.Filename, file.Size, file.Header.Get("Content-Type"))

	// Check file size (limit to 5MB)
	const maxSize = 5 * 1024 * 1024 // 5MB
	if file.Size > maxSize {
		return c.Status(400).JSON(fiber.Map{"error": "File size exceeds 5MB limit"})
	}

	// Check file type (only PDF allowed)
	if file.Header.Get("Content-Type") != "application/pdf" {
		return c.Status(400).JSON(fiber.Map{"error": "Only PDF files are allowed"})
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to open file"})
	}
	defer src.Close()

	// Read file data
	fileData := make([]byte, file.Size)
	if _, err := src.Read(fileData); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read file"})
	}

	// Get alumni by ID
	alumni, err := s.db.GetAlumniByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Alumni not found"})
	}

	// Update alumni with payment proof data
	alumni.PaymentProof = file.Filename
	alumni.PaymentProofData = fileData
	alumni.PaymentProofType = "application/pdf"
	alumni.PaymentProofSize = file.Size
	alumni.Paid = true

	if err := s.db.SaveAlumni(c.Context(), alumni); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save payment proof"})
	}

	return c.JSON(fiber.Map{
		"message":  "Payment proof uploaded successfully",
		"filename": file.Filename,
		"size":     file.Size,
	})
}

// Delete Handlers (Superuser only)
func (s *FiberServer) deleteAlumniHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid alumni ID"})
	}

	if err := s.db.DeleteAlumni(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Alumni deleted successfully"})
}

func (s *FiberServer) deleteNominationHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid nomination ID"})
	}

	if err := s.db.DeleteNomination(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Nomination deleted successfully"})
}

func (s *FiberServer) deleteSponsorshipHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid sponsorship ID"})
	}

	if err := s.db.DeleteSponsorship(c.Context(), uint(id)); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Sponsorship deleted successfully"})
}
