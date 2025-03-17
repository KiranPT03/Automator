package testcases

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	config "automator/services/testlab/pkg/config"
	postgres "automator/services/testlab/pkg/databases/postgres"
	models "automator/services/testlab/pkg/models"
	commons "automator/services/testlab/pkg/utils/commons"
	datetime "automator/services/testlab/pkg/utils/datetime"
	log "automator/services/testlab/pkg/utils/loggers"
	resterrors "automator/services/testlab/pkg/utils/resterrors"
)

type TestCaseController struct {
	repository *postgres.PostgreSQLRepository
}

func NewTestCaseController(config *config.Config) *TestCaseController {
	// Create a new PostgreSQL repository instance
	log.Info("Creating new instance of PostgreSQL repository")
	repository, err := postgres.NewPostgreSQLRepository(config)
	if err != nil {
		panic(err)
	}

	return &TestCaseController{repository: repository}
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

	err := controller.repository.Delete("projects", "project_id", projectID)
	if err != nil {
		return resterrors.SendInternalServerError(c)
	}

	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) GetModules(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) GetModule(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) CreateModule(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) UpdateModule(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) DeleteModule(c *fiber.Ctx) error {
	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) GetTestCases(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) CreateTestCase(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) GetTestCase(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) UpdateTestCase(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) DeleteTestCase(c *fiber.Ctx) error {
	return resterrors.SendNoContent(c)
}

func (controller *TestCaseController) GetTestSteps(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) AddTestStep(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) UpdateTestStep(c *fiber.Ctx) error {
	return resterrors.SendOK(c, "ok")
}

func (controller *TestCaseController) DeleteTestStep(c *fiber.Ctx) error {
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
