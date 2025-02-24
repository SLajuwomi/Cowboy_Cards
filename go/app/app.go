package app

import (
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/routes"
	"github.com/go-chi/chi/v5"
	_ "github.com/joho/godotenv/autoload"
	"github.com/urfave/negroni/v3"
)

func LoadConfig() (*controllers.Config, error) {
	cfg := &controllers.Config{
		DB: controllers.PostgresConfig(os.Getenv("DATABASE_URL")),
	}

	return cfg, nil
}

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
	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("error getting config: %v", err)
	}

	r := chi.NewRouter()

	routes.Routes(r, cfg)
	// curl http://localhost:8000
	// curl http://localhost:8000/classes

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
