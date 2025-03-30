package models

type TestStep struct {
	StepID      string `json:"stepId"`
	StepOrder   string `json:"order"`
	Description string `json:"description"`
	StepData    string `json:"stepData"`
	StepStatus  string `json:"stepStatus"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}
