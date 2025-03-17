package routes

import (
	"github.com/gofiber/fiber/v2"

	config "automator/services/testlab/pkg/config"
	testCases "automator/services/testlab/pkg/controllers/testcases"
	log "automator/services/testlab/pkg/utils/loggers"
	middleware "automator/services/testlab/pkg/utils/middleware"
)

func Init(app *fiber.App, config *config.Config) {
	log.Info("Initializing the routes")
	v1 := app.Group("/api/:version/testlab-service", middleware.Versioning())
	{
		testCaseController := testCases.NewTestCaseController(config)

		// Project routes
		v1.Get("/testcases/projects", testCaseController.GetProjects)
		v1.Get("/testcases/projects/:projectId", testCaseController.GetProject)
		v1.Post("/testcases/projects", testCaseController.CreateProject)
		v1.Put("/testcases/projects/:projectId", testCaseController.UpdateProject)
		v1.Delete("/testcases/projects/:projectId", testCaseController.DeleteProject)

		// Module routes
		v1.Get("/services/testlab/testcases/projects/:project_id/modules", testCaseController.GetModules)
		v1.Get("/services/testlab/testcases/projects/:project_id/modules/:module_id", testCaseController.GetModule)
		v1.Post("/services/testlab/testcases/projects/:project_id/modules", testCaseController.CreateModule)
		v1.Put("/services/testlab/testcases/modules/:module_id", testCaseController.UpdateModule)
		v1.Delete("/services/testlab/testcases/projects/:project_id/modules/:module_id", testCaseController.DeleteModule)

		// Testcase routes
		v1.Get("/services/testlab/testcases/projects/:project_id/modules/:module_id/testcases", testCaseController.GetTestCases)
		v1.Get("/services/testlab/testcases/projects/:project_id/modules/:module_id/testcases/:testcase_id", testCaseController.GetTestCase)
		v1.Post("/services/testlab/testcases/projects/:project_id/modules/:module_id/testcases", testCaseController.CreateTestCase)
		v1.Put("/services/testlab/testcases/testcases/:testcase_id", testCaseController.UpdateTestCase)
		v1.Delete("/services/testlab/testcases/projects/:project_id/modules/:module_id/testcases/:testcase_id", testCaseController.DeleteTestCase)

		// Teststeps routes
		v1.Post("/services/testlab/testcases/projects/:project_id/modules/:module_id/testcases/:testcase_id/teststeps", testCaseController.AddTestStep)
		v1.Put("/services/testlab/testcases/projects/:project_id/modules/:module_id/testcases/:testcase_id/teststeps/:teststep_id", testCaseController.UpdateTestStep)
		v1.Delete("/services/testlab/testcases/projects/:project_id/modules/:module_id/testcases/:testcase_id/teststeps/:teststep_id", testCaseController.DeleteTestStep)

		// Teststeps routes
	}
}
