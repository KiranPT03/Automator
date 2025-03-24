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
		v1.Get("/testcases/projects/:projectId/modules", testCaseController.GetModules)
		v1.Get("/testcases/projects/:projectId/modules/:moduleId", testCaseController.GetModule)
		v1.Post("/testcases/projects/:projectId/modules", testCaseController.CreateModule)
		v1.Put("/testcases/projects/:projectId/modules/:moduleId", testCaseController.UpdateModule)
		v1.Delete("/testcases/projects/:projectId/modules/:moduleId", testCaseController.DeleteModule)

		// Testcase routes
		v1.Get("/testcases/projects/:projectId/modules/:moduleId/testcases", testCaseController.GetTestCases)
		v1.Get("/testcases/projects/:projectId/modules/:moduleId/testcases/:testcaseId", testCaseController.GetTestCase)
		v1.Post("/testcases/projects/:projectId/modules/:moduleId/testcases", testCaseController.CreateTestCase)
		v1.Put("/testcases/projects/:projectId/modules/:moduleId/testcases/:testcaseId", testCaseController.UpdateTestCase)
		v1.Delete("/testcases/projects/:projectId/modules/:moduleId/testcases/:testcaseId", testCaseController.DeleteTestCase)

		// Teststeps routes
		v1.Post("/testcases/projects/:projectId/modules/:moduleId/testcases/:testcaseId/teststeps", testCaseController.AddTestStep)
		v1.Put("/testcases/projects/:projectId/modules/:moduleId/testcases/:testcaseId/teststeps/:teststepId", testCaseController.UpdateTestStep)
		v1.Delete("/testcases/projects/:projectId/modules/:moduleId/testcases/:testcaseId/teststeps/:teststepId", testCaseController.DeleteTestStep)

		// Teststeps routes
	}
}
