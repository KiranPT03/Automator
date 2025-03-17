package commons

func GetStringOrDefault(value string, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}

// Helper function to get string from interface{}, handling nil values.
func GetStringFromInterface(value interface{}) string {
	if value == nil {
		return ""
	}
	str, ok := value.(string)
	if !ok {
		return "" // Or handle the error as needed, e.g., log or return an error.
	}
	return str
}
