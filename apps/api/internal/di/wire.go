//go:build wireinject
// +build wireinject

package di

import (
	"github.com/google/wire"
)

// InitializeApp creates the application with all dependencies wired
func InitializeApp() (*App, error) {
	wire.Build(
		AppSet,
		ProvideApp,
	)
	return nil, nil
}
