package server

import (
	"net/http"
)

func (s *Server) getItemsHandler(w http.ResponseWriter, r *http.Request) {

	items := []map[string]any{
		{"id": 0, "name": "Icon 1", "cost": 100},
		{"id": 1, "name": "Icon 2", "cost": 150},
	}

	colors := []map[string]any{
		{"id": 0, "name": "Color 1", "cost": 80},
		{"id": 1, "name": "Color 2", "cost": 120},
	}

	SendGenericResponse(w, true, 200, map[string]any{
		"items":  items,
		"colors": colors,
	})
}
