package routes

import (
	"net/http"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/go-chi/chi/v5"
)

func Routes(r *chi.Mux) {
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world\n"))
	})
	r.Get("/classes", controllers.GetClasses)
	r.Get("/users", controllers.GetUsers)
	r.Get("/user", controllers.GetUser)

}
