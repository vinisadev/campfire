package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	collectionService := NewCollectionService()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "campfire",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 13, G: 13, B: 15, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			collectionService.SetContext(ctx)
		},
		Bind: []interface{}{
			app,
			collectionService,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
