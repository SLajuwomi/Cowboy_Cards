package middleware

import (
	"context"
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"aidanwoods.dev/go-paseto"
	"github.com/rs/cors"
)

type userIdKey string

const userKey userIdKey = "userId"

var (
	pasetoAud = os.Getenv("PASETO_AUD")
	pasetoIss = os.Getenv("PASETO_ISS")
	pasetoKey = os.Getenv("PASETO_SECRET")
	pasetoImp = os.Getenv("PASETO_IMPLICIT")
	Cors      = cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8100"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
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

	// ****************************
	// get token from cookie here
	// token :=
	// ****************************

	parser := paseto.NewParser()
	parser.AddRule(paseto.ForAudience(pasetoAud))
	// parser.AddRule(paseto.IdentifiedBy("identifier")) possible later use
	parser.AddRule(paseto.IssuedBy(pasetoIss))
	parser.AddRule(paseto.NotBeforeNbf())
	parser.AddRule(paseto.NotExpired())
	// parser.AddRule(paseto.Subject("subject"))
	parser.AddRule(paseto.ValidAt(time.Now()))

	secretKey, err := paseto.V4SymmetricKeyFromHex(pasetoKey)
	if err != nil {
		LogAndSendError(w, err, "Key parse error", http.StatusBadRequest)
		return
	}

	parsedToken, err := parser.ParseV4Local(secretKey, token, []byte(pasetoImp))
	if err != nil {
		LogAndSendError(w, err, "Token parse error", http.StatusBadRequest)
	}

	subj, err := parsedToken.GetSubject()
	if err != nil {
		LogAndSendError(w, err, "Subject not found or not a string", http.StatusBadRequest)
	}

	ctx := context.WithValue(r.Context(), userKey, subj)
	next(w, r.WithContext(ctx))
}
