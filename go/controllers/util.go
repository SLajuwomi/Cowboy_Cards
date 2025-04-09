package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

// wraps mw handler that wraps db pool
type DBHandler struct {
	middleware.Handler
}

// User represents the user data that will be sent to the client
type User struct {
	// ID        int32     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignupRequest represents the signup request body
type SignupRequest struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// AuthResponse represents the response sent after successful authentication
type AuthResponse struct {
	// Token     string `json:"token"`
	// UserID    int32  `json:"user_id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	// CSRFToken string `json:"csrf_token,omitempty"`
}

func logAndSendError(w http.ResponseWriter, err error, msg string, statusCode int) {
	middleware.LogAndSendError(w, err, msg, statusCode)
}

func getInt32Id(val string) (id int32, err error) {
	return middleware.GetInt32Id(val)
}

func getHeaderVals(r *http.Request, headers ...string) (map[string]string, error) {
	return middleware.GetHeaderVals(r, headers...)
}

func getQueryConnAndContext(r *http.Request, h *DBHandler) (query *db.Queries, ctx context.Context, conn *pgxpool.Conn, err error) {
	ctx = r.Context()

	conn, err = h.DB.Acquire(ctx)
	if err != nil {
		return nil, nil, nil, err
	}

	query = db.New(conn)

	return
}

// keygen:
// key := make([]byte, num)
// rand.Read(key)
// dst := make([]byte, base64.StdEncoding.EncodedLen(len(key)))
// base64.StdEncoding.Encode(dst, key)
// fmt.Println(string(dst))

// k := paseto.NewV4SymmetricKey()
// fmt.Println(k.ExportHex())
// https://go.dev/play/p/bClzAlvZnnq
