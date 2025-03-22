package routes

import (
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/go-chi/chi/v5"
)

// every protected route is preceded by /api
func Protected(r *chi.Mux, h *controllers.Handler) {

	// -------------------complex-------------------------

	// these are upserts, one each for (in)correct
	r.Route("/card_history", func(r chi.Router) {
		// r.Post("/incscore", h.UpdateHistory)
		// r.Post("/decscore", h.UpdateHistory)
	})

	r.Route("/class_set", func(r chi.Router) {
		r.Post("/", h.AddSet)
		r.Delete("/", h.RemoveSet)
	})

	r.Route("/class_user", func(r chi.Router) {
		r.Post("/", h.JoinClass)
		r.Delete("/", h.LeaveClass)
		r.Get("/classes", h.GetClassesOfAUser)
		r.Get("/members", h.GetMembersOfAClass)
		// r.Get("/getstudents", h.GetStudentsOfAClass)
		// r.Get("/getteacher", h.GetTeacherOfAClass)
	})

	// -------------------simple-------------------------

	r.Route("/classes", func(r chi.Router) {
		r.Get("/list", h.ListClasses)
		r.Get("/", h.GetClassById)
		r.Post("/", h.CreateClass)
		r.Put("/name", h.UpdateClass)
		r.Put("/description", h.UpdateClass)
		// r.Delete("/", h.DeleteClass)
	})

	r.Route("/flashcards", func(r chi.Router) {
		r.Post("/", h.CreateFlashcard)
		r.Put("/front", h.UpdateFlashcard)
		r.Put("/back", h.UpdateFlashcard)
		r.Put("/setid", h.UpdateFlashcard)
		// r.Delete("/", h.DeleteFlashcard)

		r.Route("/sets", func(r chi.Router) {
			r.Get("/", h.GetFlashcardSetById)
			r.Post("/", h.CreateFlashcardSet)
			r.Put("/name", h.UpdateFlashcardSet)
			r.Put("/description", h.UpdateFlashcardSet)
			// r.Delete("/", h.DeleteFlashcardSet)
		})
	})

	// CreateUser and GetUserBy{Email,Username} are called from the unprotected routes
	r.Route("/users", func(r chi.Router) {
		r.Get("/list", h.ListUsers)
		r.Get("/", h.GetUserById)
		r.Put("/username", h.UpdateUser)
		r.Put("/email", h.UpdateUser)
		r.Put("/firstname", h.UpdateUser)
		r.Put("/lastname", h.UpdateUser)
		r.Put("/password", h.UpdateUser)
		// r.Delete("/", h.DeleteUser)
	})
}

// auth
func Unprotected(r *chi.Mux, h *controllers.Handler) {
	r.Post("/login", h.Login)
	r.Post("/signup", h.Signup)
}
