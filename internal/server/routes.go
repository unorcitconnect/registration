package server

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func (s *FiberServer) RegisterFiberRoutes() {
	// Apply CORS middleware
	s.App.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Accept,Authorization,Content-Type",
		AllowCredentials: false, // credentials require explicit origins
		MaxAge:           300,
	}))

	s.App.Get("/health", s.healthHandler)

	// API routes
	api := s.App.Group("/api")

	// OTP routes
	api.Post("/otp/send", s.sendOTPHandler)
	api.Post("/otp/verify", s.verifyOTPHandler)

	// Alumni routes
	api.Get("/alumni", s.getAllAlumniHandler)
	api.Get("/alumni/locations", s.getAlumniLocationsHandler)
	api.Get("/alumni/:id/payment-proof", s.getPaymentProofHandler)
	api.Post("/alumni/:id/payment-proof", s.uploadPaymentProofHandler)
	api.Post("/alumni", func(c *fiber.Ctx) error {
		fmt.Printf("🎯 POST /alumni route hit! URL: %s\n", c.OriginalURL())
		return s.createAlumniHandler(c)
	})
	api.Put("/alumni/:id", func(c *fiber.Ctx) error {
		fmt.Printf("🎯 PUT /alumni/:id route hit! URL: %s\n", c.OriginalURL())
		return s.updateAlumniHandler(c)
	})
	api.Get("/check-alumni-email", s.checkAlumniEmailHandler) // Check if email exists

	// Nomination routes
	api.Post("/nominations", s.createNominationHandler)
	api.Get("/nominations", s.getNominationsHandler)
	api.Get("/nominations/grouped", s.getGroupedNominationsHandler)

	// Countries routes
	api.Get("/countries", s.GetCountries)

	// Courses routes
	api.Get("/courses", s.GetCourses)

	// Admin routes
	api.Post("/admin/login", s.adminLoginHandler)
	api.Post("/admin/create", s.createAdminHandler)
	api.Get("/admin/dashboard", s.adminDashboardHandler)

	// Delete routes (Superuser only)
	api.Delete("/alumni/:id", s.deleteAlumniHandler)
	api.Delete("/nominations/:id", s.deleteNominationHandler)
	api.Delete("/sponsorships/:id", s.deleteSponsorshipHandler)

	// Sponsorship routes
	api.Post("/sponsorships", s.createSponsorshipHandler)
	api.Get("/sponsorships", s.getAllSponsorshipsHandler)
	api.Get("/sponsorships/email/:email", s.getSponsorshipByEmailHandler)
	api.Put("/sponsorships/:id", s.updateSponsorshipHandler)
	api.Put("/sponsorships/:id/confirm", s.updateSponsorshipConfirmationHandler)
	api.Get("/sponsorships/stats", s.getSponsorshipStatsHandler)

	// Serve static files from frontend/dist (SPA fallback)
	s.App.Static("/", "./frontend/dist")

	// Catch-all route for SPA (must be last)
	s.App.Get("*", func(c *fiber.Ctx) error {
		return c.SendFile("./frontend/dist/index.html")
	})
}

func (s *FiberServer) HelloWorldHandler(c *fiber.Ctx) error {
	resp := fiber.Map{
		"message": "Hello World",
	}

	return c.JSON(resp)
}

func (s *FiberServer) healthHandler(c *fiber.Ctx) error {
	return c.JSON(s.db.Health())
}
