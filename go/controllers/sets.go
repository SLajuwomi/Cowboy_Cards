package controllers

import (
	"encoding/json"
	"errors"
	"net/http"
	"path"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
)

// func (h *Handler) ListFlashcardsets(w http.ResponseWriter, r *http.Request) {
// 	// curl http://localhost:8000/api/flashcards/list | jq

// 	query, ctx, conn, err := getQueryConnAndContext(r, h)
// 	if err != nil {
// 		logAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
// 		return
// 	}
// 	defer conn.Release()

// 	classes, err := query.ListClasses(ctx)
// 	if err != nil {
// 		logAndSendError(w, err, "Error getting classes from DB", http.StatusInternalServerError)
// 		return
// 	}

// 	// w.Header().Set("Content-Type", "application/json")
// 	if err := json.NewEncoder(w).Encode(classes); err != nil {
// 		logAndSendError(w, err, "Error encoding response", http.StatusInternalServerError)
// 	}
// }

func (h *Handler) GetFlashcardSetById(w http.ResponseWriter, r *http.Request) {
	// curl http://localhost:8000/api/flashcards/sets/ -H "id: 1"

	query, ctx, conn, err := getQueryConnAndContext(r, h)
	if err != nil {
		logAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	headerVals, err := getHeaderVals(r, "id")
	if err != nil {
		logAndSendError(w, err, "Header error", http.StatusBadRequest)
		return
	}

	id, err := getInt32Id(headerVals["id"])
	if err != nil {
		logAndSendError(w, err, "Invalid id", http.StatusBadRequest)
		return
	}

	flashcard, err := query.GetFlashcardSetById(ctx, id)
	if err != nil {
		logAndSendError(w, err, "Failed to get flashcard set", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(flashcard); err != nil {
		logAndSendError(w, err, "Error encoding response", http.StatusInternalServerError)
	}
}

func (h *Handler) CreateFlashcardSet(w http.ResponseWriter, r *http.Request) {
	// curl -X POST localhost:8000/api/flashcards/sets -H "name: Knights Errant" -H "description: collection of famous knights"
	query, ctx, conn, err := getQueryConnAndContext(r, h)
	if err != nil {
		logAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	headerVals, err := getHeaderVals(r, "name", "description")
	if err != nil {
		logAndSendError(w, err, "Header error", http.StatusBadRequest)
		return
	}

	err = query.CreateFlashcardSet(ctx, db.CreateFlashcardSetParams{
		SetName:        headerVals["name"],
		SetDescription: headerVals["description"],
	})
	if err != nil {
		logAndSendError(w, err, "Failed to create flashcard set", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode("Flashcard Set created"); err != nil {
		logAndSendError(w, err, "Error encoding response", http.StatusInternalServerError)
	}
}

func (h *Handler) UpdateFlashcardSet(w http.ResponseWriter, r *http.Request) {
	// curl -X PUT localhost:8000/api/flashcards/sets/name -H "id: 1" -H "name: Dad Jokes"

	query, ctx, conn, err := getQueryConnAndContext(r, h)
	if err != nil {
		logAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	route := path.Base(r.URL.Path)

	headerVals, err := getHeaderVals(r, "id", route)
	if err != nil {
		logAndSendError(w, err, "Header error", http.StatusBadRequest)
		return
	}

	id, err := getInt32Id(headerVals["id"])
	if err != nil {
		logAndSendError(w, err, "Invalid id", http.StatusBadRequest)
		return
	}

	val := headerVals[route]

	var res string
	switch route {
	case "name":
		res, err = query.UpdateFlashcardSetName(ctx, db.UpdateFlashcardSetNameParams{
			SetName: val,
			ID:      id,
		})
	case "description":
		res, err = query.UpdateFlashcardSetDescription(ctx, db.UpdateFlashcardSetDescriptionParams{
			SetDescription: val,
			ID:             id,
		})
	default:
		logAndSendError(w, errors.New("invalid column"), "Improper header", http.StatusBadRequest)
		return
	}

	if err != nil {
		logAndSendError(w, err, "Failed to update flashcard set", http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(res); err != nil {
		logAndSendError(w, err, "Error encoding response", http.StatusInternalServerError)
	}
}

func (h *Handler) DeleteFlashcardSet(w http.ResponseWriter, r *http.Request) {
	// curl -X DELETE http://localhost:8000/api/flashcards/sets -H "id: 1"

	query, ctx, conn, err := getQueryConnAndContext(r, h)
	if err != nil {
		logAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	headerVals, err := getHeaderVals(r, "id")
	if err != nil {
		logAndSendError(w, err, "Header error", http.StatusBadRequest)
		return
	}

	id, err := getInt32Id(headerVals["id"])
	if err != nil {
		logAndSendError(w, err, "Invalid id", http.StatusBadRequest)
		return
	}

	err = query.DeleteFlashcardSet(ctx, id)
	if err != nil {
		logAndSendError(w, err, "Failed to delete flashcard set", http.StatusInternalServerError)
		return
	}

	// no body is sent with a 204 response
	w.WriteHeader(http.StatusNoContent)
	w.Write([]byte{})
}
