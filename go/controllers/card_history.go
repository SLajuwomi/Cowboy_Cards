package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
)

func (h *Handler) UpsertCorrectFlashcardScore(w http.ResponseWriter, r *http.Request) {
	// curl -X POST localhost:8000/api/card_history/incscore -H "user_id: 1" -H "card_id: 1"
	query, ctx, conn, err := getQueryConnAndContext(r, h)
	if err != nil {
		logAndSendError(w, err, "Error connecting to database", http.StatusInternalServerError)
		return;
	}
	defer conn.Release()

	headerVals, err := getHeaderVals(r, "user_id", "card_id")
	if err != nil {
		logAndSendError(w, err, "Header error", http.StatusBadRequest)
		return;
	}

	uid, err := getInt32Id(headerVals["user_id"])
	if err != nil {
		logAndSendError(w, err, "Invalid card id", http.StatusBadRequest)
		return;
	}
	cid, err := getInt32Id(headerVals["card_id"])
	if err != nil {
		logAndSendError(w, err, "Invalid card id", http.StatusBadRequest)
		return;
	}

	err = query.UpsertCorrectFlashcardScore(ctx, db.UpsertCorrectFlashcardScoreParams{
		UserID: uid,
		CardID: cid,
	})

	if err != nil {
		logAndSendError(w, err, "Error updating score", http.StatusInternalServerError)
		return;
	}

	w.WriteHeader(http.StatusCreated)	// TODO - WriteHeader insert case only, not update case
	if err = json.NewEncoder(w).Encode("Score updated"); err != nil {
		logAndSendError(w, err, "Error encoding message", http.StatusInternalServerError)
	}
}

func (h *Handler) UpsertIncorrectFlashcardScore(w http.ResponseWriter, r *http.Request) {
	// curl -X POST localhost:8000/api/card_history/decscore -H "user_id: 1" -H "card_id: 1"
	query, ctx, conn, err := getQueryConnAndContext(r, h)
	if err != nil {
		logAndSendError(w, err, "Error connecting to database", http.StatusInternalServerError)
		return;
	}
	defer conn.Release()

	headerVals, err := getHeaderVals(r, "user_id", "card_id")
	if err != nil {
		logAndSendError(w, err, "Header error", http.StatusBadRequest)
		return;
	}

	uid, err := getInt32Id(headerVals["user_id"])
	if err != nil {
		logAndSendError(w, err, "Invalid card id", http.StatusBadRequest)
		return;
	}
	cid, err := getInt32Id(headerVals["card_id"])
	if err != nil {
		logAndSendError(w, err, "Invalid card id", http.StatusBadRequest)
		return;
	}

	err = query.UpsertIncorrectFlashcardScore(ctx, db.UpsertIncorrectFlashcardScoreParams{
		UserID: uid,
		CardID: cid,
	})

	if err != nil {
		logAndSendError(w, err, "Error updating score", http.StatusInternalServerError)
		return;
	}

	w.WriteHeader(http.StatusCreated)	// TODO - WriteHeader insert case only, not update case
	if err = json.NewEncoder(w).Encode("Score updated"); err != nil {
		logAndSendError(w, err, "Error encoding message", http.StatusInternalServerError)
	}
}