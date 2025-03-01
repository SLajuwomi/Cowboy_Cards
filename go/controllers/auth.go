package controllers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	jwt "github.com/golang-jwt/jwt/v5"
)

// User represents the user data that will be sent to the client
type UserResponse struct {
	ID        int32     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Role      string    `json:"role"`
	Token     string    `json:"token,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// SignupRequest represents the data needed for user registration
type SignupRequest struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
}

// LoginRequest represents the data needed for user login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse represents the response sent after successful authentication
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// User struct for database operations
type User struct {
	ID        int32
	Username  string
	Email     string
	Password  string
	FirstName string
	LastName  string
	Role      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// JWT claims structure
type Claims struct {
	UserID int32  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// JWT secret key - should be stored in environment variables in production
var jwtKey = []byte("your_secret_key")

// Signup handles user registration
func (cfg *Config) Signup(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Username == "" || req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		sendErrorResponse(w, "All fields are required", "missing_fields", http.StatusBadRequest)
		return
	}

	// Validate email format
	if !isValidEmail(req.Email) {
		sendErrorResponse(w, "Invalid email format", "invalid_email", http.StatusBadRequest)
		return
	}

	// Validate password strength
	if len(req.Password) < 6 {
		sendErrorResponse(w, "Password must be at least 6 characters", "weak_password", http.StatusBadRequest)
		return
	}

	// Set default role if not provided
	if req.Role == "" {
		req.Role = "regular"
	}

	// Validate role is one of the allowed values
	if !isValidRole(req.Role) {
		sendErrorResponse(w, "Invalid role. Must be 'regular', 'student', or 'teacher'", "invalid_role", http.StatusBadRequest)
		return
	}

	// Check if email already exists
	existingUserByEmail, err := getUserByEmail(r.Context(), cfg.DB, req.Email)
	if err == nil && existingUserByEmail != nil && existingUserByEmail.ID > 0 {
		sendErrorResponse(w, "Email already registered", "duplicate_email", http.StatusConflict)
		return
	}

	// Check if username already exists
	existingUserByUsername, err := getUserByUsername(r.Context(), cfg.DB, req.Username)
	if err == nil && existingUserByUsername != nil && existingUserByUsername.ID > 0 {
		sendErrorResponse(w, "Username already taken", "duplicate_username", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		sendErrorResponse(w, "Error processing password", "server_error", http.StatusInternalServerError)
		return
	}

	// Create user
	user := User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      req.Role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save user to database
	newUser, err := createUser(r.Context(), cfg.DB, user)
	if err != nil {
		sendErrorResponse(w, "Error creating user", "server_error", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	token, err := generateToken(newUser.ID, newUser.Email, newUser.Role)
	if err != nil {
		sendErrorResponse(w, "Error generating token", "server_error", http.StatusInternalServerError)
		return
	}

	// Return token and user data
	response := AuthResponse{
		Token: token,
		User:  *newUser,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Login handles user authentication
func (cfg *Config) Login(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		sendErrorResponse(w, "Email and password are required", "missing_fields", http.StatusBadRequest)
		return
	}

	// Get user by email
	user, err := getUserByEmail(r.Context(), cfg.DB, req.Email)
	if err != nil || user == nil || user.ID == 0 {
		sendErrorResponse(w, "Invalid email or password", "invalid_credentials", http.StatusUnauthorized)
		return
	}

	// Check password
	if !checkPasswordHash(req.Password, user.Password) {
		sendErrorResponse(w, "Invalid email or password", "invalid_credentials", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		sendErrorResponse(w, "Error generating token", "server_error", http.StatusInternalServerError)
		return
	}

	// Return token and user data
	response := AuthResponse{
		Token: token,
		User:  *user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Helper function to send error responses with specific error codes
func sendErrorResponse(w http.ResponseWriter, message string, code string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{
		Message: message,
		Code:    code,
	})
}

// Helper function to validate email format
func isValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

// Helper function to validate role
func isValidRole(role string) bool {
	validRoles := map[string]bool{
		"regular": true,
		"student": true,
		"teacher": true,
	}
	return validRoles[role]
}

// Helper function to get user by username
func getUserByUsername(ctx context.Context, conn *pgxpool.Pool, username string) (*User, error) {
	// Query database for user with the given username
	var user User
	query := `SELECT id, username, email, password, first_name, last_name, role, created_at, updated_at FROM users WHERE username = $1 LIMIT 1`
	
	row := conn.QueryRow(ctx, query, username)
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.FirstName, &user.LastName, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No user found
		}
		return nil, err
	}
	
	return &user, nil
}

// Helper function to hash password
func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// Helper function to check password hash
func checkPasswordHash(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Helper function to generate JWT token
func generateToken(userID int32, email string, role string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// CreateUser creates a new user in the database
func createUser(ctx context.Context, conn *pgxpool.Pool, user User) (*User, error) {
	query := `
		INSERT INTO users (username, email, password, first_name, last_name, role)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, username, email, password, first_name, last_name, role, created_at, updated_at
	`
	
	var createdUser User
	err := conn.QueryRow(ctx, query, 
		user.Username, 
		user.Email, 
		user.Password, 
		user.FirstName, 
		user.LastName, 
		user.Role).Scan(
		&createdUser.ID,
		&createdUser.Username,
		&createdUser.Email,
		&createdUser.Password,
		&createdUser.FirstName,
		&createdUser.LastName,
		&createdUser.Role,
		&createdUser.CreatedAt,
		&createdUser.UpdatedAt,
	)
	
	if err != nil {
		return nil, fmt.Errorf("error creating user: %w", err)
	}
	
	return &createdUser, nil
}

// GetUserByEmail retrieves a user by email
func getUserByEmail(ctx context.Context, conn *pgxpool.Pool, email string) (*User, error) {
	query := `
		SELECT id, username, email, password, first_name, last_name, role, created_at, updated_at 
		FROM users 
		WHERE email = $1
	`
	
	var user User
	err := conn.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		return nil, fmt.Errorf("error getting user by email: %w", err)
	}
	
	return &user, nil
}
