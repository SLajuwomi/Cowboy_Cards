package routes

import (
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func Routes(r *chi.Mux, cfg *controllers.Config) {

	// Auth routes
	r.Post("/signup", cfg.Signup)
	r.Post("/login", cfg.Login)

	r.Get("/classes", cfg.GetClasses)
	r.Get("/flashcard_sets", cfg.GetUsersFlashCardSets)
	r.Post("/flashcard", cfg.CreateFlashCard)
	r.Get("/flashcard", cfg.GetFlashCard)
	r.Put("/flashcard", cfg.UpdateFlashCard)
	r.Delete("/flashcard", cfg.DeleteFlashCard)
}
