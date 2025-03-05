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
	}
}

// func (cfg *Config) GetUsersFlashCardSets(w http.ResponseWriter, r *http.Request) {
// 	// curl -X GET localhost:8000/flashcard_sets -H "user_id: 11"

// 	userIDStr := r.Header.Get("user_id")
// 	if userIDStr == "" {
// 		http.Error(w, "missing 'user_id' header", http.StatusBadRequest)
// 		return
// 	}

// 	userID, err := strconv.Atoi(userIDStr)
// 	if err != nil {
// 		log.Println("error:", err)
// 		http.Error(w, "Invalid 'user_id' header", http.StatusBadRequest)
// 		return
// 	}

// 	id := int32(userID)
// 	if id == 0 {
// 		http.Error(w, "Invalid 'user_id' header", http.StatusBadRequest)
// 		return
// 	}

// 	ctx := context.Background()

// 	conn, err := pgx.ConnectConfig(ctx, cfg.DB)
// 	if err != nil {
// 		log.Fatalf("could not connect to db... %v", err)
// 	}
// 	defer conn.Close(ctx)

// 	query := db.New(conn)

// 	flashcard_sets, err := query.GetUsersFlashCardSets(ctx, int32(id))
// 	if err != nil {
// 		log.Fatalf("error getting flash card sets from db... %v", err)
// 	}
// 	log.Println("data: ", flashcard_sets[0])
// 	log.Println()

// 	b, err := json.Marshal(flashcard_sets)
// 	if err != nil {
// 		log.Println("error:", err)
// 	}

// 	w.Write(append(b, 10)) //add newline
// }

func (cfg *Config) CreateFlashCardSet(w http.ResponseWriter, r *http.Request) {
	// curl -X POST localhost:8000/flashcard_set -H "name: test" -H "description: test"

	name := r.Header.Get("name")
	description := r.Header.Get("description")
	if name == "" || description == "" {
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

	err = querier.CreateFlashCardSet(ctx, db.CreateFlashCardSetParams{
		Name:        name,
		Description: description,
	})
	if err != nil {
		log.Printf("error creating flashcard set in db: %v", err)
		http.Error(w, "Failed to create flashcard set", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (cfg *Config) GetFlashCardSet(w http.ResponseWriter, r *http.Request) {
	// curl -X GET localhost:8000/flashcard_set -H "id: 1"
	idStr := r.Header.Get("id")
	if idStr == "" {
		http.Error(w, "missing 'id' header", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("error parsing id: %v", err)
		http.Error(w, "Invalid 'id' header", http.StatusBadRequest)
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
	query := db.New(conn)
	flashcard_set, err := query.GetFlashCardSet(ctx, int32(id))
	if err != nil {
		log.Printf("error getting flash card set from db: %v", err)
		http.Error(w, "Failed to get flashcard set", http.StatusInternalServerError)
		return
	}
	log.Println("data: ", flashcard_set)
	log.Println()
	b, err := json.Marshal(flashcard_set)
	if err != nil {
		log.Println("error:", err)
	}
	w.Write(append(b, 10)) //add newline
}

func (cfg *Config) UpdateFlashCardSet(w http.ResponseWriter, r *http.Request) {
	// curl -X PUT localhost:8000/flashcard_set -H "id: 1" -H "name: test" -H "description: test"

	idStr := r.Header.Get("id")
	if idStr == "" {
		http.Error(w, "missing 'id' header", http.StatusBadRequest)
		return
	}

	name := r.Header.Get("name")
	description := r.Header.Get("description")
	if name == "" && description == "" {
		http.Error(w, "missing required headers", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("error parsing id: %v", err)
		http.Error(w, "Invalid 'id' header", http.StatusBadRequest)
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

	err = querier.UpdateFlashCardSet(ctx, db.UpdateFlashCardSetParams{
		ID:          int32(id),
		Name:        name,
		Description: description,
	})
	if err != nil {
		log.Printf("error updating flashcard set in db: %v", err)
		http.Error(w, "Failed to update flashcard set", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (cfg *Config) DeleteFlashCardSet(w http.ResponseWriter, r *http.Request) {
	// curl -X DELETE localhost:8000/flashcard_set -H "id: 1"

	idStr := r.Header.Get("id")
	if idStr == "" {
		http.Error(w, "missing 'id' header", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("error parsing id: %v", err)
		http.Error(w, "Invalid 'id' header", http.StatusBadRequest)
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

	err = querier.DeleteFlashCardSet(ctx, int32(id))
	if err != nil {
		log.Printf("error deleting flashcard set from db: %v", err)
		http.Error(w, "Failed to delete flashcard set", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

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
		log.Printf("error getting users from db: %v", err)
		http.Error(w, "Failed to get users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(users); err != nil {
		log.Printf("error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
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
	// curl -X POST localhost:8000/flashcard -H "front: front test" -H "back: back test" -H "set_id: 1"

	front := r.Header.Get("front")
	back := r.Header.Get("back")
	setIDStr := r.Header.Get("set_id")
	if front == "" || back == "" || setIDStr == "" {
		http.Error(w, "missing required headers", http.StatusBadRequest)
		return
	}

	setID, err := strconv.Atoi(setIDStr)
	if err != nil {
		log.Printf("error parsing set_id: %v", err)
		http.Error(w, "Invalid 'set_id' header", http.StatusBadRequest)
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
		Front: front,
		Back:  back,
		SetID: int32(setID),
	})
	if err != nil {
		log.Printf("error creating flash card: %v", err)
		http.Error(w, "Failed to create flash card", http.StatusInternalServerError)
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
