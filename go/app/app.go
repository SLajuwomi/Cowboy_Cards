package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/controllers"
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/middleware"
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/routes"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload"
	"github.com/urfave/negroni/v3"
)

func LoadPoolConfig() (*pgxpool.Config, error) {
	var (
		dburl  = os.Getenv("DATABASE_URL")
		dbuser = os.Getenv("DB_USER")
		dbhost = os.Getenv("DB_HOST")
		dbport = os.Getenv("DB_PORT")
		dbname = os.Getenv("DB_NAME")
	)

	if dburl == "" || dbuser == "" || dbhost == "" || dbport == "" || dbname == "" {
		log.Fatalf("db env vars not loaded")
	}

	config, err := pgxpool.ParseConfig(dburl)
	if err != nil {
		return nil, fmt.Errorf("error creating connection pool: %v", err)
	}

	config.ConnConfig.User = dbuser
	config.ConnConfig.Host = dbhost

	return config, nil
}

func CreatePool(config *pgxpool.Config) (*controllers.Handler, error) {
	ctx := context.Background()

	pgpool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("error creating connection pool: %v", err)
	}

	if err := pgpool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("error connecting to database: %v", err)
	}

	log.Println("Successfully connected to database")

	h := &controllers.Handler{DB: pgpool}

	// Enable SSL for Supabase
	// conn.TLSConfig = &tls.Config{
	// 	MinVersion: tls.VersionTLS12,
	// }

	return h, nil
}

func Init() {
	cfg, err := LoadPoolConfig()
	if err != nil {
		log.Fatal(err)
	}
	h, err := CreatePool(cfg)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize PASETO configuration
	if err := middleware.InitPaseto(); err != nil {
		log.Fatal("Failed to initialize PASETO:", err)
	}

	//mw for protected routes only
	protectedRoutes := chi.NewRouter()
	routes.Protected(protectedRoutes, h)
	protectedRouteHandler := negroni.New()
	protectedRouteHandler.Use(negroni.HandlerFunc(middleware.PasetoAuth))
	protectedRouteHandler.UseHandler(protectedRoutes)

	//mw for every route
	unprotectedRoutes := chi.NewRouter()
	routes.Unprotected(unprotectedRoutes, h)
	n := negroni.Classic() // serves "./public"
	n.Use(middleware.Cors)
	n.Use(negroni.HandlerFunc(middleware.SetCacheControlHeader))
	n.UseHandler(unprotectedRoutes)

	unprotectedRoutes.Mount("/api", protectedRouteHandler)

	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "8000"
	}
	log.Println("server running on port " + port)

	srv := &http.Server{
		Handler:      n,
		Addr:         ":" + port,
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}
