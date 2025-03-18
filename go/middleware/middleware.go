package middleware

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/golang-jwt/jwt/v5/request"
	"github.com/rs/cors"
)

type userIdKey string

const userKey userIdKey = "userId"

var (
	jwtAud  = os.Getenv("JWT_AUD")
	jwtIss  = os.Getenv("JWT_ISS")
	jwtKey  = os.Getenv("JWT_SECRET")
	keyFunc = func(token *jwt.Token) (any, error) {
		key, err := base64.StdEncoding.DecodeString(jwtKey)
		if err != nil {
			log.Println("decode error:", err)
			return nil, err
		}

		return key, nil
	}
	Cors = cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		Debug:            true,
		MaxAge:           300,
	})
)

func LogAndSendError(w http.ResponseWriter, err error, msg string, statusCode int) {
	log.Printf(msg+": %v", err)
	http.Error(w, msg, statusCode)
}

func SetCacheControlHeader(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	str := ""

	if path.Clean(r.URL.Path) == "/" {
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

func Auth(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	registeredClaims := &jwt.RegisteredClaims{}

	token, err := request.ParseFromRequest(r, request.AuthorizationHeaderExtractor, keyFunc, request.WithClaims(registeredClaims), request.WithParser(jwt.NewParser(
		jwt.WithAudience(jwtAud),
		jwt.WithExpirationRequired(),
		jwt.WithIssuedAt(),
		jwt.WithIssuer(jwtIss),
		jwt.WithLeeway(30*time.Second),
		jwt.WithStrictDecoding(),
		// jwt.WithSubject() recommended, may use later
		jwt.WithValidMethods([]string{"HS256"}),
	)))
	if err != nil {
		LogAndSendError(w, err, "Parse error", http.StatusBadRequest)
		return
	}

	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		LogAndSendError(w, fmt.Errorf("unexpected signing method: %v", token.Header["alg"]), "Invalid token", http.StatusUnauthorized)
		return
	}

	for _, v := range jwt.GetAlgorithms() {
		log.Printf("alg: %v\n", v)
	}

	auds, err := registeredClaims.GetAudience()
	if err != nil {
		LogAndSendError(w, err, "Parse error", http.StatusBadRequest)
		return
	}
	for _, v := range auds {
		log.Printf("aud: %v\n", v)
	}

	expTime, err := registeredClaims.GetExpirationTime()
	if err != nil {
		LogAndSendError(w, err, "Parse error", http.StatusBadRequest)
		return
	}
	log.Printf("expTime: %v\n", expTime.String())

	issAt, err := registeredClaims.GetIssuedAt()
	if err != nil {
		LogAndSendError(w, err, "Parse error", http.StatusBadRequest)
		return
	}
	log.Printf("issAt: %v\n", issAt.String())

	issuer, err := registeredClaims.GetIssuer()
	if err != nil {
		LogAndSendError(w, err, "Parse error", http.StatusBadRequest)
		return
	}
	log.Printf("issuer: %v\n", issuer)

	notBefore, err := registeredClaims.GetNotBefore()
	if err != nil {
		LogAndSendError(w, err, "Parse error", http.StatusBadRequest)
		return
	}
	log.Printf("notBefore: %v\n", notBefore.String())

	sub, err := registeredClaims.GetSubject()
	if err != nil {
		LogAndSendError(w, err, "Parse error", http.StatusBadRequest)
		return
	}
	log.Printf("sub: %v\n", sub)

	if !token.Valid {
		LogAndSendError(w, err, "Invalid token", http.StatusUnauthorized)
		return
	}

	log.Printf("id claim: %v\n", registeredClaims.ID)

	ctx := context.WithValue(r.Context(), userKey, registeredClaims.Subject)
	next(w, r.WithContext(ctx))
}
