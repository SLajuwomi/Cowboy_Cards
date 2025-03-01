package routes

import (
	"net/http"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func Routes(r *chi.Mux, cfg *controllers.Config) {
	// Setup CORS middleware
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8080", "http://localhost:3000"}, // Add your frontend origins here
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "user_id"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})

	// Apply CORS middleware to all routes
	r.Use(corsMiddleware.Handler)

	// Public routes
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world\n"))
	})

	// Auth routes
	r.Post("/signup", cfg.Signup)
	r.Post("/login", cfg.Login)

	// API routes
	r.Get("/classes", cfg.GetClasses)
	r.Get("/flashcard_sets", cfg.GetUsersFlashCardSets)
	r.Post("/flashcard", cfg.CreateFlashCard)
	// r.Get("/users", cfg.GetUsers)
	// r.Get("/user", cfg.GetUser)
}
