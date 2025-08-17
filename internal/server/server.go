package server

import (
	"github.com/gofiber/fiber/v2"

	"unorcitconnect/internal/database"
	"unorcitconnect/internal/email"
)

type FiberServer struct {
	*fiber.App

	db    database.Service
	email *email.EmailService
}

func New() *FiberServer {
	server := &FiberServer{
		App: fiber.New(fiber.Config{
			ServerHeader: "unorcitconnect",
			AppName:      "unorcitconnect",
		}),

		db:    database.New(),
		email: email.NewEmailService(),
	}

	return server
}
