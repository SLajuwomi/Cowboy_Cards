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

/* GetClasses retrieves all classes from the database and returns them as a JSON response */
func (cfg *Config) GetClasses(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		log.Printf("could not connect to db... %v", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	classes, err := querier.GetClasses(ctx)
	if err != nil {
		log.Printf("error getting classes from db... %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(classes); err != nil {
		log.Printf("error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

/* GetUsersFlashCardSets retrieves all flash card sets for a user from the database and returns them as a JSON response*/
func (cfg *Config) GetUsersFlashCardSets(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("user_id")
	if userIDStr == "" {
		http.Error(w, "missing 'user_id' header", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Printf("error parsing user_id: %v", err)
		http.Error(w, "Invalid 'user_id' header", http.StatusBadRequest)
		return
	}

	id := int32(userID)
	if id == 0 {
		http.Error(w, "Invalid 'user_id' header", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		log.Printf("could not connect to db... %v", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	flashcard_sets, err := querier.GetUsersFlashCardSets(ctx, int32(id))
	if err != nil {
		log.Printf("error getting flash card sets from db... %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(flashcard_sets); err != nil {
		log.Printf("error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

/* GetUsers retrieves all users from the database and returns them as a JSON response */
func (cfg *Config) GetUsers(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		log.Printf("could not connect to db... %v", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	users, err := querier.GetUsers(ctx)
	if err != nil {
		log.Printf("error getting users from db... %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(users); err != nil {
		log.Printf("error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

/* GetUser retrieves a single user from the database by ID and returns it as a JSON response */
func (cfg *Config) GetUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		log.Printf("Invalid user ID: %v", err)
		return
	}

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		log.Printf("Database connection error: %v", err)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	user, err := querier.GetUser(ctx, int32(id))
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		log.Printf("Database query error: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		log.Printf("JSON encoding error: %v", err)
		return
	}
}

/* CreateFlashCard creates a new flash card in the database */
func (cfg *Config) CreateFlashCard(w http.ResponseWriter, r *http.Request) {
	front := r.Header.Get("front")
	back := r.Header.Get("back")
	setIDStr := r.Header.Get("set_id")
	userIDStr := r.Header.Get("user_id")
	if front == "" || back == "" || setIDStr == "" || userIDStr == "" {
		http.Error(w, "missing required headers", http.StatusBadRequest)
		return
	}

	setID, err := strconv.Atoi(setIDStr)
	if err != nil {
		http.Error(w, "Invalid 'set_id' header", http.StatusBadRequest)
		return
	}
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid 'user_id' header", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		log.Printf("could not connect to db... %v", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	err = querier.CreateFlashCard(ctx, db.CreateFlashCardParams{
		Front:  front,
		Back:   back,
		SetID:  int32(setID),
		UserID: int32(userID),
	})
	if err != nil {
		log.Printf("error creating flash card: %v", err)
		http.Error(w, "Error creating flash card", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

/* GetFlashCard retrieves a flash card by ID */
func (cfg *Config) GetFlashCard(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid flash card ID", http.StatusBadRequest)
		return
	}

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		log.Printf("could not connect to db... %v", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	flashcard, err := querier.GetFlashCard(ctx, int32(id))
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "Flash card not found", http.StatusNotFound)
			return
		}
		log.Printf("error getting flash card: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(flashcard)
}

/* UpdateFlashCard updates a flash card's content */
func (cfg *Config) UpdateFlashCard(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid flash card ID", http.StatusBadRequest)
		return
	}

	front := r.Header.Get("front")
	back := r.Header.Get("back")
	if front == "" || back == "" {
		http.Error(w, "missing required headers", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		log.Printf("could not connect to db... %v", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	err = querier.UpdateFlashCard(ctx, db.UpdateFlashCardParams{
		Front: front,
		Back:  back,
		ID:    int32(id),
	})
	if err != nil {
		log.Printf("error updating flash card: %v", err)
		http.Error(w, "Error updating flash card", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

/* DeleteFlashCard deletes a flash card */
func (cfg *Config) DeleteFlashCard(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid flash card ID", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	conn, err := cfg.DB.Acquire(ctx)
	if err != nil {
		log.Printf("could not connect to db... %v", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	querier := db.New(conn)

	err = querier.DeleteFlashCard(ctx, int32(id))
	if err != nil {
		log.Printf("error deleting flash card: %v", err)
		http.Error(w, "Error deleting flash card", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
