-- name: AddSet :exec
INSERT INTO class_set (class_id,set_id) VALUES ($1, $2);

-- name: RemoveSet :exec
DELETE FROM class_set WHERE class_id = $1 AND set_id = $2;
