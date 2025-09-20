package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"go-mongo-api/models"
)

func CreateUser(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user models.User
		json.NewDecoder(r.Body).Decode(&user)
		collection := client.Database("community_events_db").Collection("users")
		res, _ := collection.InsertOne(context.TODO(), user)
		json.NewEncoder(w).Encode(res)
	}
}

func GetUsers(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var users []models.User
		collection := client.Database("community_events_db").Collection("users")
		cursor, _ := collection.Find(context.TODO(), bson.M{})
		defer cursor.Close(context.TODO())
		for cursor.Next(context.TODO()) {
			var user models.User
			cursor.Decode(&user)
			users = append(users, user)
		}
		json.NewEncoder(w).Encode(users)
	}
}

// Update and Delete handlers follow similar structure
