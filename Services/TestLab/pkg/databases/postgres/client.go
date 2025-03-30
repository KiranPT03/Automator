package postgres

import (
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/lib/pq"

	config "automator/services/testlab/pkg/config"
	log "automator/services/testlab/pkg/utils/loggers"
)

// PostgreSQLRepository represents a PostgreSQL repository.
type PostgreSQLRepository struct {
	db *sql.DB
}

// NewPostgreSQLRepository creates a new PostgreSQL repository.
func NewPostgreSQLRepository(config *config.Config) (*PostgreSQLRepository, error) {
	// Create a connection string
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		config.Postgres.Host, config.Postgres.Port, config.Postgres.User, config.Postgres.Password, config.Postgres.DBname)

	// Connect to the database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Ping the database to verify the connection
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	log.Debug("Connected to the database!")
	// Create the projects table if it doesn't exist.
	err = createTables(db)
	if err != nil {
		return nil, err
	}
	log.Debug("Create Tables successfully")

	return &PostgreSQLRepository{db: db}, nil
}

// createTables creates the projects, modules, and test_cases tables if they don't exist.
func createTables(db *sql.DB) error {
	projectQuery := `
                CREATE TABLE IF NOT EXISTS projects (
                        project_id VARCHAR(255) PRIMARY KEY,
                        project_name VARCHAR(255),
                        project_description TEXT,
                        project_status VARCHAR(50),
                        project_owner_id VARCHAR(255),
                        no_of_modules VARCHAR(50),
                        type VARCHAR(50),
                        platform VARCHAR(50),
                        target_browser VARCHAR(50),
                        url VARCHAR(255),
                        priority VARCHAR(50),
                        created_at VARCHAR(50),
                        updated_at VARCHAR(50)
                );
        `
	_, err := db.Exec(projectQuery)
	if err != nil {
		return err
	}
	log.Debug("Projects table created or already exists.")

	moduleQuery := `
                CREATE TABLE IF NOT EXISTS modules (
                        module_id VARCHAR(255) PRIMARY KEY,
                        module_name VARCHAR(255),
                        description TEXT,
                        module_status VARCHAR(50),
                        module_priority VARCHAR(50),
                        no_of_test_cases VARCHAR(50),
                        created_at VARCHAR(50),
                        updated_at VARCHAR(50),
                        project_id VARCHAR(255),
                        FOREIGN KEY (project_id) REFERENCES projects(project_id)
                );
        `
	_, err = db.Exec(moduleQuery)
	if err != nil {
		return err
	}
	log.Debug("Modules table created or already exists.")

	testCaseQuery := `
                CREATE TABLE IF NOT EXISTS test_cases (
                        test_case_id VARCHAR(255) PRIMARY KEY,
                        test_case_name VARCHAR(255),
                        test_case_status VARCHAR(50),
                        description TEXT,
                        precondition TEXT,
                        expected_result TEXT,
                        priority VARCHAR(50),
                        created_at VARCHAR(255),
                        updated_at VARCHAR(255),
                        no_of_test_steps VARCHAR(255),
                        project_id VARCHAR(255),
                        module_id VARCHAR(255),
                        FOREIGN KEY (module_id) REFERENCES modules(module_id)
                );
        `
	_, err = db.Exec(testCaseQuery)
	if err != nil {
		return err
	}
	log.Debug("Test cases table created or already exists.")

	testStepQuery := `
                CREATE TABLE IF NOT EXISTS test_steps (
                        step_id VARCHAR(255) PRIMARY KEY,
                        description TEXT,
                        step_data TEXT,
						step_order VARCHAR(50),
                        step_status VARCHAR(50),
                        created_at VARCHAR(255),
                        updated_at VARCHAR(255),
                        module_id VARCHAR(255),
                        project_id VARCHAR(255),
                        test_case_id VARCHAR(255),
                        FOREIGN KEY (test_case_id) REFERENCES test_cases(test_case_id)
                );
        `
	_, err = db.Exec(testStepQuery)
	if err != nil {
		return err
	}
	log.Debug("Test steps table created or already exists.")

	return nil
}

// GetAllByColumn retrieves all records from the specified table where a specific column matches a given value.
func (r *PostgreSQLRepository) GetAllByColumn(tableName string, columnName string, columnValue interface{}) ([]map[string]interface{}, error) {
	var records []map[string]interface{}

	query := fmt.Sprintf("SELECT * FROM %s WHERE %s = $1", tableName, columnName)
	rows, err := r.db.Query(query, columnValue)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return nil, err
		}

		record := make(map[string]interface{})
		for i, col := range cols {
			record[col] = columns[i]
		}

		records = append(records, record)
	}

	return records, nil
}

// GetAll retrieves all records from the specified table.
func (r *PostgreSQLRepository) GetAll(tableName string) ([]map[string]interface{}, error) {
	log.Info("Get all devices from database")
	var records []map[string]interface{}

	query := fmt.Sprintf("SELECT * FROM %s", tableName)
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return nil, err
		}

		record := make(map[string]interface{})
		for i, col := range cols {
			record[col] = columns[i]
		}

		records = append(records, record)
	}

	return records, nil
}

// Get retrieves a record by the specified column and value from the specified table.
func (r *PostgreSQLRepository) Get(tableName string, column string, value interface{}) (map[string]interface{}, error) {
	var record map[string]interface{}

	query := fmt.Sprintf("SELECT * FROM %s WHERE %s = $1", tableName, column)
	rows, err := r.db.Query(query, value)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	if rows.Next() {
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return nil, err
		}

		record = make(map[string]interface{})
		for i, col := range cols {
			record[col] = columns[i]
		}
	}

	return record, nil
}

// GetColumn retrieves a single column value by the specified condition from the specified table.
func (r *PostgreSQLRepository) GetColumn(tableName string, columnToRetrieve string, conditionColumn string, conditionValue interface{}) (interface{}, error) {
	var result interface{}

	query := fmt.Sprintf("SELECT %s FROM %s WHERE %s = $1", columnToRetrieve, tableName, conditionColumn)
	err := r.db.QueryRow(query, conditionValue).Scan(&result)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Return nil if no rows found (optional)
		}
		return nil, err
	}

	return result, nil
}

// Create creates a new record in the specified table.
func (r *PostgreSQLRepository) Create(tableName string, data map[string]interface{}) error {

	columns := make([]string, 0, len(data))
	values := make([]interface{}, 0, len(data))
	params := make([]string, 0, len(data))

	for k, v := range data {
		columns = append(columns, k)
		values = append(values, v)
		params = append(params, fmt.Sprintf("$%d", len(params)+1))
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)",
		tableName,
		strings.Join(columns, ", "),
		strings.Join(params, ", "))

	_, err := r.db.Exec(query, values...)

	return err
}

// Update updates an existing record in the specified table.
func (r *PostgreSQLRepository) Update(tableName string, idColumn string, idValue string, data map[string]interface{}) (int64, error) {
	var affectedRows int64

	columns := make([]string, 0, len(data))
	values := make([]interface{}, 0, len(data))
	for k, v := range data {
		columns = append(columns, fmt.Sprintf("%s = $%d", k, len(values)+1))
		values = append(values, v)
	}

	query := fmt.Sprintf("UPDATE %s SET %s WHERE %s = $%d",
		tableName,
		strings.Join(columns, ", "),
		idColumn,
		len(values)+1)

	log.Debug("Query string: %s", query)

	values = append(values, idValue)

	result, err := r.db.Exec(query, values...)
	log.Debug("Error: %v", err)
	if err != nil {
		return 0, err
	}

	log.Debug("Result: %v", result)

	affectedRows, err = result.RowsAffected()

	return affectedRows, err
}

// Delete deletes a record by the specified column and value from the specified table.
func (r *PostgreSQLRepository) Delete(tableName string, column string, value interface{}) error {

	query := fmt.Sprintf("DELETE FROM %s WHERE %s = $1", tableName, column)
	_, err := r.db.Exec(query, value)

	return err
}

// CheckExist checks if a record with the specified column and value exists in the table.
func (r *PostgreSQLRepository) CheckExist(tableName string, column string, value interface{}) (bool, error) {
	var exists bool

	query := fmt.Sprintf("SELECT EXISTS (SELECT 1 FROM %s WHERE %s = $1)", tableName, column)
	err := r.db.QueryRow(query, value).Scan(&exists)

	return exists, err
}

// ExecuteQuery executes a raw SQL query and returns the results.
func (r *PostgreSQLRepository) ExecuteQuery(query string, args ...interface{}) ([]map[string]interface{}, error) {
	// log.Debug("Executing query: %s", query)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var results []map[string]interface{}
	for rows.Next() {
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return nil, err
		}

		record := make(map[string]interface{})
		for i, col := range cols {
			record[col] = columns[i]
		}

		results = append(results, record)
	}

	return results, nil
}
