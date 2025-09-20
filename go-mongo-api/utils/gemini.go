package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type GeminiRequest struct {
	Prompt string `json:"prompt"`
}

type GeminiResponse struct {
	Candidates []struct {
		Output string `json:"output"`
	} `json:"candidates"`
}

func SendToGemini(prompt string) (string, error) {
	apiKey := "AIzaSyBoKh8erPf1_IfxxdDYpUQjZdyfHyaa4ww" // os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	payload := map[string]interface{}{
		"contents": []map[string]string{
			{"role": "user", "parts": prompt},
		},
	}

	body, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST",
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="+apiKey,
		bytes.NewBuffer(body),
	)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	responseBody, _ := ioutil.ReadAll(resp.Body)

	var result map[string]interface{}
	json.Unmarshal(responseBody, &result)

	// Extract response text
	if candidates, ok := result["candidates"].([]interface{}); ok && len(candidates) > 0 {
		first := candidates[0].(map[string]interface{})
		if output, ok := first["output"].(string); ok {
			return output, nil
		}
	}

	return "", fmt.Errorf("unexpected response format: %s", string(responseBody))
}
