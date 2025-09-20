package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"go-mongo-api/models"
)

func CreateVote(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var vote models.Vote
		json.NewDecoder(r.Body).Decode(&vote)
		collection := client.Database("community_events_db").Collection("votes")
		res, _ := collection.InsertOne(context.TODO(), vote)
		json.NewEncoder(w).Encode(res)
	}
}

func GetVotes(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var votes []models.Vote
		collection := client.Database("community_events_db").Collection("votes")
		cursor, _ := collection.Find(context.TODO(), bson.M{})
		defer cursor.Close(context.TODO())
		for cursor.Next(context.TODO()) {
			var vote models.Vote
			cursor.Decode(&vote)
			votes = append(votes, vote)
		}
		json.NewEncoder(w).Encode(votes)
	}
}

// Update and Delete handlers follow similar structure
