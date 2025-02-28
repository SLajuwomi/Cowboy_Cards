package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type Config struct {
	DB *pgx.ConnConfig
}

func (cfg *Config) GetClasses(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// log.Println("env", cfg.DB)

	conn, err := pgx.ConnectConfig(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("could not connect to db... %v", err)
	}
	defer conn.Close(ctx)

	query := db.New(conn)

	classes, err := query.GetClasses(ctx)
	if err != nil {
		log.Fatalf("error getting classes from db... %v", err)
	}
	log.Println("data: ", classes[0])
	log.Println()

	b, err := json.Marshal(classes)
	if err != nil {
		log.Println("error:", err)
	}

	w.Write(append(b, 10)) //add newline
}

func (cfg *Config) GetUsersFlashCardSets(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		log.Fatalf("could not parse query param as int... %v", err)
	}

	conn, err := pgx.ConnectConfig(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("could not connect to db... %v", err)
	}
	defer conn.Close(ctx)

	query := db.New(conn)

	flashcard_sets, err := query.GetUsersFlashCardSets(ctx, int32(id))
	if err != nil {
		log.Fatalf("error getting flash card sets from db... %v", err)
	}
	log.Println("data: ", flashcard_sets[0])
	log.Println()

	b, err := json.Marshal(flashcard_sets)
	if err != nil {
		log.Println("error:", err)
	}

	w.Write(append(b, 10)) //add newline
}

func (cfg *Config) GetUsers(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	conn, err := pgx.ConnectConfig(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("could not connect to db... %v", err)
	}
	defer conn.Close(ctx)

	query := db.New(conn)

	users, err := query.GetUsers(ctx)
	if err != nil {
		log.Fatalf("error getting users from db... %v", err)
	}
	log.Println("data: ", users)
	log.Println()

	b, err := json.Marshal(users)
	if err != nil {
		log.Println("error:", err)
	}

	w.Write(append(b, 10)) //add newline

}

func (cfg *Config) GetUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		log.Fatalf("could not parse query param as int... %v", err)
	}

	conn, err := pgx.ConnectConfig(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("could not connect to db... %v", err)
	}
	defer conn.Close(ctx)

	query := db.New(conn)

	user, err := query.GetUser(ctx, int32(id))
	if err != nil {
		log.Fatalf("error getting user from db... %v", err)
	}
	log.Println("data: ", user)
	log.Println()

	b, err := json.Marshal(user)
	if err != nil {
		log.Println("error:", err)
	}

	w.Write(append(b, 10)) //add newline

}
