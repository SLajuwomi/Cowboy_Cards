package controllers

import (
	"encoding/json"
	// "errors"
	"net/http"
	// "path"
	// "strings"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
)

func (h *Handler) JoinClass(w http.ResponseWriter, r *http.Request) {
	//curl -X POST localhost:8000/api/class_user -H "user_id: 1" -H "class_id: 1" -H "role: Student"
	query, ctx, conn, err := getQueryConnAndContext(r, h);
	if err != nil {
		logAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
		return;
	}
	defer conn.Release()

	headerVals, err := getHeaderVals(r, "user_id", "class_id", "role")
	if err != nil {
		logAndSendError(w, err, "Header error", http.StatusBadRequest)
		return;
	}

	uid, err := getInt32Id(headerVals["user_id"])
	if err != nil {
		logAndSendError(w, err, "Invalid user id", http.StatusBadRequest)
		return;
	}

	cid, err := getInt32Id(headerVals["class_id"])
	if err != nil {
		logAndSendError(w, err, "Invalid class id", http.StatusBadRequest)
		return;
	}

	err = query.JoinClass(ctx, db.JoinClassParams{
		UserID: uid,
		ClassID: cid,
		Role: headerVals["role"],
	})
	if err != nil {
		logAndSendError(w, err, "Failed to join class", http.StatusInternalServerError)
		return;
	}

	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode("Class joined"); err != nil {
		logAndSendError(w, err, "Error encoding response", http.StatusInternalServerError)
	}
}