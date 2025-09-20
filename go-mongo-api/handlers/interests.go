package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"go-mongo-api/models"
)

func CreateInterest(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var interest models.Interest
		json.NewDecoder(r.Body).Decode(&interest)
		collection := client.Database("community_events_db").Collection("interests")
		res, _ := collection.InsertOne(context.TODO(), interest)
		json.NewEncoder(w).Encode(res)
	}
}

func GetInterests(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("📥 Received request: GET /interests")

		var interests []models.Interest
		collection := client.Database("community_events_db").Collection("interests")

		cursor, err := collection.Find(context.TODO(), bson.M{})
		if err != nil {
			log.Printf("❌ Error querying interests: %v\n", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.TODO())

		for cursor.Next(context.TODO()) {
			var interest models.Interest
			if err := cursor.Decode(&interest); err != nil {
				log.Printf("⚠️ Error decoding interest: %v\n", err)
				continue
			}
			log.Printf("✅ Found interest: %+v\n", interest)
			interests = append(interests, interest)
		}

		log.Printf("📤 Returning %d interests\n", len(interests))
		json.NewEncoder(w).Encode(interests)
	}
}

// Update and Delete handlers follow similar structure
