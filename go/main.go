package main

import (
	"log"

	"github.com/HSU-Senior-Project-2025/Cowboy_Cards/go/app"
	"github.com/joho/godotenv"
)

func main() {
	// Explicitly load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("WARNING: Error loading .env file:", err)
	} else {
		log.Println("INFO: .env file loaded successfully")
	}

	app.Init()
}
