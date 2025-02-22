CREATE TABLE classes (
    id              uuid        PRIMARY KEY,
    name            text        NOT NULL,
    description     text,
    join_code       text        UNIQUE NOT NULL,
    teacher_id      uuid        NOT NULL,
    created_at      timestamptz NOT NULL,
    updated_at      timestamptz NOT NULL
);





