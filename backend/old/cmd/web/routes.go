package main

import (
	"net/http"

	"github.com/astrojerms/saga/assets"
)

func (app *application) routes() http.Handler {
	mux := http.NewServeMux()

	fileServer := http.FileServer(http.FS(assets.EmbeddedFiles))
	mux.Handle("GET /static/", fileServer)

	mux.HandleFunc("GET /{$}", app.home)

	mux.HandleFunc("GET /alerts", app.alerts)
	mux.HandleFunc("GET /search", app.search)
	mux.Handle("GET /basic-auth-protected", app.requireBasicAuthentication(http.HandlerFunc(app.protected)))

	return app.logAccess(app.recoverPanic(app.securityHeaders(mux)))
}
