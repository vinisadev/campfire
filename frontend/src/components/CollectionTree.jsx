import { useState } from "react";
import "./CollectionTree.css";

// Tree item component for recursive rendering
function TreeItem({ item, depth = 0, onSelect, selectedId, onContextMenu }) {
  const [expanded, setExpanded] = useState(true);
  const isFolder = item.type === "folder";
  const isSelected = item.id === selectedId;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isFolder) {
      setExpanded(!expanded);
    } else {
      onSelect(item);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!isFolder) {
      onSelect(item);
    }
  };

  return (
    <div className="tree-item-wrapper">
      <div
        className={`tree-item ${isSelected ? "selected" : ""} ${
          isFolder ? "folder" : "request"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => onContextMenu(e, item)}
      >
        {isFolder && (
          <span className={`tree-chevron ${expanded ? "expanded" : ""}`}>
            ›
          </span>
        )}
        {!isFolder && <span className="tree-spacer" />}

        {isFolder ? (
          <span className="tree-icon folder-icon">
            {expanded ? "📂" : "📁"}
          </span>
        ) : (
          <span
            className={`tree-method ${
              item.request?.method?.toLowerCase() || "get"
            }`}
          >
            {item.request?.method || "GET"}
          </span>
        )}

        <span className="tree-name" title={item.name}>
          {item.name}
        </span>
      </div>

      {isFolder && expanded && item.children && (
        <div className="tree-children">
          {item.children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Collection component
function CollectionNode({
  collection,
  onSelect,
  selectedId,
  onContextMenu,
  onToggle,
  expanded,
}) {
  // Extract just the filename from the path for display
  const fileName = collection.filePath?.split("/").pop() || collection.name;
  return (
    <div className="collection-node">
      <div
        className="collection-header"
        onClick={() => onToggle(collection.id)}
        onContextMenu={(e) => onContextMenu(e, collection, true)}
        title={collection.filePath}
      >
        <span className={`tree-chevron ${expanded ? "expanded" : ""}`}>›</span>
        <span className="collection-icon">📦</span>
        <span className="collection-name">{collection.name}</span>
      </div>

      {collection.filePath && (
        <div className="collection-path" title={collection.filePath}>
          {collection.filePath}
        </div>
      )}

      {expanded && (
        <div className="collection-items">
          {collection.items &&
            collection.items.map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                depth={1}
                onSelect={onSelect}
                selectedId={selectedId}
                onContextMenu={onContextMenu}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// Context menu component
function ContextMenu({ x, y, items, onClose }) {
  return (
    <>
      <div className="context-menu-overlay" onClick={onClose} />
      <div className="context-menu" style={{ left: x, top: y }}>
        {items.map((item, index) =>
          item.separator ? (
            <div key={index} className="context-menu-separator" />
          ) : (
            <button
              key={index}
              className={`context-menu-item ${item.danger ? "danger" : ""}`}
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              {item.icon && (
                <span className="context-menu-icon">{item.icon}</span>
              )}
              {item.label}
            </button>
          )
        )}
      </div>
    </>
  );
}

// Main CollectionTree component
export default function CollectionTree({
  collections,
  onSelectRequest,
  selectedRequestId,
  onCreateCollection,
  onOpenCollection,
  onCloseCollection,
  onCreateFolder,
  onCreateRequest,
  onRenameItem,
  onDeleteItem,
  onDeleteCollection,
}) {
  const [expandedCollections, setExpandedCollections] = useState({});
  const [contextMenu, setContextMenu] = useState(null);

  const toggleCollection = (id) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleContextMenu = (e, item, isCollection = false) => {
    e.preventDefault();
    e.stopPropagation();

    let menuItems = [];

    if (isCollection) {
      menuItems = [
        {
          icon: "📄",
          label: "New Request",
          action: () => onCreateRequest(item.id, ""),
        },
        {
          icon: "📁",
          label: "New Folder",
          action: () => onCreateFolder(item.id, ""),
        },
        { separator: true },
        {
          icon: "✏️",
          label: "Rename",
          action: () => onRenameItem(item.id, "", item.name),
        },
        {
          separator: true,
        },
        {
          icon: "✕",
          label: "Close",
          action: () => onCloseCollection(item.id),
        },
        {
          icon: "🗑️",
          label: "Delete File",
          action: () => onDeleteCollection(item.id),
          danger: true,
        },
      ];
    } else if (item.type === "folder") {
      menuItems = [
        {
          icon: "📄",
          label: "New Request",
          action: () => onCreateRequest(item.collectionId, item.id),
        },
        {
          icon: "📁",
          label: "New Folder",
          action: () => onCreateFolder(item.collectionId, item.id),
        },
        { separator: true },
        {
          icon: "✏️",
          label: "Rename",
          action: () => onRenameItem(item.collectionId, item.id, item.name),
        },
        {
          icon: "🗑️",
          label: "Delete",
          action: () => onDeleteItem(item.collectionId, item.id),
        },
      ];
    } else {
      menuItems = [
        {
          icon: "✏️",
          label: "Rename",
          action: () => onRenameItem(item.collectionId, item.id, item.name),
        },
        { icon: "📋", label: "Duplicate", action: () => {} },
        { separator: true },
        {
          icon: "🗑️",
          label: "Delete",
          action: () => onDeleteItem(item.collectionId, item.id),
        },
      ];
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: menuItems,
    });
  };

  const handleBackgroundContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { icon: "📦", label: "New Collection", action: onCreateCollection },
        { icon: "📂", label: "Open Collection", action: onOpenCollection },
      ],
    });
  };

  // Attach collectionId to items for context menu actions
  const attachCollectionId = (items, collectionId) => {
    return items?.map((item) => ({
      ...item,
      collectionId,
      children: item.children
        ? attachCollectionId(item.children, collectionId)
        : undefined,
    }));
  };

  return (
    <div
      className="collection-tree"
      onContextMenu={handleBackgroundContextMenu}
    >
      {collections.length === 0 ? (
        <div className="empty-collections">
          <div className="empty-collections-icon">📦</div>
          <div className="empty-collections-text">No collections open</div>
          <div className="empty-collections-actions">
            <button
              className="create-collection-btn"
              onClick={onCreateCollection}
            >
              New Collection
            </button>
            <button
              className="create-collection-btn secondary"
              onClick={onOpenCollection}
            >
              Open Existing
            </button>
          </div>
        </div>
      ) : (
        collections.map((collection) => (
          <CollectionNode
            key={collection.id}
            collection={{
              ...collection,
              items: attachCollectionId(collection.items, collection.id),
            }}
            onSelect={onSelectRequest}
            selectedId={selectedRequestId}
            onContextMenu={handleContextMenu}
            onToggle={toggleCollection}
            expanded={expandedCollections[collection.id] !== false}
          />
        ))
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
