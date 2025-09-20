package handlers

import (
	"encoding/json"
	"go-mongo-api/utils"
	"net/http"
)

type PromptRequest struct {
	Prompt string `json:"prompt"`
}

func HandleGeminiPrompt(w http.ResponseWriter, r *http.Request) {
	var req PromptRequest
	json.NewDecoder(r.Body).Decode(&req)
	response, err := utils.SendToGemini(req.Prompt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"response": response})
}
