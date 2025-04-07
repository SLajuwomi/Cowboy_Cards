package middleware

import (
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"slices"
	"strconv"
	"strings"
	"time"

	// "github.com/gorilla/csrf"
	// "github.com/gorilla/sessions"
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"
)

type userIdKey string

type Handler struct {
	DB *pgxpool.Pool
}

const userKey userIdKey = "userId"

const sessionName = "cowboy-cards-session"

var (
	sessionKey = os.Getenv("SESSION_KEY")
	sKey, _    = hex.DecodeString(sessionKey)
	store      = sessions.NewCookieStore(sKey)
	Cors       = cors.New(cors.Options{
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

// Initialize session store with secure options
func init() {
	log.Println("init")

	// MaxAge=0 means no Max-Age attribute specified and the cookie will be
	// deleted after the browser session ends.
	// MaxAge<0 means delete cookie immediately.
	// MaxAge>0 means Max-Age attribute present and given in seconds.
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   0,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	}

}

func LogAndSendError(w http.ResponseWriter, err error, msg string, statusCode int) {
	log.Printf(msg+": %v", err)
	http.Error(w, msg, statusCode)
}

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

func FromContext(ctx context.Context) (id int32, ok bool) {
	id, ok = ctx.Value(userKey).(int32)
	return
}

func GetInt32Id(val string) (id int32, err error) {
	idInt, err := strconv.Atoi(val)
	if err != nil {
		return 0, err
	}
	if idInt < 1 {
		return 0, errors.New("invalid id")
	}

	id = int32(idInt)

	return
}

func GetHeaderVals(r *http.Request, headers ...string) (map[string]string, error) {
	reqHeaders := r.Header
	vals := map[string]string{}

	for k := range reqHeaders {
		lower := strings.ToLower(k)
		if slices.Contains(headers, lower) {
			val := reqHeaders.Get(k)
			if val == "" {
				return nil, fmt.Errorf("%v header missing", k)
			}
			vals[lower] = val
		}
	}
	if len(vals) != len(headers) {
		return nil, errors.New("header(s) missing")
	}

	return vals, nil
}

func GetQueryConnAndContext(r *http.Request, h *Handler) (query *db.Queries, ctx context.Context, conn *pgxpool.Conn, err error) {
	ctx = r.Context()

	conn, err = h.DB.Acquire(ctx)
	if err != nil {
		return nil, nil, nil, err
	}

	query = db.New(conn)

	return
}

func Auth(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	log.Printf("DEBUG: Auth middleware called for path: %s", r.URL.Path)

	ctx := r.Context()

	// Log all cookies received in the request
	cookies := r.Cookies()
	if len(cookies) > 0 {
		log.Printf("DEBUG: Request contains %d cookies", len(cookies))
		for _, cookie := range cookies {
			log.Printf("DEBUG: Cookie found - Name: %s, Path: %s, Domain: %s", cookie.Name, cookie.Path, cookie.Domain)
		}
	} else {
		log.Printf("DEBUG: No cookies found in request")
	}

	session, err := store.Get(r, sessionName)
	if err != nil {
		LogAndSendError(w, err, "Failed to get session", http.StatusInternalServerError)
		return
	}

	// Check if user is authenticated
	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
		LogAndSendError(w, errors.New("unauthed"), "User not authenticated, redirecting", http.StatusUnauthorized)
		return
	}

	// Get user ID from session
	userID, ok := session.Values["user_id"].(int32)
	if !ok {
		LogAndSendError(w, errors.New("unauthed"), "User not authorized, redirecting", http.StatusUnauthorized)
		return
	}

	ctx = context.WithValue(r.Context(), userKey, userID)

	next(w, r.WithContext(ctx))
}

func (h *Handler) VerifyTeacherMW(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query, ctx, conn, err := GetQueryConnAndContext(r, h)
		if err != nil {
			LogAndSendError(w, err, "Database connection error", http.StatusInternalServerError)
			return
		}
		defer conn.Release()
		// Get user_id from context (set by AuthMiddleware)
		// id, ok := FromContext(ctx)
		// if !ok {
		//      LogAndSendError(w, err, "Unauthorized", http.StatusUnauthorized)
		//      return
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

		cid, err := GetInt32Id(headerVals["id"])
		if err != nil {
			LogAndSendError(w, err, "Invalid class id", http.StatusBadRequest)
			return
		}

		teacher, err := query.VerifyTeacher(ctx, db.VerifyTeacherParams{
			ClassID: cid,
			UserID:  id,
		})
		log.Println("teacher", teacher)

		if err != nil {
			LogAndSendError(w, err, "Invalid permissions", http.StatusInternalServerError)
			return
		}
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
		// id, ok := FromContext(ctx)
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
		// id, ok := FromContext(ctx)
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

// CreateSession creates a new session for the user
func CreateSession(w http.ResponseWriter, r *http.Request, userID int32) error {
	log.Printf("DEBUG: Creating session for user ID: %d", userID)
	session, err := store.Get(r, sessionName)
	if err != nil {
		log.Printf("ERROR: Failed to get session: %v", err)
		return err
	}

	// Set session values
	session.Values["authenticated"] = true
	session.Values["user_id"] = userID
	// session.Values["session_id"] = uuid.NewString()
	session.Values["created_at"] = time.Now().Unix()
	// session.Values["paseto_token"] = token

	log.Printf("DEBUG: Session cookie options: Path=%s, MaxAge=%d, HttpOnly=%v, Secure=%v, SameSite=%v",
		session.Options.Path, session.Options.MaxAge, session.Options.HttpOnly, session.Options.Secure, session.Options.SameSite)
	// Save session
	err = session.Save(r, w)
	if err != nil {
		log.Printf("ERROR: Failed to save session: %v", err)
		return err
	}

	log.Printf("DEBUG: Session successfully created for user ID: %d", userID)
	return nil
}

// ClearSession removes the session for the current user
// func ClearSession(w http.ResponseWriter, r *http.Request) error {
// 	session, err := store.Get(r, sessionName)
// 	if err != nil {
// 		return err
// 	}

// 	// Clear session values
// 	session.Values = make(map[interface{}]interface{})

// 	// Set MaxAge to -1 to delete the cookie
// 	session.Options.MaxAge = -1

// 	// Save session
// 	return session.Save(r, w)
// }
