package middleware

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/o1egl/paseto"
	"github.com/pkg/errors"
)

// PasetoFooter contains additional data for the token
type PasetoFooter struct {
	TokenID string `json:"token_id"`
}

// PasetoPayload contains the claims for the PASETO token
type PasetoPayload struct {
	Subject   string    `json:"sub"`
	Issuer    string    `json:"iss"`
	Audience  string    `json:"aud"`
	ExpiresAt time.Time `json:"exp"`
	IssuedAt  time.Time `json:"iat"`
	NotBefore time.Time `json:"nbf"`
}

// Cookie name for the PASETO token
const (
	CookieName = "auth_token"
	Issuer     = "cowboy-cards"
	Audience   = "users"
)

var (
	// Symmetric key for PASETO tokens
	symmetricKey []byte
)

// InitPaseto initializes the PASETO configuration
func InitPaseto() error {
	// Get the key from environment variable
	encodedKey := os.Getenv("JWT_SECRET") // Reusing the same env var for simplicity
	if encodedKey == "" {
		return errors.New("JWT_SECRET environment variable not set")
	}

	// Decode the base64 key
	var err error
	symmetricKey, err = base64.StdEncoding.DecodeString(encodedKey)
	if err != nil {
		return errors.Wrap(err, "failed to decode symmetric key")
	}

	// PASETO V2 local requires a 32-byte key
	if len(symmetricKey) != 32 {
		log.Println("Warning: Symmetric key is not 32 bytes, adjusting...")
		// Adjust the key to be exactly 32 bytes
		if len(symmetricKey) > 32 {
			symmetricKey = symmetricKey[:32]
		} else {
			newKey := make([]byte, 32)
			copy(newKey, symmetricKey)
			symmetricKey = newKey
		}
	}

	return nil
}

// GeneratePasetoToken creates a new PASETO token
func GeneratePasetoToken(userID int32) (string, error) {
	// Create a new PASETO token
	p := paseto.NewV2()

	// Create the payload
	now := time.Now()
	exp := now.Add(2 * time.Hour)
	payload := PasetoPayload{
		Subject:   strconv.Itoa(int(userID)),
		Issuer:    Issuer,
		Audience:  Audience,
		ExpiresAt: exp,
		IssuedAt:  now,
		NotBefore: now.Add(-30 * time.Second), // Allow for clock skew
	}

	// Create the footer
	footer := PasetoFooter{
		TokenID: fmt.Sprintf("%d-%d", userID, now.Unix()),
	}

	// Encrypt the token
	token, err := p.Encrypt(symmetricKey, payload, footer)
	if err != nil {
		return "", errors.Wrap(err, "failed to create PASETO token")
	}

	return token, nil
}

// SetTokenCookie sets the PASETO token as a cookie
func SetTokenCookie(w http.ResponseWriter, token string) {
	// Debug logging
	log.Printf("Setting cookie: Name=%s, Value length=%d", CookieName, len(token))

	// Simplify cookie settings for development
	cookie := &http.Cookie{
		Name:     CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Disable for development
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(2 * time.Hour.Seconds()), // Same as token expiry
	}

	http.SetCookie(w, cookie)

	// Add the cookie to the response header directly as a fallback
	w.Header().Add("Set-Cookie", cookie.String())
}

// PasetoAuth middleware for PASETO authentication
func PasetoAuth(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	// Get the cookie
	cookie, err := r.Cookie(CookieName)
	if err != nil {
		if err == http.ErrNoCookie {
			http.Error(w, "No authentication token provided", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Error reading authentication token", http.StatusBadRequest)
		return
	}

	// Get the token from the cookie
	token := cookie.Value

	// Create a new PASETO instance
	p := paseto.NewV2()

	// Decrypt and verify the token
	var payload PasetoPayload
	var footer PasetoFooter
	err = p.Decrypt(token, symmetricKey, &payload, &footer)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Validate the token
	now := time.Now()
	if now.After(payload.ExpiresAt) {
		http.Error(w, "Token expired", http.StatusUnauthorized)
		return
	}

	if now.Before(payload.NotBefore) {
		http.Error(w, "Token not valid yet", http.StatusUnauthorized)
		return
	}

	// Parse the user ID from the subject
	userID, err := strconv.ParseInt(payload.Subject, 10, 32)
	if err != nil {
		http.Error(w, "Invalid user ID in token", http.StatusBadRequest)
		return
	}

	// Set the user ID in the context
	ctx := context.WithValue(r.Context(), userKey, int32(userID))
	next(w, r.WithContext(ctx))
}

// ClearAuthCookie removes the authentication cookie
func ClearAuthCookie(w http.ResponseWriter) {
	// Debug logging
	log.Printf("Clearing auth cookie: Name=%s", CookieName)

	// Simplify cookie settings for development
	cookie := &http.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Disable for development
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1, // Delete the cookie
	}

	http.SetCookie(w, cookie)

	// Add the cookie to the response header directly as a fallback
	w.Header().Add("Set-Cookie", cookie.String())
}
