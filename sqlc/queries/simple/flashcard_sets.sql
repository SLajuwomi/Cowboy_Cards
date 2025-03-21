-- name: GetFlashcardSetById :one
SELECT * FROM flashcard_sets WHERE id = $1;

-- name: CreateFlashcardSet :exec
INSERT INTO flashcard_sets (set_name, set_description) VALUES ($1, $2);

-- name: UpdateFlashcardSetName :one
UPDATE flashcard_sets SET set_name = $1, updated_at = NOW() WHERE id = $2 RETURNING set_name;

-- name: UpdateFlashcardSetDescription :one
UPDATE flashcard_sets SET set_description = $1, updated_at = NOW() WHERE id = $2 RETURNING set_description;

-- name: DeleteFlashcardSet :exec
DELETE FROM flashcard_sets WHERE id = $1;


-- execresult annotation is buggy, trying exec https://github.com/sqlc-dev/sqlc/issues/3699#issuecomment-2486892414

