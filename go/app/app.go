package app

import (
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/routes"
	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/urfave/negroni/v3"
)

func setCacheControlHeader(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	str := ""

	if path.Clean(r.URL.Path) == "/" {
		str = "no-cache, no-store, must-revalidate"
	} else {
		str = "public, max-age=31536000, immutable"
	}

	w.Header().Set("Cache-Control", str)
	next(w, r)
}

func Init() {
	// fs := http.FileServer(http.Dir("./dist"))
	// http.Handle("/", fs)

	if err := godotenv.Load(); err != nil {
		log.Fatalf("could not load .env file... %v", err)
	}

	r := chi.NewRouter()

	routes.Routes(r)
	// curl http://localhost:8000
	// curl http://localhost:8000/books

	n := negroni.New()
	n.Use(negroni.NewLogger())
	n.Use(negroni.NewRecovery())
	n.Use(negroni.HandlerFunc(setCacheControlHeader))
	n.Use(negroni.NewStatic(http.Dir("./dist")))
	n.UseHandler(r)

	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "8000"
	}
	log.Println("server running on port " + port)

	srv := &http.Server{
		Handler:      n,
		Addr:         "127.0.0.1:" + port,
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}
