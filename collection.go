package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

// ItemType represents the type of item in a collection
type ItemType string

const (
	ItemTypeFolder ItemType = "folder"
	ItemTypeRequest ItemType = "request"
)

// KeyValuePair represents a key-value pair for headers, params, etc.
type KeyValuePair struct {
	Key string `json:"key"`
	Value string `json:"value"`
	Enabled bool `json:"enabled"`
}

// RequestData holds the actual request configuration
type RequestData struct {
	Method string `json:"method"`
	URL string `json:"url"`
	Headers []KeyValuePair `json:"headers"`
	Params []KeyValuePair `json:"params"`
	Body string `json:"body"`
}

// CollectionItem represents either a folder or a request in the collection tree
type CollectionItem struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Type ItemType `json:"type"`
	Children []*CollectionItem `json:"children,omitempty"` // Only for folders
	Request *RequestData `json:"request,omitempty"` // Only for requests
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Collection represents a top-level collection
type Collection struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Items []*CollectionItem `json:"items"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// CollectionService handles collection operations
type CollectionService struct {
	dataDir string
}

// NewCollectionService creates a new collection service
func NewCollectionService() *CollectionService {
	homeDir, _ := os.UserHomeDir()
	dataDir := filepath.Join(homeDir, ".campfire", "collections")
	return &CollectionService{dataDir: dataDir}
}

// ensureDataDir creates the data directory if it doesn't exist
func (s *CollectionService) ensureDataDir() error {
	return os.MkdirAll(s.dataDir, 0755)
}

// collectionPath returns the file path for a collection
func (s *CollectionService) collectionPath(id string) string {
	return filepath.Join(s.dataDir, id+".json")
}

// GetAllCollections returns all collections (metadata only, not full tree)
func (s *CollectionService) GetAllCollections() ([]Collection, error) {
	if err := s.ensureDataDir(); err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(s.dataDir)
	if err != nil {
		return nil, err
	}

	var collections []Collection
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		col, err := s.loadCollection(filepath.Join(s.dataDir, entry.Name()))
		if err != nil {
			continue // Skip invalid files
		}
		collections = append(collections, *col)
	}

	return collections, nil
}

// GetCollection returns a single collection by ID
func (s *CollectionService) GetCollection(id string) (*Collection, error) {
	return s.loadCollection(s.collectionPath(id))
}

// loadCollection loads a collection from a file
func (s *CollectionService) loadCollection(path string) (*Collection, error) {
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

// saveCollection saves a collection to disk
func (s *CollectionService) saveCollection(col *Collection) error {
	if err := s.ensureDataDir(); err != nil {
		return err
	}

	col.UpdatedAt = time.Now()
	data, err := json.MarshalIndent(col, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.collectionPath(col.ID), data, 0644)
}

// CreateCollection creates a new collection
func (s *CollectionService) CreateCollection(name string) (*Collection, error) {
	now := time.Now()
	col := &Collection{
		ID: uuid.New().String(),
		Name: name,
		Items: []*CollectionItem{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.saveCollection(col); err != nil {
		return nil, err
	}

	return col, nil
}

// UpdateCollection updates a collections name
func (s *CollectionService) UpdateCollection(id, name string) (*Collection, error) {
	col, err := s.GetCollection(id)
	if err != nil {
		return nil, err
	}

	col.Name = name
	if err := s.saveCollection(col); err != nil {
		return nil, err
	}

	return col, nil
}

// DeleteCollection delets a collection
func (s *CollectionService) DeleteCollection(id string) error {
	return os.Remove(s.collectionPath(id))
}

// findItemAndParent recursively finds an item and its parent list by ID
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

// findItem recursively finds an item by ID
func findItem(items []*CollectionItem, id string) *CollectionItem {
	item, _, _ := findItemAndParent(items, id)
	return item
}

// CreateFolder creates a new folder in a collection
func (s *CollectionService) CreateFolder(collectionID, parentID, name string) (*CollectionItem, error) {
	col, err := s.GetCollection(collectionID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	folder := &CollectionItem{
		ID: uuid.New().String(),
		Name: name,
		Type: ItemTypeFolder,
		Children: []*CollectionItem{},
		CreatedAt: now,
		UpdatedAt: now,
	}

	if parentID == "" {
		// Add to root
		col.Items = append(col.Items, folder)
	} else {
		// Find parent folder
		parent := findItem(col.Items, parentID)
		if parent == nil || parent.Type != ItemTypeFolder {
			return nil, errors.New("parent folder not found")
		}
		parent.Children = append(parent.Children, folder)
	}

	if err := s.saveCollection(col); err != nil {
		return nil, err
	}

	return folder, nil
}

// CreateRequest creates a new request in a collection
func (s *CollectionService) CreateRequest(collectionID, parentID, name string) (*CollectionItem, error) {
	col, err := s.GetCollection(collectionID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	request := &CollectionItem{
		ID: uuid.New().String(),
		Name: name,
		Type: ItemTypeRequest,
		Request: &RequestData{
			Method: "GET",
			URL: "",
			Headers: []KeyValuePair{},
			Params: []KeyValuePair{},
			Body: "",
		},
		CreatedAt: now,
		UpdatedAt: now,
	}

	if parentID == "" {
		// Add to root
		col.Items = append(col.Items, request)
	} else {
		// Find parent folder
		parent := findItem(col.Items, parentID)
		if parent == nil || parent.Type != ItemTypeFolder {
			return nil, errors.New("parent folder not found")
		}
		parent.Children = append(parent.Children, request)
	}

	if err := s.saveCollection(col); err != nil {
		return nil, err
	}

	return request, nil
}

// UpdateItem updates an items' name or request data
func (s *CollectionService) UpdateItem(collectionID, itemID, name string, request *RequestData) (*CollectionItem, error) {
	col, err := s.GetCollection(collectionID)
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

	if err := s.saveCollection(col); err != nil {
		return nil, err
	}

	return item, nil
}

// DeleteItem deletes an item from a collection
func (s *CollectionService) DeleteItem(collectionID, itemID string) error {
	col, err := s.GetCollection(collectionID)
	if err != nil {
		return err
	}

	// Try to find and remove from root
	for i, item := range col.Items {
		if item.ID == itemID {
			col.Items = append(col.Items[:i], col.Items[i+1:]...)
			return s.saveCollection(col)
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
		return s.saveCollection(col)
	}

	return errors.New("item not found")
}

// MoveItem moves an item to a new parent
func (s *CollectionService) MoveItem(collectionID, itemID, newParentID string) error {
	col, err := s.GetCollection(collectionID)
	if err != nil {
		return err
	}

	// Find and remove item from current location
	item, parentList, idx := findItemAndParent(col.Items, itemID)
	if item == nil {
		return errors.New("item not found")
	}

	// Remove from current location
	*parentList = append((*parentList)[:idx], (*parentList)[idx+1:]...)

	// Add to new location
	if newParentID == "" {
		col.Items = append(col.Items, item)
	} else {
		newParent := findItem(col.Items, newParentID)
		if newParent == nil || newParent.Type != ItemTypeFolder {
			return errors.New("new parent folder not found")
		}
		newParent.Children = append(newParent.Children, item)
	}

	return s.saveCollection(col)
}