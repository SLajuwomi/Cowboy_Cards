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

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
	"github.com/gorilla/csrf"
	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/o1egl/paseto"
	"github.com/rs/cors"
)

type userIdKey string

type Handler struct {
	DB *pgxpool.Pool
}

const userKey userIdKey = "userId"
const sessionName = "cowboy-cards-session"

// PasetoFooter contains additional data for the PASETO token
type PasetoFooter struct {
	Kid string `json:"kid,omitempty"`
}

// PasetoToken represents a PASETO token payload
type PasetoToken struct {
	Audience   string    `json:"aud,omitempty"`
	Issuer     string    `json:"iss,omitempty"`
	Jti        string    `json:"jti,omitempty"`
	Subject    string    `json:"sub,omitempty"`
	IssuedAt   time.Time `json:"iat,omitempty"`
	Expiration time.Time `json:"exp,omitempty"`
	NotBefore  time.Time `json:"nbf,omitempty"`
	UserID     int32     `json:"user_id,omitempty"`
}

var (
	// PASETO environment variables
	pasetoAud     = os.Getenv("PASETO_AUD")
	pasetoIss     = os.Getenv("PASETO_ISS")
	pasetoSecret  = os.Getenv("PASETO_SECRET")
	pasetoImplicit = os.Getenv("PASETO_IMPLICIT")
	
	// PASETO instance
	pasetoV2 = paseto.NewV2()
	
	// Session store for cookie-based sessions
	store = sessions.NewCookieStore([]byte(pasetoSecret))
	
	// Check if we're in development mode
	inDevelopment = os.Getenv("GO_ENV") != "production"
	
	// CORS configuration
	Cors = cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8100", "http://localhost:8000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link", "X-CSRF-Token"}, // Expose CSRF token header
		AllowCredentials: true,
		Debug:            false,
		MaxAge:           300,
	})
	
	// CSRF protection middleware
	csrfMiddleware = csrf.Protect(
		[]byte(pasetoImplicit),
		csrf.Secure(!inDevelopment), // Only require Secure in production
		csrf.SameSite(func() csrf.SameSiteMode {
			if inDevelopment {
				return csrf.SameSiteLaxMode // Less restrictive for development
			}
			return csrf.SameSiteStrictMode // More secure for production
		}()),
		csrf.Path("/"),
	)
)

// Initialize session store with secure options
func init() {
	// Configure session options based on environment
	if inDevelopment {
		// Development settings - less restrictive
		store.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7, // 7 days
			HttpOnly: true,      // Prevents JavaScript access
			Secure:   false,     // Allow HTTP for local development
			SameSite: http.SameSiteLaxMode, // Less restrictive for development
			Domain:   "",        // Empty domain works better for localhost
		}
		log.Println("INFO: Using development cookie settings (non-secure)")
		
		// In development, use a more visible key for debugging
		log.Printf("DEBUG: Session cookie name: %s", sessionName)
		
		// Disable CSRF in development for easier testing
		log.Println("DEBUG: CSRF protection is enabled but less restrictive in development")
	} else {
		// Production settings - more secure
		store.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7, // 7 days
			HttpOnly: true,      // Prevents JavaScript access
			Secure:   true,      // Requires HTTPS
			SameSite: http.SameSiteStrictMode,
		}
		log.Println("INFO: Using production cookie settings (secure)")
	}
	
	// Check if PASETO environment variables are properly set
	if pasetoSecret == "" || pasetoAud == "" || pasetoIss == "" || pasetoImplicit == "" {
		log.Println("WARNING: PASETO environment variables not properly set")
	} else {
		log.Println("PASETO environment variables loaded successfully", pasetoSecret, pasetoAud, pasetoIss, pasetoImplicit)
	}
}

// GeneratePasetoToken creates a new PASETO token for the given user ID
func GeneratePasetoToken(userID int32) (string, error) {
	// Convert hex string to byte array
	secretKey, err := hex.DecodeString(pasetoSecret)
	if err != nil {
		return "", fmt.Errorf("error decoding PASETO secret: %w", err)
	}

	now := time.Now()
	exp := now.Add(24 * time.Hour) // Token expires in 24 hours

	// Create token payload
	payload := PasetoToken{
		Audience:   pasetoAud,
		Issuer:     pasetoIss,
		Subject:    fmt.Sprintf("%d", userID),
		IssuedAt:   now,
		Expiration: exp,
		NotBefore:  now,
		UserID:     userID,
	}

	// Create footer
	footer := PasetoFooter{
		Kid: "session-key-1",
	}

	// Encode the token
	token, err := pasetoV2.Encrypt(secretKey, payload, footer)
	if err != nil {
		return "", fmt.Errorf("error creating PASETO token: %w", err)
	}

	return token, nil
}

// ValidatePasetoToken validates a PASETO token and returns the user ID
func ValidatePasetoToken(tokenString string) (int32, error) {
	// Convert hex string to byte array
	secretKey, err := hex.DecodeString(pasetoSecret)
	if err != nil {
		return 0, fmt.Errorf("error decoding PASETO secret: %w", err)
	}

	var payload PasetoToken
	var footer PasetoFooter

	// Decrypt and validate the token
	err = pasetoV2.Decrypt(tokenString, secretKey, &payload, &footer)
	if err != nil {
		return 0, fmt.Errorf("error decrypting PASETO token: %w", err)
	}

	// Validate token claims
	now := time.Now()
	if payload.Expiration.Before(now) {
		return 0, fmt.Errorf("token expired")
	}
	if payload.NotBefore.After(now) {
		return 0, fmt.Errorf("token not yet valid")
	}
	if payload.Audience != pasetoAud {
		return 0, fmt.Errorf("invalid audience")
	}
	if payload.Issuer != pasetoIss {
		return 0, fmt.Errorf("invalid issuer")
	}

	return payload.UserID, nil
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

// SessionAuth is a middleware that checks if the user is authenticated via session cookie
func SessionAuth(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	log.Printf("DEBUG: SessionAuth middleware called for path: %s", r.URL.Path)
	
	// Log all cookies received in the request
	if inDevelopment {
		cookies := r.Cookies()
		if len(cookies) > 0 {
			log.Printf("DEBUG: Request contains %d cookies", len(cookies))
			for _, cookie := range cookies {
				log.Printf("DEBUG: Cookie found - Name: %s, Path: %s, Domain: %s", 
					cookie.Name, cookie.Path, cookie.Domain)
			}
		} else {
			log.Printf("DEBUG: No cookies found in request")
		}
	}
	
	session, err := store.Get(r, sessionName)
	if err != nil {
		log.Printf("ERROR: Failed to get session in SessionAuth: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is authenticated
	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
		log.Printf("DEBUG: User not authenticated, redirecting")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get user ID from session
	userID, ok := session.Values["user_id"].(int32)
	if !ok {
		log.Printf("ERROR: User ID not found in session")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Validate PASETO token for additional security
	token, ok := session.Values["paseto_token"].(string)
	if !ok || token == "" {
		log.Printf("ERROR: PASETO token not found in session")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Validate the token
	validatedUserID, err := ValidatePasetoToken(token)
	if err != nil {
		// If token is invalid or expired, try to refresh it
		if err := RefreshSession(w, r); err != nil {
			log.Printf("ERROR: Failed to refresh session: %v", err)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		// Get the refreshed session
		session, err = store.Get(r, sessionName)
		if err != nil {
			log.Printf("ERROR: Failed to get session after refresh: %v", err)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		// Validate that the user ID matches
		if userID != validatedUserID && validatedUserID != 0 {
			log.Printf("ERROR: User ID mismatch")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
	}

	// Add user ID to context
	ctx := context.WithValue(r.Context(), userKey, userID)
	next(w, r.WithContext(ctx))
}

// CSRF middleware wrapper to make it compatible with negroni
func CSRFMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	// In development mode, add debug headers
	if inDevelopment {
		log.Printf("DEBUG: CSRF middleware processing request to: %s", r.URL.Path)
		
		// For development, check if this is an API request from localhost
		origin := r.Header.Get("Origin")
		if strings.HasPrefix(origin, "http://localhost") {
			// Add CSRF token to response header for easier access by frontend
			token := csrf.Token(r)
			w.Header().Set("X-CSRF-Token", token)
			log.Printf("DEBUG: Added CSRF token to response headers: %s", token)
			
			// Check if this is a preflight OPTIONS request
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			// For development API testing, bypass CSRF check for specific endpoints
			if r.Method == "POST" && (r.URL.Path == "/login" || r.URL.Path == "/signup") {
				log.Printf("DEBUG: Bypassing CSRF check for %s in development mode", r.URL.Path)
				next(w, r)
				return
			}
		}
	}
	
	csrfMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next(w, r)
	})).ServeHTTP(w, r)
}

// CreateSession creates a new session for the user
func CreateSession(w http.ResponseWriter, r *http.Request, userID int32) error {
	log.Printf("DEBUG: Creating session for user ID: %d", userID)
	
	session, err := store.Get(r, sessionName)
	if err != nil {
		log.Printf("ERROR: Failed to get session: %v", err)
		return err
	}

	// Generate PASETO token
	token, err := GeneratePasetoToken(userID)
	if err != nil {
		log.Printf("ERROR: Failed to generate PASETO token: %v", err)
		return fmt.Errorf("error generating PASETO token: %w", err)
	}

	// Set session values
	session.Values["authenticated"] = true
	session.Values["user_id"] = userID
	session.Values["created_at"] = time.Now().Unix()
	session.Values["paseto_token"] = token
	
	// For localhost, explicitly set the domain to ensure cookies work
	if inDevelopment {
		session.Options.Domain = "" // Empty domain works better for localhost
		log.Println("DEBUG: Using empty domain for localhost cookies")
		log.Printf("DEBUG: Session cookie options: Path=%s, MaxAge=%d, HttpOnly=%v, Secure=%v, SameSite=%v", 
			session.Options.Path, session.Options.MaxAge, session.Options.HttpOnly, 
			session.Options.Secure, session.Options.SameSite)
	}

	// Save session
	err = session.Save(r, w)
	if err != nil {
		log.Printf("ERROR: Failed to save session: %v", err)
		return err
	}
	
	// Log response headers to see if Set-Cookie is present
	for k, v := range w.Header() {
		if k == "Set-Cookie" {
			log.Printf("DEBUG: Set-Cookie header: %v", v)
		}
	}
	
	log.Printf("DEBUG: Session successfully created for user ID: %d", userID)
	return nil
}

// GetCSRFToken returns the CSRF token for the current request
func GetCSRFToken(r *http.Request) string {
	return csrf.Token(r)
}

// ClearSession removes the session for the current user
func ClearSession(w http.ResponseWriter, r *http.Request) error {
	session, err := store.Get(r, sessionName)
	if err != nil {
		return err
	}

	// Clear session values
	session.Values = make(map[interface{}]interface{})
	
	// Set MaxAge to -1 to delete the cookie
	session.Options.MaxAge = -1
	
	// Save session
	return session.Save(r, w)
}

// GetPasetoTokenFromSession retrieves the PASETO token from the session
func GetPasetoTokenFromSession(r *http.Request) (string, error) {
	session, err := store.Get(r, sessionName)
	if err != nil {
		return "", err
	}

	token, ok := session.Values["paseto_token"].(string)
	if !ok || token == "" {
		return "", fmt.Errorf("PASETO token not found in session")
	}

	return token, nil
}

// RefreshSession refreshes the session and PASETO token
func RefreshSession(w http.ResponseWriter, r *http.Request) error {
	session, err := store.Get(r, sessionName)
	if err != nil {
		return err
	}

	// Check if user is authenticated
	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
		return fmt.Errorf("not authenticated")
	}

	// Get user ID from session
	userID, ok := session.Values["user_id"].(int32)
	if !ok {
		return fmt.Errorf("user ID not found in session")
	}

	// Generate new PASETO token
	token, err := GeneratePasetoToken(userID)
	if err != nil {
		return fmt.Errorf("error generating PASETO token: %w", err)
	}

	// Update session values
	session.Values["created_at"] = time.Now().Unix()
	session.Values["paseto_token"] = token

	// Save session
	return session.Save(r, w)
}

// IsTokenExpiringSoon checks if the PASETO token is expiring soon (within 1 hour)
func IsTokenExpiringSoon(r *http.Request) (bool, error) {
	token, err := GetPasetoTokenFromSession(r)
	if err != nil {
		return false, err
	}
	
	// Decode the token to check expiration
	secretKey, err := hex.DecodeString(pasetoSecret)
	if err != nil {
		return false, fmt.Errorf("error decoding PASETO secret: %w", err)
	}

	var payload PasetoToken
	var footer PasetoFooter

	// Decrypt the token
	err = pasetoV2.Decrypt(token, secretKey, &payload, &footer)
	if err != nil {
		return false, fmt.Errorf("error decrypting PASETO token: %w", err)
	}
	
	// Check if token expires within the next hour
	return payload.Expiration.Before(time.Now().Add(1 * time.Hour)), nil
}

// AutoRefreshMiddleware automatically refreshes sessions with tokens that are about to expire
func AutoRefreshMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	// Skip for non-authenticated routes
	session, err := store.Get(r, sessionName)
	if err != nil {
		next(w, r)
		return
	}
	
	// Check if user is authenticated
	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
		next(w, r)
		return
	}
	
	// Check if token is expiring soon
	expiringSoon, err := IsTokenExpiringSoon(r)
	if err == nil && expiringSoon {
		// Refresh the session
		if err := RefreshSession(w, r); err != nil {
			log.Printf("Error refreshing session: %v", err)
		}
	}
	
	next(w, r)
}

// GetUserIDFromContext retrieves the user ID from the request context
func GetUserIDFromContext(ctx context.Context) (int32, bool) {
	userID, ok := ctx.Value(userKey).(int32)
	return userID, ok
}
