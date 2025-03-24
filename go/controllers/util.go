package controllers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	DB *pgxpool.Pool
}

// User represents the user data that will be sent to the client
type User struct {
	ID        int32     `json:"id"`
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
	Token     string `json:"token"`
	UserID    int32  `json:"user_id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func getInt32Id(val string) (id int32, err error) {
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

func getHeaderVals(r *http.Request, headers ...string) (map[string]string, error) {
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

func logAndSendError(w http.ResponseWriter, err error, msg string, statusCode int) {
	middleware.LogAndSendError(w, err, msg, statusCode)
}

func getQueryConnAndContext(r *http.Request, h *Handler) (query *db.Queries, ctx context.Context, conn *pgxpool.Conn, err error) {
	ctx = r.Context()

	conn, err = h.DB.Acquire(ctx)
	if err != nil {
		return nil, nil, nil, err
	}

	query = db.New(conn)

	return
}

func getTokenAndResponse(user db.User) (response AuthResponse, err error) {
	// Generate PASETO token instead of JWT
	tokenString, err := middleware.GeneratePasetoToken(user.ID)
	if err != nil {
		return AuthResponse{}, err
	}

	response = AuthResponse{
		Token:     tokenString, // We'll still return the token in the response for backward compatibility
		UserID:    user.ID,
		Username:  user.Username,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	}

	return response, nil
}

// keygen:
// key := make([]byte, num)
// rand.Read(key)
// dst := make([]byte, base64.StdEncoding.EncodedLen(len(key)))
// base64.StdEncoding.Encode(dst, key)
// fmt.Println(string(dst))
