package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"go-mongo-api/handlers"
)

var client *mongo.Client

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("ngrok-skip-browser-warning", "ngrok-skip-browser-warning")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoURI := "mongodb+srv://db_user:StartHacking@gators.5rgdytv.mongodb.net/"
	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}

	r := mux.NewRouter()

	// Community routes
	r.HandleFunc("/communities", handlers.CreateCommunity(client)).Methods("POST")
	r.HandleFunc("/communities", handlers.GetCommunities(client)).Methods("GET")
	// r.HandleFunc("/communities/{id}", handlers.UpdateCommunity(client)).Methods("PUT")
	// r.HandleFunc("/communities/{id}", handlers.DeleteCommunity(client)).Methods("DELETE")

	// Interest routes
	r.HandleFunc("/interests", handlers.CreateInterest(client)).Methods("POST")
	r.HandleFunc("/interests", handlers.GetInterests(client)).Methods("GET")
	// r.HandleFunc("/interests/{id}", handlers.UpdateInterest(client)).Methods("PUT")
	// r.HandleFunc("/interests/{id}", handlers.DeleteInterest(client)).Methods("DELETE")

	// Event routes
	r.HandleFunc("/events", handlers.CreateEvent(client)).Methods("POST")
	r.HandleFunc("/events", handlers.GetEvents(client)).Methods("GET")
	// r.HandleFunc("/events/{id}", handlers.UpdateEvent(client)).Methods("PUT")
	//r.HandleFunc("/events/{id}", handlers.DeleteEvent(client)).Methods("DELETE")

	// Vote routes
	r.HandleFunc("/votes", handlers.CreateVote(client)).Methods("POST")
	r.HandleFunc("/votes", handlers.GetVotes(client)).Methods("GET")

	// User routes
	r.HandleFunc("/users", handlers.CreateUser(client)).Methods("POST")
	r.HandleFunc("/users", handlers.GetUsers(client)).Methods("GET")

	// Gemini prompt
	r.HandleFunc("/gemini", handlers.HandleGeminiPrompt).Methods("POST")

	log.Println("Server running on port 8080")

	http.ListenAndServe(":8080", enableCORS(r))

}
