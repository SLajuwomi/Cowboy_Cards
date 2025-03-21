-- name: IncrementFlashcardScore :exec
UPDATE card_history SET score = score + 1, times_attempted = times_attempted + 1 WHERE user_id = $1 AND card_id = $2;

-- name: DecrementFlashcardScore :exec
UPDATE card_history SET score = score - 1, times_attempted = times_attempted + 1 WHERE user_id = $1 AND card_id = $2;

