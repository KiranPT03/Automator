package models

type Project struct {
	ProjectID          string   `json:"projectId"`
	ProjectName        string   `json:"projectName"`
	ProjectDescription string   `json:"projectDescription"`
	ProjectStatus      string   `json:"projectStatus"`
	ProjectOwnerID     string   `json:"projectOwnerId"`
	NoOfModules        string   `json:"noOfModules"`
	Type               string   `json:"type"`
	Platform           string   `json:"platform"`
	TargetBrowser      string   `json:"targetBrowser"`
	URL                string   `json:"url"`
	Priority           string   `json:"priority"`
	CreatedAt          string   `json:"createdAt"`
	UpdatedAt          string   `json:"updatedAt"`
	Modules            []Module `json:"modules"`
}
