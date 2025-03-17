package datetime

import (
	"time"
)

// GetCurrentUTCTimeString returns the current UTC time as a string in RFC3339 format.
func GetCurrentUTCTimeString() string {
        now := time.Now().UTC()
        return now.Format(time.RFC3339)
}
