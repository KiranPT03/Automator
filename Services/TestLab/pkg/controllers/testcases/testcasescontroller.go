package testcases

import (
	"bytes"
	"fmt"
	"sort"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jung-kurt/gofpdf"

	config "automator/services/testlab/pkg/config"
	natsProducer "automator/services/testlab/pkg/connectors/nats/producer"
	postgres "automator/services/testlab/pkg/databases/postgres"
	models "automator/services/testlab/pkg/models"
	commons "automator/services/testlab/pkg/utils/commons"
	datetime "automator/services/testlab/pkg/utils/datetime"
	log "automator/services/testlab/pkg/utils/loggers"
	resterrors "automator/services/testlab/pkg/utils/resterrors"
)

type TestCaseController struct {
	repository   *postgres.PostgreSQLRepository
	natsProducer natsProducer.NATSProducer
}

func NewTestCaseController(config *config.Config) *TestCaseController {
	// Create a new PostgreSQL repository instance
	log.Info("Creating new instance of PostgreSQL repository")
	repository, err := postgres.NewPostgreSQLRepository(config)
	if err != nil {
		panic(err)
	}

	// Create a new NATS producer instance
	log.Info("Creating new instance of NATS producer")
	producer, err := natsProducer.NewNATSClient(config)
	if err != nil {
		log.Error("Failed to create NATS producer: %v", err)
		// Continue without NATS if it fails
		return &TestCaseController{repository: repository}
	}

	return &TestCaseController{
		repository:   repository,
		natsProducer: producer,
	}
}

func (controller *TestCaseController) GetProjects(c *fiber.Ctx) error {
	// Fetch all projects from the database
	results, err := controller.repository.GetAll("projects")
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// Convert the database results (map[string]interface{}) to models.Project
	var projects []models.Project

	if len(results) == 0 {
		return resterrors.SendNotFoundError(c, "No projects Available")
	}

	for _, result := range results {
		log.Debug("Printing results: %T", result["created_at"])
		project := models.Project{
			ProjectID:          commons.GetStringFromInterface(result["project_id"]),
			ProjectName:        commons.GetStringFromInterface(result["project_name"]),
			ProjectDescription: commons.GetStringFromInterface(result["project_description"]),
			ProjectStatus:      commons.GetStringFromInterface(result["project_status"]),
			ProjectOwnerID:     commons.GetStringFromInterface(result["project_owner_id"]),
			NoOfModules:        commons.GetStringFromInterface(result["no_of_modules"]),
			Type:               commons.GetStringFromInterface(result["type"]),
			Platform:           commons.GetStringFromInterface(result["platform"]),
			TargetBrowser:      commons.GetStringFromInterface(result["target_browser"]),
			URL:                commons.GetStringFromInterface(result["url"]),
			Priority:           commons.GetStringFromInterface(result["priority"]),
			CreatedAt:          commons.GetStringFromInterface(result["created_at"]),
			UpdatedAt:          commons.GetStringFromInterface(result["updated_at"]),
		}
		projects = append(projects, project)
		log.Debug("Printing projects: %v", projects)
	}

	// Return the projects as a JSON response
	return resterrors.SendOK(c, projects)
}

func (controller *TestCaseController) getModulesForProject(projectID string) ([]models.Module, error) {
	var modules []models.Module
	var records []map[string]interface{}
	var err error

	records, err = controller.repository.GetAllByColumn("modules", "project_id", projectID)
	if err != nil {
		return nil, err
	}

	for _, record := range records { // Added underscore to discard the index
		module := models.Module{
			ModuleID:       commons.GetStringFromInterface(record["module_id"]),
			ModuleName:     commons.GetStringFromInterface(record["module_name"]),
			Description:    commons.GetStringFromInterface(record["description"]),
			ModuleStatus:   commons.GetStringFromInterface(record["module_status"]),
			ModulePriority: commons.GetStringFromInterface(record["module_priority"]),
			NoOfTestCases:  commons.GetStringFromInterface(record["no_of_test_cases"]),
			CreatedAt:      commons.GetStringFromInterface(record["created_at"]),
			UpdatedAt:      commons.GetStringFromInterface(record["updated_at"]),
		}
		modules = append(modules, module)
	}

	return modules, nil
}

func (controller *TestCaseController) GetProject(c *fiber.Ctx) error {
	projectID := c.Params("projectId") // Assuming the project ID is passed as a route parameter named "id"

	if projectID == "" {
		return resterrors.SendBadRequestError(c)
	}

	result, err := controller.repository.Get("projects", "project_id", projectID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if result == nil {
		return resterrors.SendNotFoundError(c, "Project not found")
	}

	// Convert the database result (map[string]interface{}) to models.Project
	project := models.Project{
		ProjectID:          commons.GetStringFromInterface(result["project_id"]),
		ProjectName:        commons.GetStringFromInterface(result["project_name"]),
		ProjectDescription: commons.GetStringFromInterface(result["project_description"]),
		ProjectStatus:      commons.GetStringFromInterface(result["project_status"]),
		ProjectOwnerID:     commons.GetStringFromInterface(result["project_owner_id"]),
		NoOfModules:        commons.GetStringFromInterface(result["no_of_modules"]),
		Type:               commons.GetStringFromInterface(result["type"]),
		Platform:           commons.GetStringFromInterface(result["platform"]),
		TargetBrowser:      commons.GetStringFromInterface(result["target_browser"]),
		URL:                commons.GetStringFromInterface(result["url"]),
		Priority:           commons.GetStringFromInterface(result["priority"]),
		CreatedAt:          commons.GetStringFromInterface(result["created_at"]),
		UpdatedAt:          commons.GetStringFromInterface(result["updated_at"]),
	}

	// Fetch modules for the project using the repository's Get function
	modules, err := controller.getModulesForProject(projectID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	project.Modules = modules

	return resterrors.SendOK(c, project)
}

func (controller *TestCaseController) CreateProject(c *fiber.Ctx) error {
	project := new(models.Project)
	if err := c.BodyParser(project); err != nil {
		return resterrors.SendBadRequestError(c)
	}

	// Generate a project ID
	project.ProjectID = uuid.New().String()
	// Set CreatedAt and UpdatedAt
	now := datetime.GetCurrentUTCTimeString()
	project.CreatedAt = now
	project.UpdatedAt = now

	// Convert the project struct to a map[string]interface{}
	data := map[string]interface{}{
		"project_id":          project.ProjectID,
		"project_name":        project.ProjectName,
		"project_description": project.ProjectDescription,
		"project_status":      project.ProjectStatus,
		"project_owner_id":    project.ProjectOwnerID,
		"type":                project.Type,
		"platform":            project.Platform,
		"target_browser":      project.TargetBrowser,
		"no_of_modules":       project.NoOfModules,
		"url":                 project.URL,
		"priority":            project.Priority,
		"created_at":          project.CreatedAt,
		"updated_at":          project.UpdatedAt,
	}

	// Create the project in the database
	err := controller.repository.Create("projects", data)
	if err != nil {
		fmt.Println("Database error:", err)
		return resterrors.SendInternalServerError(c)
	}

	// Return the created project ID
	return resterrors.SendOK(c, project)
}

func (controller *TestCaseController) UpdateProject(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) DeleteProject(c *fiber.Ctx) error {
	projectID := c.Params("projectId")

	if projectID == "" {
		return resterrors.SendBadRequestError(c)
	}

	delTestStepErr := controller.repository.Delete("test_steps", "project_id", projectID)
	if delTestStepErr != nil {
		return resterrors.SendInternalServerError(c)
	}

	testCaseDelErr := controller.repository.Delete("test_cases", "project_id", projectID)
	if testCaseDelErr != nil {
		return resterrors.SendInternalServerError(c)
	}

	moduleErr := controller.repository.Delete("modules", "project_id", projectID)
	if moduleErr != nil {
		return resterrors.SendInternalServerError(c)
	}

	err := controller.repository.Delete("projects", "project_id", projectID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) GetModules(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) getTestCasesForModule(moduleID string) ([]models.TestCase, error) {
	var testCases []models.TestCase

	records, err := controller.repository.GetAllByColumn("test_cases", "module_id", moduleID)
	if err != nil {
		return nil, err
	}

	for _, record := range records {
		testCase := models.TestCase{
			TestCaseID:     commons.GetStringFromInterface(record["test_case_id"]),
			TestCaseName:   commons.GetStringFromInterface(record["test_case_name"]),
			TestCaseStatus: commons.GetStringFromInterface(record["test_case_status"]),
			Description:    commons.GetStringFromInterface(record["description"]),
			Precondition:   commons.GetStringFromInterface(record["precondition"]),
			ExpectedResult: commons.GetStringFromInterface(record["expected_result"]),
			Priority:       commons.GetStringFromInterface(record["priority"]),
			CreatedAt:      commons.GetStringFromInterface(record["created_at"]),
			UpdatedAt:      commons.GetStringFromInterface(record["updated_at"]),
			NoOfTestSteps:  commons.GetStringFromInterface(record["no_of_test_steps"]),
		}
		testCases = append(testCases, testCase)
	}

	return testCases, nil
}

func (controller *TestCaseController) GetModule(c *fiber.Ctx) error {
	moduleID := c.Params("moduleId")

	if moduleID == "" {
		return resterrors.SendBadRequestError(c)
	}

	// Fetch module data
	moduleResult, err := controller.repository.Get("modules", "module_id", moduleID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if moduleResult == nil {
		return resterrors.SendNotFoundError(c, "Module not found")
	}

	module := models.Module{
		ModuleID:       commons.GetStringFromInterface(moduleResult["module_id"]),
		ModuleName:     commons.GetStringFromInterface(moduleResult["module_name"]),
		Description:    commons.GetStringFromInterface(moduleResult["description"]),
		ModuleStatus:   commons.GetStringFromInterface(moduleResult["module_status"]),
		ModulePriority: commons.GetStringFromInterface(moduleResult["module_priority"]),
		NoOfTestCases:  commons.GetStringFromInterface(moduleResult["no_of_test_cases"]),
		CreatedAt:      commons.GetStringFromInterface(moduleResult["created_at"]),
		UpdatedAt:      commons.GetStringFromInterface(moduleResult["updated_at"]),
	}

	// Fetch associated test cases
	testCases, err := controller.getTestCasesForModule(moduleID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// Attach test cases to the module
	module.TestCases = testCases

	return resterrors.SendOK(c, module)
}

// incrementCount increments a count column in a specified table.
func (controller *TestCaseController) incrementCount(c *fiber.Ctx, tableName string, countColumn string, idColumn string, idValue string) error {
	value, err := controller.repository.GetColumn(tableName, countColumn, idColumn, idValue)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if value == nil {
		return resterrors.SendNotFoundError(c, fmt.Sprintf("%s not found", tableName))
	}

	countStr, ok := value.(string)
	if !ok {
		return resterrors.SendInternalServerError(c)
	}

	count := 0
	if countStr != "" {
		count, err = strconv.Atoi(countStr)
		if err != nil {
			return resterrors.SendInternalServerError(c)
		}
	}

	count++

	updatedCount := strconv.Itoa(count)

	dataToUpdate := map[string]interface{}{
		countColumn: updatedCount,
	}

	log.Debug("Updated %s count %s", countColumn, updatedCount)

	affectedRows, err := controller.repository.Update(tableName, idColumn, idValue, dataToUpdate)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if affectedRows == 0 {
		return resterrors.SendInternalServerError(c)
	}

	return nil
}

func (controller *TestCaseController) CreateModule(c *fiber.Ctx) error {

	projectID := c.Params("projectId")
	var module models.Module
	if err := c.BodyParser(&module); err != nil {
		return resterrors.SendBadRequestError(c)
	}
	module.ModuleID = uuid.New().String()

	now := datetime.GetCurrentUTCTimeString()
	module.CreatedAt = now
	module.UpdatedAt = now

	data := map[string]interface{}{
		"module_id":        module.ModuleID,
		"module_name":      module.ModuleName,
		"description":      module.Description,
		"module_status":    module.ModuleStatus,
		"module_priority":  module.ModulePriority,
		"no_of_test_cases": module.NoOfTestCases,
		"created_at":       module.CreatedAt,
		"updated_at":       module.UpdatedAt,
		"project_id":       projectID,
	}
	if err := controller.repository.Create("modules", data); err != nil {
		return resterrors.SendInternalServerError(c)
	}
	if err := controller.incrementCount(c, "projects", "no_of_modules", "project_id", projectID); err != nil {
		return err // Return the error from incrementModuleCount
	}

	return resterrors.SendOK(c, module)
}

func (controller *TestCaseController) UpdateModule(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

// decrementCount decrements a count column in a specified table.
func (controller *TestCaseController) decrementCount(c *fiber.Ctx, tableName string, countColumn string, idColumn string, idValue string) error {
	value, err := controller.repository.GetColumn(tableName, countColumn, idColumn, idValue)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if value == nil {
		return resterrors.SendNotFoundError(c, fmt.Sprintf("%s not found", tableName))
	}

	countStr, ok := value.(string)
	if !ok {
		return resterrors.SendInternalServerError(c)
	}

	count := 0
	if countStr != "" {
		count, err = strconv.Atoi(countStr)
		if err != nil {
			return resterrors.SendInternalServerError(c)
		}
	}

	if count > 0 {
		count--
	} else {
		return nil // No decrement needed if already 0
	}

	updatedCount := strconv.Itoa(count)

	data := map[string]interface{}{
		countColumn: updatedCount,
	}

	log.Debug("Updated %s count %s", countColumn, updatedCount)

	affectedRows, err := controller.repository.Update(tableName, idColumn, idValue, data)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if affectedRows == 0 {
		return resterrors.SendNotFoundError(c, fmt.Sprintf("%s not found or update failed", tableName))
	}

	return nil
}

func (controller *TestCaseController) DeleteModule(c *fiber.Ctx) error {
	projectID := c.Params("projectId")
	moduleID := c.Params("moduleId")

	delTestStepErr := controller.repository.Delete("test_steps", "module_id", moduleID)
	if delTestStepErr != nil {
		return resterrors.SendInternalServerError(c)
	}

	delTestCasesErr := controller.repository.Delete("test_cases", "module_id", moduleID)
	if delTestCasesErr != nil {
		return resterrors.SendInternalServerError(c)
	}

	// 1. Delete the module from the database.
	err := controller.repository.Delete("modules", "module_id", moduleID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// 2. Decrement the no_of_modules count in the Projects table.
	err = controller.decrementCount(c, "projects", "no_of_modules", "project_id", projectID)
	if err != nil {
		return err // Return the error from decrementModuleCount
	}

	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) GetTestCases(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) CreateTestCase(c *fiber.Ctx) error {
	projectID := c.Params("projectId")
	moduleID := c.Params("moduleId")

	testCase := new(models.TestCase)
	if err := c.BodyParser(testCase); err != nil {
		return resterrors.SendBadRequestError(c)
	}

	// Generate a UUID for the test case ID
	testCase.TestCaseID = uuid.New().String()

	now := datetime.GetCurrentUTCTimeString()
	testCase.CreatedAt = now
	testCase.UpdatedAt = now

	// Validate input (add more validations as needed)
	if testCase.TestCaseName == "" {
		return resterrors.SendBadRequestError(c)
	}

	// Create a map for database insertion
	data := map[string]interface{}{
		"test_case_id":     testCase.TestCaseID,
		"test_case_name":   testCase.TestCaseName,
		"test_case_status": testCase.TestCaseStatus,
		"description":      testCase.Description,
		"precondition":     testCase.Precondition,
		"expected_result":  testCase.ExpectedResult,
		"priority":         testCase.Priority,
		"created_at":       testCase.CreatedAt,
		"updated_at":       testCase.UpdatedAt,
		"no_of_test_steps": testCase.NoOfTestSteps,
		"project_id":       projectID,
		"module_id":        moduleID,
	}

	// Insert the test case into the database
	err := controller.repository.Create("test_cases", data)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if err := controller.incrementCount(c, "modules", "no_of_test_cases", "module_id", moduleID); err != nil {
		return err // Return the error from incrementModuleCount
	}

	return resterrors.SendOK(c, testCase)
}

func (controller *TestCaseController) getTestStepsForTestCase(testCaseID string) ([]models.TestStep, error) {
	var testSteps []models.TestStep

	records, err := controller.repository.GetAllByColumn("test_steps", "test_case_id", testCaseID)
	if err != nil {
		return nil, err
	}

	for _, record := range records {
		testStep := models.TestStep{
			StepID:      commons.GetStringFromInterface(record["step_id"]),
			Description: commons.GetStringFromInterface(record["description"]),
			StepOrder:   commons.GetStringFromInterface(record["step_order"]),
			StepData:    commons.GetStringFromInterface(record["step_data"]),
			StepStatus:  commons.GetStringFromInterface(record["step_status"]),
			CreatedAt:   commons.GetStringFromInterface(record["created_at"]),
			UpdatedAt:   commons.GetStringFromInterface(record["updated_at"]),
		}
		testSteps = append(testSteps, testStep)
	}

	// Sort test steps based on StepOrder
	sort.Slice(testSteps, func(i, j int) bool {
		orderI, _ := strconv.Atoi(testSteps[i].StepOrder)
		orderJ, _ := strconv.Atoi(testSteps[j].StepOrder)
		return orderI < orderJ
	})

	return testSteps, nil
}

func (controller *TestCaseController) GetTestCase(c *fiber.Ctx) error {
	testCaseID := c.Params("testCaseId")

	if testCaseID == "" {
		return resterrors.SendBadRequestError(c)
	}

	// Fetch test case data
	testCaseResult, err := controller.repository.Get("test_cases", "test_case_id", testCaseID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if testCaseResult == nil {
		return resterrors.SendNotFoundError(c, "Test case not found")
	}

	testCase := models.TestCase{
		TestCaseID:     commons.GetStringFromInterface(testCaseResult["test_case_id"]),
		TestCaseName:   commons.GetStringFromInterface(testCaseResult["test_case_name"]),
		TestCaseStatus: commons.GetStringFromInterface(testCaseResult["test_case_status"]),
		Description:    commons.GetStringFromInterface(testCaseResult["description"]),
		Precondition:   commons.GetStringFromInterface(testCaseResult["precondition"]),
		ExpectedResult: commons.GetStringFromInterface(testCaseResult["expected_result"]),
		Priority:       commons.GetStringFromInterface(testCaseResult["priority"]),
		CreatedAt:      commons.GetStringFromInterface(testCaseResult["created_at"]),
		UpdatedAt:      commons.GetStringFromInterface(testCaseResult["updated_at"]),
		NoOfTestSteps:  commons.GetStringFromInterface(testCaseResult["no_of_test_steps"]),
	}

	// Fetch associated test steps
	testSteps, err := controller.getTestStepsForTestCase(testCaseID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// Attach test steps to the test case
	testCase.TestSteps = testSteps

	return resterrors.SendOK(c, testCase)
}

func (controller *TestCaseController) UpdateTestCase(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) ExecuteTestCase(c *fiber.Ctx) error {
	testCaseID := c.Params("testCaseId")
	moduleID := c.Params("moduleId")
	projectID := c.Params("projectId")

	// Get project details
	projectResult, err := controller.repository.Get("projects", "project_id", projectID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}
	if projectResult == nil {
		return resterrors.SendNotFoundError(c, "Project not found")
	}

	// Get module details
	moduleResult, err := controller.repository.Get("modules", "module_id", moduleID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}
	if moduleResult == nil {
		return resterrors.SendNotFoundError(c, "Module not found")
	}

	// Get test case details
	testCaseResult, err := controller.repository.Get("test_cases", "test_case_id", testCaseID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}
	if testCaseResult == nil {
		return resterrors.SendNotFoundError(c, "Test case not found")
	}

	// Get test steps
	testSteps, err := controller.getTestStepsForTestCase(testCaseID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// Create execution data structure
	executionData := struct {
		ProjectID         string            `json:"projectId"`
		ProjectName       string            `json:"projectName"`
		ProjectStatus     string            `json:"projectStatus"`
		ModuleID          string            `json:"moduleId"`
		ModuleName        string            `json:"moduleName"`
		ModuleStatus      string            `json:"moduleStatus"`
		TestCaseID        string            `json:"testCaseId"`
		TestCaseName      string            `json:"testCaseName"`
		TestCaseStatus    string            `json:"testCaseStatus"`
		TestCasePriority  string            `json:"testCasePriority"`
		Precondition      string            `json:"precondition"`
		ExpectedResult    string            `json:"expectedResult"`
		TestSteps         []models.TestStep `json:"testSteps"`
		ExecutionDateTime string            `json:"executionDateTime"`
	}{
		ProjectID:         commons.GetStringFromInterface(projectResult["project_id"]),
		ProjectName:       commons.GetStringFromInterface(projectResult["project_name"]),
		ProjectStatus:     commons.GetStringFromInterface(projectResult["project_status"]),
		ModuleID:          commons.GetStringFromInterface(moduleResult["module_id"]),
		ModuleName:        commons.GetStringFromInterface(moduleResult["module_name"]),
		ModuleStatus:      commons.GetStringFromInterface(moduleResult["module_status"]),
		TestCaseID:        commons.GetStringFromInterface(testCaseResult["test_case_id"]),
		TestCaseName:      commons.GetStringFromInterface(testCaseResult["test_case_name"]),
		TestCaseStatus:    commons.GetStringFromInterface(testCaseResult["test_case_status"]),
		TestCasePriority:  commons.GetStringFromInterface(testCaseResult["priority"]),
		Precondition:      commons.GetStringFromInterface(testCaseResult["precondition"]),
		ExpectedResult:    commons.GetStringFromInterface(testCaseResult["expected_result"]),
		TestSteps:         testSteps,
		ExecutionDateTime: datetime.GetCurrentUTCTimeString(),
	}

	return resterrors.SendOK(c, executionData)
}

func (controller *TestCaseController) TestCaseResults(c *fiber.Ctx) error {
	action := c.Query("action")
	testCaseID := c.Params("testcaseId")
	moduleID := c.Params("moduleId")
	projectID := c.Params("projectId")

	if testCaseID == "" || moduleID == "" || projectID == "" {
		return resterrors.SendBadRequestError(c)
	}

	// Get project details
	projectResult, err := controller.repository.Get("projects", "project_id", projectID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}
	if projectResult == nil {
		return resterrors.SendNotFoundError(c, "Project not found")
	}

	// Get module details
	moduleResult, err := controller.repository.Get("modules", "module_id", moduleID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}
	if moduleResult == nil {
		return resterrors.SendNotFoundError(c, "Module not found")
	}

	// Get test case details
	testCaseResult, err := controller.repository.Get("test_cases", "test_case_id", testCaseID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}
	if testCaseResult == nil {
		return resterrors.SendNotFoundError(c, "Test case not found")
	}

	// Get test steps
	testSteps, err := controller.getTestStepsForTestCase(testCaseID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if action == "download" {
		// Create PDF
		pdf := gofpdf.New("P", "mm", "A4", "")
		pdf.AddPage()

		// Add header
		pdf.SetFont("Arial", "B", 16)
		pdf.Cell(190, 10, "Test Case Documentation")
		pdf.Ln(15)

		// Project Details Section
		pdf.SetFont("Arial", "B", 14)
		pdf.Cell(190, 10, "Project Information")
		pdf.Ln(10)
		pdf.SetFont("Arial", "", 12)
		pdf.Cell(50, 8, "Project Name:")
		pdf.Cell(140, 8, commons.GetStringFromInterface(projectResult["project_name"]))
		pdf.Ln(8)
		pdf.Cell(50, 8, "Project Status:")
		pdf.Cell(140, 8, commons.GetStringFromInterface(projectResult["project_status"]))
		pdf.Ln(15)

		// Module Details Section
		pdf.SetFont("Arial", "B", 14)
		pdf.Cell(190, 10, "Module Information")
		pdf.Ln(10)
		pdf.SetFont("Arial", "", 12)
		pdf.Cell(50, 8, "Module Name:")
		pdf.Cell(140, 8, commons.GetStringFromInterface(moduleResult["module_name"]))
		pdf.Ln(8)
		pdf.Cell(50, 8, "Module Status:")
		pdf.Cell(140, 8, commons.GetStringFromInterface(moduleResult["module_status"]))
		pdf.Ln(15)

		// Test Case Details Section
		pdf.SetFont("Arial", "B", 14)
		pdf.Cell(190, 10, "Test Case Information")
		pdf.Ln(10)
		pdf.SetFont("Arial", "", 12)
		pdf.Cell(50, 8, "Test Case Name:")
		pdf.Cell(140, 8, commons.GetStringFromInterface(testCaseResult["test_case_name"]))
		pdf.Ln(8)
		pdf.Cell(50, 8, "Priority:")
		pdf.Cell(140, 8, commons.GetStringFromInterface(testCaseResult["priority"]))
		pdf.Ln(8)
		pdf.Cell(50, 8, "Description:")
		pdf.MultiCell(140, 8, commons.GetStringFromInterface(testCaseResult["description"]), "", "", false)
		pdf.Ln(8)
		pdf.Cell(50, 8, "Precondition:")
		pdf.MultiCell(140, 8, commons.GetStringFromInterface(testCaseResult["precondition"]), "", "", false)
		pdf.Ln(8)
		pdf.Cell(50, 8, "Expected Result:")
		pdf.MultiCell(140, 8, commons.GetStringFromInterface(testCaseResult["expected_result"]), "", "", false)
		pdf.Ln(15)

		// Test Steps Table
		pdf.SetFont("Arial", "B", 14)
		pdf.Cell(190, 10, "Test Steps")
		pdf.Ln(10)

		// Table Headers
		pdf.SetFont("Arial", "B", 12)
		pdf.SetFillColor(200, 200, 200)
		pdf.CellFormat(15, 10, "Step", "1", 0, "C", true, 0, "")
		pdf.CellFormat(75, 10, "Description", "1", 0, "C", true, 0, "")
		pdf.CellFormat(50, 10, "Test Data", "1", 0, "C", true, 0, "")
		pdf.CellFormat(50, 10, "Status", "1", 1, "C", true, 0, "")

		// Table Content
		pdf.SetFont("Arial", "", 12)
		for _, step := range testSteps {
			pdf.CellFormat(15, 10, step.StepOrder, "1", 0, "C", false, 0, "")
			pdf.CellFormat(75, 10, step.Description, "1", 0, "L", false, 0, "")
			pdf.CellFormat(50, 10, step.StepData, "1", 0, "L", false, 0, "")
			pdf.CellFormat(50, 10, step.StepStatus, "1", 1, "C", false, 0, "")
		}

		// Add footer with timestamp
		pdf.Ln(10)
		pdf.SetFont("Arial", "I", 10)
		pdf.Cell(190, 8, fmt.Sprintf("Generated on: %s", datetime.GetCurrentUTCTimeString()))

		// Generate PDF bytes
		var buf bytes.Buffer
		err = pdf.Output(&buf)
		if err != nil {
			return resterrors.SendInternalServerError(c)
		}

		// Set response headers
		c.Set("Content-Type", "application/pdf")
		c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=test_case_%s.pdf", testCaseID))

		return c.Send(buf.Bytes())
	}
	return resterrors.SendOK(c, testCaseResult)
}

func (controller *TestCaseController) DeleteTestCase(c *fiber.Ctx) error {
	moduleID := c.Params("moduleId")
	testCaseID := c.Params("testCaseId")

	delTestStepErr := controller.repository.Delete("test_steps", "test_case_id", testCaseID)
	if delTestStepErr != nil {
		return resterrors.SendInternalServerError(c)
	}

	// 1. Delete the module from the database.
	err := controller.repository.Delete("test_cases", "test_case_id", testCaseID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// 2. Decrement the no_of_modules count in the Projects table.
	err = controller.decrementCount(c, "modules", "no_of_test_cases", "module_id", moduleID)
	if err != nil {
		return err // Return the error from decrementModuleCount
	}

	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) GetTestSteps(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) AddTestStep(c *fiber.Ctx) error {

	projectID := c.Params("projectId")
	moduleID := c.Params("moduleId")
	testCaseID := c.Params("testCaseId")

	testStep := new(models.TestStep)
	if err := c.BodyParser(testStep); err != nil {
		return resterrors.SendBadRequestError(c)
	}

	// Generate a UUID for the test step ID
	testStep.StepID = uuid.New().String()
	now := datetime.GetCurrentUTCTimeString()
	testStep.CreatedAt = now
	testStep.UpdatedAt = now

	// Validate input (add more validations as needed)
	if testStep.Description == "" {
		return resterrors.SendBadRequestError(c)
	}
	if testStep.StepStatus == "" {
		return resterrors.SendBadRequestError(c)
	}

	// Create a map for database insertion
	data := map[string]interface{}{
		"step_id":      testStep.StepID,
		"description":  testStep.Description,
		"step_order":   testStep.StepOrder,
		"step_data":    testStep.StepData,
		"step_status":  testStep.StepStatus,
		"created_at":   testStep.CreatedAt,
		"updated_at":   testStep.UpdatedAt,
		"module_id":    moduleID,
		"project_id":   projectID,
		"test_case_id": testCaseID,
	}

	// Insert the test step into the database
	err := controller.repository.Create("test_steps", data)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	err = controller.incrementCount(c, "test_cases", "no_of_test_steps", "test_case_id", testCaseID)
	if err != nil {
		return err // Return the error from decrementModuleCount
	}

	return resterrors.SendCreated(c, testStep)
}

func (controller *TestCaseController) UpdateTestStep(c *fiber.Ctx) error {
	// Get step ID from params
	stepID := c.Params("teststepId")
	if stepID == "" {
		return resterrors.SendBadRequestError(c)
	}

	// Parse request body into TestStep struct
	var testStep models.TestStep
	if err := c.BodyParser(&testStep); err != nil {
		return resterrors.SendBadRequestError(c)
	}

	// Create data map for update
	data := make(map[string]interface{})

	// Only add fields that are present in the request
	if testStep.StepOrder != "" {
		data["step_order"] = testStep.StepOrder
	}
	if testStep.Description != "" {
		data["description"] = testStep.Description
	}
	if testStep.StepData != "" {
		data["step_data"] = testStep.StepData
	}
	if testStep.StepStatus != "" {
		data["step_status"] = testStep.StepStatus
	}

	// Always update the updated_at timestamp
	data["updated_at"] = datetime.GetCurrentUTCTimeString()

	// If no fields to update were provided
	if len(data) == 0 {
		return resterrors.SendBadRequestError(c)
	}

	// Perform the update
	affectedRows, err := controller.repository.Update("test_steps", "step_id", stepID, data)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if affectedRows == 0 {
		return resterrors.SendNotFoundError(c, "Test step not found")
	}

	// Fetch the updated test step
	result, err := controller.repository.Get("test_steps", "step_id", stepID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// Convert the result to TestStep model
	updatedTestStep := models.TestStep{
		StepID:      commons.GetStringFromInterface(result["step_id"]),
		StepOrder:   commons.GetStringFromInterface(result["step_order"]),
		Description: commons.GetStringFromInterface(result["description"]),
		StepData:    commons.GetStringFromInterface(result["step_data"]),
		StepStatus:  commons.GetStringFromInterface(result["step_status"]),
		CreatedAt:   commons.GetStringFromInterface(result["created_at"]),
		UpdatedAt:   commons.GetStringFromInterface(result["updated_at"]),
	}

	return resterrors.SendOK(c, updatedTestStep)
}

func (controller *TestCaseController) ExecuteTestStep(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) GetTestStep(c *fiber.Ctx) error {
	testStepID := c.Params("teststepId")
	testCaseID := c.Params("testcaseId")

	if testStepID == "" || testCaseID == "" {
		return resterrors.SendBadRequestError(c)
	}

	// Fetch test step data
	testStepResult, err := controller.repository.Get("test_steps", "step_id", testStepID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	if testStepResult == nil {
		return resterrors.SendNotFoundError(c, "Test step not found")
	}

	// Verify if the test step belongs to the specified test case
	if commons.GetStringFromInterface(testStepResult["test_case_id"]) != testCaseID {
		return resterrors.SendNotFoundError(c, "Test step not found for this test case")
	}

	// Convert the database result to TestStep model
	testStep := models.TestStep{
		StepID:      commons.GetStringFromInterface(testStepResult["step_id"]),
		Description: commons.GetStringFromInterface(testStepResult["description"]),
		StepOrder:   commons.GetStringFromInterface(testStepResult["step_order"]),
		StepData:    commons.GetStringFromInterface(testStepResult["step_data"]),
		StepStatus:  commons.GetStringFromInterface(testStepResult["step_status"]),
		CreatedAt:   commons.GetStringFromInterface(testStepResult["created_at"]),
		UpdatedAt:   commons.GetStringFromInterface(testStepResult["updated_at"]),
	}

	return resterrors.SendOK(c, testStep)
}

func (controller *TestCaseController) CheckExecution(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) DeleteTestStep(c *fiber.Ctx) error {
	log.Info("Deleting test step")
	testCaseID := c.Params("testCaseId")
	stepID := c.Params("teststepId")

	// 1. Delete the test step from the database.
	err := controller.repository.Delete("test_steps", "step_id", stepID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	// 2. Decrement the no_of_test_steps count in the Test Cases table.
	err = controller.decrementCount(c, "test_cases", "no_of_test_steps", "test_case_id", testCaseID)
	if err != nil {
		return err // Return the error from decrementCount
	}

	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) UpdateTestSteps(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) DeleteTestSteps(c *fiber.Ctx) error {
	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) UpdateTestStepsOrder(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}
