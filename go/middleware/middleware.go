package middleware

import (
	"context"
	"log"
	"net/http"
	"path"
	"strings"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
	"github.com/rs/cors"
)

var (
	Cors = cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8100", "http://localhost:8000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
		ExposedHeaders: []string{"Link"},
		// ExposedHeaders:   []string{"Link", "X-CSRF-Token"}, // Expose CSRF token header
		AllowCredentials: true,
		Debug:            false,
		MaxAge:           300,
	})
)

func SetCacheControlHeader(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	str := ""

	if path.Clean(r.URL.Path) == "/" || strings.Contains(path.Clean(r.URL.Path), "/api/") {
		str = "no-cache, no-store, must-revalidate"
	} else {
		str = "public, max-age=31536000, immutable"
	}

	w.Header().Set("Cache-Control", str)
	next(w, r)
}

func SetCredsHeaders(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {

	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8080")
	w.Header().Set("Vary", "Origin")
	next(w, r)
}

func (h *Handler) VerifyTeacherMW(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("DEBUG: VerifyTeacherMW called for path: %s", r.URL.Path)

		query, ctx, conn, err := GetQueryConnAndContext(r, h)
		if err != nil {
			LogAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
			return
		}
		defer conn.Release()

		// Get user_id from context (set by AuthMiddleware)
		userID, ok := GetUserIDFromContext(ctx)
		if !ok {
			LogAndSendError(w, err, "Unauthorized", http.StatusUnauthorized)
			return
		}

		headerVals, err := GetHeaderVals(r, "id")
		if err != nil {
			LogAndSendError(w, err, "Header error", http.StatusBadRequest)
			return
		}

		// id, err := GetInt32Id(headerVals["user_id"])
		// if err != nil {
		// 	LogAndSendError(w, err, "Invalid id", http.StatusBadRequest)
		// 	return
		// }

		classID, err := GetInt32Id(headerVals["id"])
		if err != nil {
			LogAndSendError(w, err, "Invalid class id", http.StatusBadRequest)
			return
		}

		teacher, err := query.VerifyTeacher(ctx, db.VerifyTeacherParams{
			ClassID: classID,
			UserID:  userID,
		})
		if err != nil {
			LogAndSendError(w, err, "Invalid permissions", http.StatusUnauthorized)
			return
		}

		log.Println("teacher: ", teacher)

		ctx = context.WithValue(ctx, classKey, classID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (h *Handler) VerifyFlashcardOwnerMW(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query, ctx, conn, err := GetQueryConnAndContext(r, h)
		if err != nil {
			LogAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
			return
		}
		defer conn.Release()
		// Get user_id from context (set by AuthMiddleware)
		// id, ok := GetUserIDFromContext(ctx)
		// if !ok {
		// 	LogAndSendError(w, err, "Unauthorized", http.StatusUnauthorized)
		// 	return
		// }

		// THIS IS FOR TESTING
		headerVals, err := GetHeaderVals(r, "id", "user_id")
		if err != nil {
			LogAndSendError(w, err, "Header error", http.StatusBadRequest)
			return
		}

		id, err := GetInt32Id(headerVals["user_id"])
		if err != nil {
			LogAndSendError(w, err, "Invalid id", http.StatusBadRequest)
			return
		}

		flashcardID, err := GetInt32Id(headerVals["id"])
		if err != nil {
			LogAndSendError(w, err, "Invalid class id", http.StatusBadRequest)
			return
		}

		owner, err := query.VerifyFlashcardOwner(ctx, db.VerifyFlashcardOwnerParams{
			UserID: id,
			ID:     flashcardID,
		})
		log.Println("owner", owner)

		if err != nil {
			LogAndSendError(w, err, "Invalid permissions", http.StatusInternalServerError)
			return
		}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (h *Handler) VerifySetOwnerMW(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query, ctx, conn, err := GetQueryConnAndContext(r, h)
		if err != nil {
			LogAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
			return
		}
		defer conn.Release()
		// Get user_id from context (set by AuthMiddleware)
		// id, ok := GetUserIDFromContext(ctx)
		// if !ok {
		// 	LogAndSendError(w, err, "Unauthorized", http.StatusUnauthorized)
		// 	return
		// }

		// THIS IS FOR TESTING
		headerVals, err := GetHeaderVals(r, "id", "user_id")
		if err != nil {
			LogAndSendError(w, err, "Header error", http.StatusBadRequest)
			return
		}

		id, err := GetInt32Id(headerVals["user_id"])
		if err != nil {
			LogAndSendError(w, err, "Invalid id", http.StatusBadRequest)
			return
		}

		sid, err := GetInt32Id(headerVals["id"])
		if err != nil {
			LogAndSendError(w, err, "Invalid class id", http.StatusBadRequest)
			return
		}

		owner, err := query.VerifySetOwner(ctx, db.VerifySetOwnerParams{
			UserID: id,
			SetID:  sid,
		})
		log.Println("owner", owner)

		if err != nil {
			LogAndSendError(w, err, "Invalid permissions", http.StatusInternalServerError)
			return
		}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
