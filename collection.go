package main

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// ItemType represents the type of item in a collection
type ItemType string

const (
	ItemTypeFolder  ItemType = "folder"
	ItemTypeRequest ItemType = "request"
)

// KeyValuePair represents a key-value pair for headers, params, etc.
type KeyValuePair struct {
	Key     string `json:"key"`
	Value   string `json:"value"`
	Enabled bool   `json:"enabled"`
}

// RequestData holds the actual request configuration
type RequestData struct {
	Method  string         `json:"method"`
	URL     string         `json:"url"`
	Headers []KeyValuePair `json:"headers"`
	Params  []KeyValuePair `json:"params"`
	Body    string         `json:"body"`
}

// CollectionItem represents either a folder or a request in the collection tree
type CollectionItem struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Type      ItemType          `json:"type"`
	Children  []*CollectionItem `json:"children,omitempty"`
	Request   *RequestData      `json:"request,omitempty"`
	CreatedAt time.Time         `json:"createdAt"`
	UpdatedAt time.Time         `json:"updatedAt"`
}

// Collection represents a top-level collection
type Collection struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Items     []*CollectionItem `json:"items"`
	CreatedAt time.Time         `json:"createdAt"`
	UpdatedAt time.Time         `json:"updatedAt"`
}

// CollectionWithPath wraps a collection with its file path for the frontend
type CollectionWithPath struct {
	Collection
	FilePath string `json:"filePath"`
}

// CollectionService handles collection operations
type CollectionService struct {
	ctx context.Context
	// openCollections maps collection ID to file path
	openCollections map[string]string
}

// NewCollectionService creates a new collection service
func NewCollectionService() *CollectionService {
	return &CollectionService{
		openCollections: make(map[string]string),
	}
}

// SetContext sets the Wails context (called from app startup)
func (s *CollectionService) SetContext(ctx context.Context) {
	s.ctx = ctx
}

// loadCollectionFromPath loads a collection from a specific file path
func (s *CollectionService) loadCollectionFromPath(path string) (*Collection, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var col Collection
	if err := json.Unmarshal(data, &col); err != nil {
		return nil, err
	}

	return &col, nil
}

// saveCollectionToPath saves a collection to a specific file path
func (s *CollectionService) saveCollectionToPath(col *Collection, path string) error {
	// Ensure directory exists
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	col.UpdatedAt = time.Now()
	data, err := json.MarshalIndent(col, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

// GetOpenCollections returns all currently open collections
func (s *CollectionService) GetOpenCollections() ([]CollectionWithPath, error) {
	var collections []CollectionWithPath

	for id, path := range s.openCollections {
		col, err := s.loadCollectionFromPath(path)
		if err != nil {
			// Remove invalid collection from open list
			delete(s.openCollections, id)
			continue
		}
		collections = append(collections, CollectionWithPath{
			Collection: *col,
			FilePath:   path,
		})
	}

	return collections, nil
}

// GetCollection returns a single collection by ID
func (s *CollectionService) GetCollection(id string) (*CollectionWithPath, error) {
	path, ok := s.openCollections[id]
	if !ok {
		return nil, errors.New("collection not open")
	}

	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return nil, err
	}

	return &CollectionWithPath{
		Collection: *col,
		FilePath:   path,
	}, nil
}

// CreateCollection creates a new collection with a save dialog
func (s *CollectionService) CreateCollection(name string) (*CollectionWithPath, error) {
	// Show save dialog
	path, err := runtime.SaveFileDialog(s.ctx, runtime.SaveDialogOptions{
		Title:           "Save Collection",
		DefaultFilename: name + ".campfire",
		Filters: []runtime.FileFilter{
			{DisplayName: "Campfire Collection", Pattern: "*.campfire"},
			{DisplayName: "JSON Files", Pattern: "*.json"},
		},
	})
	if err != nil {
		return nil, err
	}
	if path == "" {
		return nil, errors.New("no file selected")
	}

	// Add extension if not present
	if filepath.Ext(path) == "" {
		path += ".campfire"
	}

	now := time.Now()
	col := &Collection{
		ID:        uuid.New().String(),
		Name:      name,
		Items:     []*CollectionItem{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.saveCollectionToPath(col, path); err != nil {
		return nil, err
	}

	// Track as open collection
	s.openCollections[col.ID] = path

	return &CollectionWithPath{
		Collection: *col,
		FilePath:   path,
	}, nil
}

// OpenCollection opens an existing collection file via dialog
func (s *CollectionService) OpenCollection() (*CollectionWithPath, error) {
	path, err := runtime.OpenFileDialog(s.ctx, runtime.OpenDialogOptions{
		Title: "Open Collection",
		Filters: []runtime.FileFilter{
			{DisplayName: "Campfire Collection", Pattern: "*.campfire;*.json"},
		},
	})
	if err != nil {
		return nil, err
	}
	if path == "" {
		return nil, errors.New("no file selected")
	}

	return s.OpenCollectionFromPath(path)
}

// OpenCollectionFromPath opens a collection from a specific path
func (s *CollectionService) OpenCollectionFromPath(path string) (*CollectionWithPath, error) {
	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return nil, err
	}

	// Track as open collection
	s.openCollections[col.ID] = path

	return &CollectionWithPath{
		Collection: *col,
		FilePath:   path,
	}, nil
}

// CloseCollection closes a collection (removes from open list)
func (s *CollectionService) CloseCollection(id string) error {
	delete(s.openCollections, id)
	return nil
}

// UpdateCollection updates a collection's name
func (s *CollectionService) UpdateCollection(id, name string) (*CollectionWithPath, error) {
	path, ok := s.openCollections[id]
	if !ok {
		return nil, errors.New("collection not open")
	}

	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return nil, err
	}

	col.Name = name
	if err := s.saveCollectionToPath(col, path); err != nil {
		return nil, err
	}

	return &CollectionWithPath{
		Collection: *col,
		FilePath:   path,
	}, nil
}

// DeleteCollection closes and deletes a collection file
func (s *CollectionService) DeleteCollection(id string) error {
	path, ok := s.openCollections[id]
	if !ok {
		return errors.New("collection not open")
	}

	// Remove from open collections
	delete(s.openCollections, id)

	// Delete the file
	return os.Remove(path)
}

// Helper functions for finding items in the tree
func findItemAndParent(items []*CollectionItem, id string) (*CollectionItem, *[]*CollectionItem, int) {
	for i, item := range items {
		if item.ID == id {
			return item, &items, i
		}
		if item.Type == ItemTypeFolder && item.Children != nil {
			if found, parent, idx := findItemAndParent(item.Children, id); found != nil {
				return found, parent, idx
			}
		}
	}
	return nil, nil, -1
}

func findItem(items []*CollectionItem, id string) *CollectionItem {
	item, _, _ := findItemAndParent(items, id)
	return item
}

// CreateFolder creates a new folder in a collection
func (s *CollectionService) CreateFolder(collectionID, parentID, name string) (*CollectionItem, error) {
	path, ok := s.openCollections[collectionID]
	if !ok {
		return nil, errors.New("collection not open")
	}

	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	folder := &CollectionItem{
		ID:        uuid.New().String(),
		Name:      name,
		Type:      ItemTypeFolder,
		Children:  []*CollectionItem{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	if parentID == "" {
		col.Items = append(col.Items, folder)
	} else {
		parent := findItem(col.Items, parentID)
		if parent == nil || parent.Type != ItemTypeFolder {
			return nil, errors.New("parent folder not found")
		}
		parent.Children = append(parent.Children, folder)
	}

	if err := s.saveCollectionToPath(col, path); err != nil {
		return nil, err
	}

	return folder, nil
}

// CreateRequest creates a new request in a collection
func (s *CollectionService) CreateRequest(collectionID, parentID, name string) (*CollectionItem, error) {
	path, ok := s.openCollections[collectionID]
	if !ok {
		return nil, errors.New("collection not open")
	}

	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	request := &CollectionItem{
		ID:   uuid.New().String(),
		Name: name,
		Type: ItemTypeRequest,
		Request: &RequestData{
			Method:  "GET",
			URL:     "",
			Headers: []KeyValuePair{},
			Params:  []KeyValuePair{},
			Body:    "",
		},
		CreatedAt: now,
		UpdatedAt: now,
	}

	if parentID == "" {
		col.Items = append(col.Items, request)
	} else {
		parent := findItem(col.Items, parentID)
		if parent == nil || parent.Type != ItemTypeFolder {
			return nil, errors.New("parent folder not found")
		}
		parent.Children = append(parent.Children, request)
	}

	if err := s.saveCollectionToPath(col, path); err != nil {
		return nil, err
	}

	return request, nil
}

// UpdateItem updates an item's name or request data
func (s *CollectionService) UpdateItem(collectionID, itemID, name string, request *RequestData) (*CollectionItem, error) {
	path, ok := s.openCollections[collectionID]
	if !ok {
		return nil, errors.New("collection not open")
	}

	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return nil, err
	}

	item := findItem(col.Items, itemID)
	if item == nil {
		return nil, errors.New("item not found")
	}

	if name != "" {
		item.Name = name
	}
	if request != nil && item.Type == ItemTypeRequest {
		item.Request = request
	}
	item.UpdatedAt = time.Now()

	if err := s.saveCollectionToPath(col, path); err != nil {
		return nil, err
	}

	return item, nil
}

// DeleteItem deletes an item from a collection
func (s *CollectionService) DeleteItem(collectionID, itemID string) error {
	path, ok := s.openCollections[collectionID]
	if !ok {
		return errors.New("collection not open")
	}

	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return err
	}

	// Try to find and remove from root
	for i, item := range col.Items {
		if item.ID == itemID {
			col.Items = append(col.Items[:i], col.Items[i+1:]...)
			return s.saveCollectionToPath(col, path)
		}
	}

	// Try to find in nested folders
	var removeFromParent func(items []*CollectionItem) bool
	removeFromParent = func(items []*CollectionItem) bool {
		for _, item := range items {
			if item.Type != ItemTypeFolder || item.Children == nil {
				continue
			}
			for i, child := range item.Children {
				if child.ID == itemID {
					item.Children = append(item.Children[:i], item.Children[i+1:]...)
					return true
				}
			}
			if removeFromParent(item.Children) {
				return true
			}
		}
		return false
	}

	if removeFromParent(col.Items) {
		return s.saveCollectionToPath(col, path)
	}

	return errors.New("item not found")
}

// MoveItem moves an item to a new parent
func (s *CollectionService) MoveItem(collectionID, itemID, newParentID string) error {
	path, ok := s.openCollections[collectionID]
	if !ok {
		return errors.New("collection not open")
	}

	col, err := s.loadCollectionFromPath(path)
	if err != nil {
		return err
	}

	item, parentList, idx := findItemAndParent(col.Items, itemID)
	if item == nil {
		return errors.New("item not found")
	}

	*parentList = append((*parentList)[:idx], (*parentList)[idx+1:]...)

	if newParentID == "" {
		col.Items = append(col.Items, item)
	} else {
		newParent := findItem(col.Items, newParentID)
		if newParent == nil || newParent.Type != ItemTypeFolder {
			return errors.New("new parent folder not found")
		}
		newParent.Children = append(newParent.Children, item)
	}

	return s.saveCollectionToPath(col, path)
}