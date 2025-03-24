package models

type Module struct {
	ModuleID       string     `json:"moduleId"`
	ModuleName     string     `json:"moduleName"`
	Description    string     `json:"description"`
	ModuleStatus   string     `json:"moduleStatus"`
	ModulePriority string     `json:"modulePriority"`
	NoOfTestCases  string     `json:"noOfTestCases"`
	CreatedAt      string     `json:"createdAt"`
	UpdatedAt      string     `json:"updatedAt"`
	TestCases      []TestCase `json:"testCases"`
}
