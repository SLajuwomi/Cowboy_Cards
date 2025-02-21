package controllers

import (
	"net/http"
)

func GetBooks(w http.ResponseWriter, r *http.Request) {

	w.Write([]byte("hello world of books\n"))

}
