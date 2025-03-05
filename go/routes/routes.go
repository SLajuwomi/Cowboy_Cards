package routes

import (
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/go-chi/chi/v5"

)

func Routes(r *chi.Mux, cfg *controllers.Config) {


	// Auth routes
	r.Post("/signup", cfg.Signup)
	r.Post("/login", cfg.Login)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(cfg.AuthMiddleware)
		
		r.Get("/classes", cfg.GetClasses)
	
	// r.Get("/flashcard_sets", cfg.GetUsersFlashCardSets)
		r.Get("/flashcard_set", cfg.GetFlashCardSet)
	r.Post("/flashcard_set", cfg.CreateFlashCardSet)
	r.Put("/flashcard_set", cfg.UpdateFlashCardSet)
	r.Delete("/flashcard_set", cfg.DeleteFlashCardSet)

	r.Get("/flashcard", cfg.GetFlashCard)
	r.Post("/flashcard", cfg.CreateFlashCard)
			r.Put("/flashcard", cfg.UpdateFlashCard)
		r.Delete("/flashcard", cfg.DeleteFlashCard)

	})
}
