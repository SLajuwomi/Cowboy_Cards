-- name: GetClasses :many
SELECT * FROM classes;

-- name: GetUsersFlashCardSets :many
SELECT * FROM flashcard_sets WHERE user_id = $1;

-- name: CreateFlashCard :exec
INSERT INTO flashcards (front, back, set_id, user_id) VALUES ($1, $2, $3, $4);

-- name: GetFlashCard :one
SELECT * FROM flashcards WHERE id = $1;

-- name: UpdateFlashCard :exec
UPDATE flashcards SET front = $1, back = $2 WHERE id = $3;

-- name: DeleteFlashCard :exec
DELETE FROM flashcards WHERE id = $1;

-- name: GetUsers :many
SELECT * FROM users;

-- name: GetUser :one
SELECT * FROM users WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, username, email, first_name, last_name, role, created_at, updated_at;

-- name: UpdateUserPassword :exec
UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2;