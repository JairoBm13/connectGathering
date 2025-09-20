package models

type Community struct {
    ID      string `json:"id,omitempty" bson:"_id,omitempty"`
    Name    string `json:"name"`
}