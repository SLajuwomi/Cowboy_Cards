package routes

import (
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func Routes(r *chi.Mux, cfg *controllers.Config) {
	// Setup CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Mount all routes under /api
	r.Route("/api", func(r chi.Router) {
		// Auth routes
		r.Route("/auth", func(r chi.Router) {
			r.Post("/signup", cfg.Signup)
			r.Post("/login", cfg.Login)
		})

		// User routes (protected)
		r.Route("/user", func(r chi.Router) {
			r.Use(cfg.AuthMiddleware)
			r.Get("/", cfg.GetUser)      // Get current user's info
			r.Delete("/", cfg.DeleteUser) // Delete current user's account
		})

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(cfg.AuthMiddleware)
			
			r.Get("/classes", cfg.GetClasses)
		
			r.Route("/flashcard", func(r chi.Router) {
				r.Get("/set", cfg.GetFlashCardSet)
				r.Post("/set", cfg.CreateFlashCardSet)
				r.Put("/set", cfg.UpdateFlashCardSet)
				r.Delete("/set", cfg.DeleteFlashCardSet)

				r.Get("/", cfg.GetFlashCard)
				r.Post("/", cfg.CreateFlashCard)
				r.Put("/", cfg.UpdateFlashCard)
				r.Delete("/", cfg.DeleteFlashCard)
			})
		})
	})
}
