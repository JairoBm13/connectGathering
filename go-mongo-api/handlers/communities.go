package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"go-mongo-api/models"
)

func CreateCommunity(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var community models.Community
		json.NewDecoder(r.Body).Decode(&community)
		collection := client.Database("community_events_db").Collection("communities")
		res, _ := collection.InsertOne(context.TODO(), community)
		json.NewEncoder(w).Encode(res)
	}
}

func GetCommunities(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var communities []models.Community
		collection := client.Database("community_events_db").Collection("communities")
		cursor, _ := collection.Find(context.TODO(), bson.M{})
		defer cursor.Close(context.TODO())
		for cursor.Next(context.TODO()) {
			var community models.Community
			cursor.Decode(&community)
			communities = append(communities, community)
		}
		json.NewEncoder(w).Encode(communities)
	}
}

// Update and Delete handlers follow similar structure
