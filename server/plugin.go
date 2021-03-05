package main

import (
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-server/v5/plugin"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration

	root *mux.Router
}

func (p *Plugin) OnActivate() error {
	p.SetupRouting()
	return nil
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.root.ServeHTTP(w, r)
}

// See https://developers.mattermost.com/extend/plugins/server/reference/
