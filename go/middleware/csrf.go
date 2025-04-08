package middleware

// CSRF middleware wrapper to make it compatible with negroni
// func CSRFMiddleware(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
// 	// In development mode, add debug headers
// 	if inDevelopment {
// 		log.Printf("DEBUG: CSRF middleware processing request to: %s", r.URL.Path)

// 		// For development, check if this is an API request from localhost
// 		origin := r.Header.Get("Origin")
// 		if strings.HasPrefix(origin, "http://localhost") {
// 			// Add CSRF token to response header for easier access by frontend
// 			token := csrf.Token(r)
// 			w.Header().Set("X-CSRF-Token", token)
// 			log.Printf("DEBUG: Added CSRF token to response headers: %s", token)

// 			// Check if this is a preflight OPTIONS request
// 			if r.Method == "OPTIONS" {
// 				w.WriteHeader(http.StatusOK)
// 				return
// 			}

// 			// For development API testing, bypass CSRF check for specific endpoints
// 			if r.Method == "POST" && (r.URL.Path == "/login" || r.URL.Path == "/signup") {
// 				log.Printf("DEBUG: Bypassing CSRF check for %s in development mode", r.URL.Path)
// 				next(w, r)
// 				return
// 			}
// 		}
// 	}

// 	csrfMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		next(w, r)
// 	})).ServeHTTP(w, r)
// }

// GetCSRFToken returns the CSRF token for the current request
// func GetCSRFToken(r *http.Request) string {
// 	return csrf.Token(r)
// }

// CSRF protection middleware
// csrfMiddleware = csrf.Protect(
//
//	[]byte(pasetoImplicit),
//	csrf.Secure(!inDevelopment), // Only require Secure in production
//	csrf.SameSite(func() csrf.SameSiteMode {
//		if inDevelopment {
//			return csrf.SameSiteLaxMode // Less restrictive for development
//		}
//		return csrf.SameSiteStrictMode // More secure for production
//	}()),
//	csrf.Path("/"),

// Add CSRF token to response if this is a browser request
// if strings.Contains(r.Header.Get("Accept"), "text/html") ||
//    strings.Contains(r.Header.Get("Accept"), "application/json") {
// 	resp.CSRFToken = middleware.GetCSRFToken(r)
// }

// Add CSRF token to response if this is a browser request
// if strings.Contains(r.Header.Get("Accept"), "text/html") ||
//    strings.Contains(r.Header.Get("Accept"), "application/json") {
// 	resp.CSRFToken = middleware.GetCSRFToken(r)
// }
