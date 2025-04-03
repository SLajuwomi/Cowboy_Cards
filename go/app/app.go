package app

import (
	"context"
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

func LoadPoolConfig() (config *pgxpool.Config) {
	var (
		dburl  = os.Getenv("DATABASE_URL")
		dbuser = os.Getenv("DBUSER")
		dbhost = os.Getenv("DBHOST")
	)
	log.Println("  ")
	log.Println("Environment variables:")
	log.Printf("dburl: %q, dbuser: %q, dbhost: %q", dburl, dbuser, dbhost)

	// Check if .env file exists and is readable
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		log.Println("WARNING: .env file does not exist in current directory")
	} else if err != nil {
		log.Printf("WARNING: Error checking .env file: %v", err)
	} else {
		log.Println("INFO: .env file exists in current directory")
	}

	// Print current working directory to help with troubleshooting
	cwd, err := os.Getwd()
	if err != nil {
		log.Printf("ERROR: Unable to get current working directory: %v", err)
	} else {
		log.Printf("Current working directory: %s", cwd)
	}

	if dburl == "" || dbuser == "" || dbhost == "" {
		log.Fatalf("ERROR: Database environment variables not loaded properly")
	}

	config, parseErr := pgxpool.ParseConfig(dburl)
	if parseErr != nil {
		log.Fatalf("ERROR: Error parsing config: %v", parseErr)
	}

	config.ConnConfig.User = dbuser
	config.ConnConfig.Host = dbhost
	log.Println("INFO: Database configuration loaded successfully")

	return
}

func CreatePool(config *pgxpool.Config) (h *controllers.Embed) {
	ctx := context.Background()

	pgpool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		log.Fatalf("error creating connection pool: %v", err)
	}

	if err := pgpool.Ping(ctx); err != nil {
		log.Fatalf("error connecting to database: %v", err)
	}

	log.Println("Successfully connected to database")

	h = &controllers.Embed{
		Handler: middleware.Handler{DB: pgpool},
	}

	// Enable SSL for Supabase
	// conn.TLSConfig = &tls.Config{
	// 	MinVersion: tls.VersionTLS12,
	// }

	return
}

func Init() {
	cfg := LoadPoolConfig()
	h := CreatePool(cfg)

	//mw for protected routes only
	protectedRoutes := chi.NewRouter()
	routes.Protected(protectedRoutes, h)
	protectedRouteHandler := negroni.New()
	// Use either JWT Auth or Session Auth
	protectedRouteHandler.Use(negroni.HandlerFunc(middleware.SessionAuth))
	// Uncomment the line below to use JWT Auth instead of or in addition to Session Auth
	// protectedRouteHandler.Use(negroni.HandlerFunc(middleware.Auth))
	protectedRouteHandler.UseHandler(protectedRoutes)

	//mw for every route
	unprotectedRoutes := chi.NewRouter()
	routes.Unprotected(unprotectedRoutes, h)
	n := negroni.Classic() // serves "./public"
	n.Use(middleware.Cors)
	n.Use(negroni.HandlerFunc(middleware.SetCacheControlHeader))
	// Add CSRF protection middleware
	n.Use(negroni.HandlerFunc(middleware.CSRFMiddleware))
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
