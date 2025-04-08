package middleware

// PasetoToken represents a PASETO token payload
// type PasetoToken struct {
// 	Audience   string    `json:"aud,omitempty"`
// 	Issuer     string    `json:"iss,omitempty"`
// 	Jti        string    `json:"jti,omitempty"`
// 	Subject    string    `json:"sub,omitempty"`
// 	IssuedAt   time.Time `json:"iat,omitempty"`
// 	Expiration time.Time `json:"exp,omitempty"`
// 	NotBefore  time.Time `json:"nbf,omitempty"`
// 	UserID     int32     `json:"user_id,omitempty"`
// }

// PASETO instance
// pasetoV2 = paseto.NewV2()

// pasetoAud = os.Getenv("PASETO_AUD")
// pasetoIss = os.Getenv("PASETO_ISS")
// pasetoKey = os.Getenv("PASETO_SECRET")
// pasetoImp = os.Getenv("PASETO_IMPLICIT")

// GeneratePasetoToken creates a new PASETO token for the given user ID
// func GeneratePasetoToken(userID int32) (string, error) {
// 	// Convert hex string to byte array
// 	secretKey, err := hex.DecodeString(pasetoSecret)
// 	if err != nil {
// 		return "", fmt.Errorf("error decoding PASETO secret: %w", err)
// 	}

// 	now := time.Now()
// 	exp := now.Add(24 * time.Hour) // Token expires in 24 hours

// 	// Create token payload
// 	payload := PasetoToken{
// 		Audience:   pasetoAud,
// 		Issuer:     pasetoIss,
// 		Subject:    fmt.Sprintf("%d", userID),
// 		IssuedAt:   now,
// 		Expiration: exp,
// 		NotBefore:  now,
// 		UserID:     userID,
// 	}

// 	// Encode the token
// 	token, err := pasetoV2.Encrypt(secretKey, payload, footer)
// 	if err != nil {
// 		return "", fmt.Errorf("error creating PASETO token: %w", err)
// 	}

// 	return token, nil
// }

// ValidatePasetoToken validates a PASETO token and returns the user ID
// func ValidatePasetoToken(tokenString string) (int32, error) {
// 	// Convert hex string to byte array
// 	secretKey, err := hex.DecodeString(pasetoSecret)
// 	if err != nil {
// 		return 0, fmt.Errorf("error decoding PASETO secret: %w", err)
// 	}

// 	var payload PasetoToken
// 	var footer PasetoFooter

// 	// Decrypt and validate the token
// 	err = pasetoV2.Decrypt(tokenString, secretKey, &payload, &footer)
// 	if err != nil {
// 		return 0, fmt.Errorf("error decrypting PASETO token: %w", err)
// 	}

// 	// Validate token claims
// 	now := time.Now()
// 	if payload.Expiration.Before(now) {
// 		return 0, fmt.Errorf("token expired")
// 	}
// 	if payload.NotBefore.After(now) {
// 		return 0, fmt.Errorf("token not yet valid")
// 	}
// 	if payload.Audience != pasetoAud {
// 		return 0, fmt.Errorf("invalid audience")
// 	}
// 	if payload.Issuer != pasetoIss {
// 		return 0, fmt.Errorf("invalid issuer")
// 	}

// 	return payload.UserID, nil
// }

// IsTokenExpiringSoon checks if the PASETO token is expiring soon (within 1 hour)
// func IsTokenExpiringSoon(r *http.Request) (bool, error) {
// 	token, err := GetPasetoTokenFromSession(r)
// 	if err != nil {
// 		return false, err
// 	}

// 	// Decode the token to check expiration
// 	secretKey, err := hex.DecodeString(pasetoSecret)
// 	if err != nil {
// 		return false, fmt.Errorf("error decoding PASETO secret: %w", err)
// 	}

// 	var payload PasetoToken
// 	var footer PasetoFooter

// 	// Decrypt the token
// 	err = pasetoV2.Decrypt(token, secretKey, &payload, &footer)
// 	if err != nil {
// 		return false, fmt.Errorf("error decrypting PASETO token: %w", err)
// 	}

// 	// Check if token expires within the next hour
// 	return payload.Expiration.Before(time.Now().Add(1 * time.Hour)), nil
// }

// RefreshSession refreshes the session and PASETO token
// func RefreshSession(w http.ResponseWriter, r *http.Request) error {
// 	session, err := store.Get(r, sessionName)
// 	if err != nil {
// 		return err
// 	}

// 	// Check if user is authenticated
// 	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
// 		return fmt.Errorf("not authenticated")
// 	}

// 	// Get user ID from session
// 	userID, ok := session.Values["user_id"].(int32)
// 	if !ok {
// 		return fmt.Errorf("user ID not found in session")
// 	}

// 	// Generate new PASETO token
// 	token, err := GeneratePasetoToken(userID)
// 	if err != nil {
// 		return fmt.Errorf("error generating PASETO token: %w", err)
// 	}

// 	// Update session values
// 	session.Values["created_at"] = time.Now().Unix()
// 	session.Values["paseto_token"] = token

// 	// Save session
// 	return session.Save(r, w)
// }

// GetPasetoTokenFromSession retrieves the PASETO token from the session
// func GetPasetoTokenFromSession(r *http.Request) (string, error) {
// 	session, err := store.Get(r, sessionName)
// 	if err != nil {
// 		return "", err
// 	}

// 	token, ok := session.Values["paseto_token"].(string)
// 	if !ok || token == "" {
// 		return "", fmt.Errorf("PASETO token not found in session")
// 	}

// 	return token, nil
// }

// AutoRefreshMiddleware automatically refreshes sessions with tokens that are about to expire
// func AutoRefreshMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
// 	// Skip for non-authenticated routes
// 	session, err := store.Get(r, sessionName)
// 	if err != nil {
// 		next(w, r)
// 		return
// 	}

// 	// Check if user is authenticated
// 	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
// 		next(w, r)
// 		return
// 	}

// 	// Check if token is expiring soon
// 	expiringSoon, err := IsTokenExpiringSoon(r)
// 	if err == nil && expiringSoon {
// 		// Refresh the session
// 		if err := RefreshSession(w, r); err != nil {
// 			log.Printf("Error refreshing session: %v", err)
// 		}
// 	}

// 	next(w, r)
// }

// func Auth(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {

// 	// ****************************
// 	// get token from cookie here
// 	token := "h"
// 	// ****************************

// 	parser := paseto.NewParser()
// 	parser.AddRule(paseto.ForAudience(pasetoAud))
// 	// parser.AddRule(paseto.IdentifiedBy("identifier")) possible later use
// 	parser.AddRule(paseto.IssuedBy(pasetoIss))
// 	parser.AddRule(paseto.NotBeforeNbf())
// 	parser.AddRule(paseto.NotExpired())
// 	// parser.AddRule(paseto.Subject("subject"))
// 	parser.AddRule(paseto.ValidAt(time.Now()))

// 	secretKey, err := paseto.V4SymmetricKeyFromHex(pasetoKey)
// 	if err != nil {
// 		LogAndSendError(w, err, "Key parse error", http.StatusBadRequest)
// 		return
// 	}

// 	parsedToken, err := parser.ParseV4Local(secretKey, token, []byte(pasetoImp))
// 	if err != nil {
// 		LogAndSendError(w, err, "Token parse error", http.StatusBadRequest)
// 	}

// 	subj, err := parsedToken.GetSubject()
// 	if err != nil {
// 		LogAndSendError(w, err, "Subject not found or not a string", http.StatusBadRequest)
// 	}

// 	ctx := context.WithValue(r.Context(), userKey, subj)
// 	next(w, r.WithContext(ctx))
// }

// func getTokenAndResponse(user db.User) (response AuthResponse, err error) {

// 	// Generate PASETO token
// 	//token, err := middleware.GeneratePasetoToken(user.ID)

// 	var (
// 		pasetoAud = os.Getenv("PASETO_AUD")
// 		pasetoIss = os.Getenv("PASETO_ISS")
// 		pasetoKey = os.Getenv("PASETO_SECRET")
// 		pasetoImp = os.Getenv("PASETO_IMPLICIT")
// 	)

// 	token := paseto.NewToken()

// 	token.SetAudience(pasetoAud)
// 	token.SetJti(uuid.New().String())
// 	token.SetIssuer(pasetoIss)
// 	token.SetSubject(strconv.Itoa(int(user.ID)))
// 	token.SetExpiration(time.Now().Add(time.Minute))
// 	token.SetNotBefore(time.Now().Add(-3 * time.Second))
// 	token.SetIssuedAt(time.Now())

// 	secretKey, err := paseto.V4SymmetricKeyFromHex(pasetoKey)
// 	if err != nil {
// 		return AuthResponse{}, err
// 	}
// 	signed := token.V4Encrypt(secretKey, []byte(pasetoImp))

// 	response = AuthResponse{
// 		Token:     signed,
// 		UserID:    user.ID,
// 		Username:  user.Username,
// 		Email:     user.Email,
// 		FirstName: user.FirstName,
// 		LastName:  user.LastName,
// 	}

// 	return
// }

// Validate PASETO token for additional security
// token, ok := session.Values["paseto_token"].(string)
// if !ok || token == "" {
// 	log.Printf("ERROR: PASETO token not found in session")
// 	http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 	return
// }

// Validate the token
// validatedUserID, err := ValidatePasetoToken(token)
