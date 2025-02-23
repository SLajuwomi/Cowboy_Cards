-- name: GetClasses :many
SELECT * FROM classes;

-- name: GetUsers :many
SELECT * FROM users;

-- name: GetUser :one
SELECT * FROM users WHERE id = $1;