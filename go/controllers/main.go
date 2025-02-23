package controllers

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/db"
	"github.com/jackc/pgx/v5"
)

var (
	// conn    *pgx.Conn
	connStr = os.Getenv("DATABASE_URL")
)

func GetClasses(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	conn, err := pgx.Connect(ctx, connStr)
	if err != nil {
		log.Fatalf("could not connect to db... %v", err)
	}
	defer conn.Close(ctx)

	query := db.New(conn)

	classes, err := query.GetClasses(ctx)
	if err != nil {
		log.Fatalf("error getting classes from db... %v", err)
	}
	log.Println(classes)
	log.Println()

}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	conn, err := pgx.Connect(ctx, connStr)
	if err != nil {
		log.Fatalf("could not connect to db... %v", err)
	}
	defer conn.Close(ctx)

	query := db.New(conn)

	users, err := query.GetUsers(ctx)
	if err != nil {
		log.Fatalf("error getting users from db... %v", err)
	}
	log.Println(users)
	log.Println()

}

func GetUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	conn, err := pgx.Connect(ctx, connStr)
	if err != nil {
		log.Fatalf("could not connect to db... %v", err)
	}
	defer conn.Close(ctx)

	query := db.New(conn)

	log.Println(&r)

	user, err := query.GetUser(ctx, 2)
	if err != nil {
		log.Fatalf("error getting user from db... %v", err)
	}
	log.Println(user)
	log.Println()

}
