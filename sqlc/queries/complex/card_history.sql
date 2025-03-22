-- name: UpsertCorrectFlashcardScore :exec
INSERT INTO card_history (user_id, card_id, score) VALUES ($1, $2, 1) ON CONFLICT (user_id, card_id) DO UPDATE SET score = score + 1, times_attempted = times_attempted + 1;

-- name: UpsertIncorrectFlashcardScore :exec
INSERT INTO card_history (user_id, card_id, score) VALUES ($1, $2, 0) ON CONFLICT (user_id, card_id) DO UPDATE SET times_attempted = times_attempted + 1;




