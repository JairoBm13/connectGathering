package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"go-mongo-api/models"
)

func CreateEvent(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var event models.Event
		json.NewDecoder(r.Body).Decode(&event)
		collection := client.Database("community_events_db").Collection("events")
		res, _ := collection.InsertOne(context.TODO(), event)
		json.NewEncoder(w).Encode(res)
	}
}

func GetEvents(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var events []models.Event
		collection := client.Database("community_events_db").Collection("events")
		cursor, _ := collection.Find(context.TODO(), bson.M{})
		defer cursor.Close(context.TODO())
		for cursor.Next(context.TODO()) {
			var event models.Event
			cursor.Decode(&event)
			events = append(events, event)
		}
		json.NewEncoder(w).Encode(events)
	}
}

// Update and Delete handlers follow similar structure
