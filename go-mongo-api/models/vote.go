package models

type Vote struct {
	ID      string `json:"id,omitempty" bson:"_id,omitempty"`
	UserID  string `json:"userId"`
	Vote    string `json:"vote"`
	EventID string `json:"eventId"`
}
