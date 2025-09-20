package models

type Event struct {
    ID      string `json:"id,omitempty" bson:"_id,omitempty"`
    Location   string `json:"location"`
    Date    string `json:"date"`
    Details string `json:"details"`
}