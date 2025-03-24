package models

type TestCase struct {
	TestCaseID     string     `json:"testCaseId"`
	TestCaseName   string     `json:"testCaseName"`
	TestCaseStatus string     `json:"testCaseStatus"`
	Description    string     `json:"description"`
	Precondition   string     `json:"precondition"`
	ExpectedResult string     `json:"expectedResult"`
	Priority       string     `json:"priority"`
	CreatedAt      string     `json:"createdAt"`
	UpdatedAt      string     `json:"updatedAt"`
	NoOfTestSteps  string     `json:"noOfTestSteps"`
	TestSteps      []TestStep `json:"testSteps"`
}
