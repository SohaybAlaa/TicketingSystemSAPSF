import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Download,
  Trash2,
  Search,
  Grid,
  List,
  File,
  FileText,
  FolderOpen,
  Files,
  ChevronDown,
} from "lucide-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { myTheme } from "../../../../utils/agGridThemes";
import { AgGridReact } from "ag-grid-react";
import AlertNotification from "../../../../components/ui/AlertNotification";
import DeleteConfirmModal from "../../../../components/modals/DeleteConfirmModal";
ModuleRegistry.registerModules([AllCommunityModule]); // Register AG Grid community modules for table functionality

const documentsService = {
  // API SERVICE List / Upload / Delete / Download

  async fetchDocuments() {
    const response = await fetch("/api/public/shared/list?listType=document");
    if (!response.ok) throw new Error("Failed to fetch documents");
    const data = await response.json();
    // Transform the response to match expected format
    return (data.files || []).map((file) => ({
      id: file.id,
      filename: file.filename,
      name: file.name,
      size: file.sizeFormatted,
      uploadedAt: file.uploadedAtFormatted,
      type: file.type,
    }));
  },
  async uploadDocument(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = reader.result.split(",")[1];
          const response = await fetch("/api/public/shared/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              content: base64Content,
              uploadType: "document",
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Upload failed");
          }

          // The shared API returns { success: true, file: {...} }
          // We need to transform it to match the expected format
          const uploadedFile = data.file;
          const transformedDoc = {
            id: uploadedFile.id,
            name: uploadedFile.name,
            filename: uploadedFile.filename,
            size: uploadedFile.sizeFormatted, // Use formatted size
            uploadedAt: new Date(uploadedFile.uploadedAt)
              .toISOString()
              .split("T")[0], // Format date as YYYY-MM-DD
            type: uploadedFile.type,
          };
          resolve(transformedDoc);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },
  async deleteDocument(filename) {
    const response = await fetch(
      `/api/public/documents/delete?filename=${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Delete failed");
  },
  async downloadDocument(doc) {
    const response = await fetch(
      `/api/public/shared/download?filename=${encodeURIComponent(
        doc.filename
      )}&downloadType=document`
    );
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob(); // Convert response to blob (binary data)
    const url = window.URL.createObjectURL(blob); // Create temporary URL for the blob
    const a = document.createElement("a"); // Create temporary anchor element for download
    a.href = url;
    a.download = doc.filename; // Suggest filename for download
    a.click(); // Trigger download
    window.URL.revokeObjectURL(url); // Clean up: revoke the temporary URL to free memory
  },
};

const FileIcon = ({ type }) => {
  const colors = {
    pdf: "text-red-500",
    doc: "text-blue-500",
    docx: "text-blue-500",
    txt: "text-gray-500",
  };
  return <FileText className={`w-8 h-8 ${colors[type] || "text-gray-400"}`} />; // Return FileText icon with appropriate color, default to gray if type not found
};

const getCardBorderClass = (type) => {
  switch (type) {
    case "pdf":
      return "border-gray-200 hover:border-red-400";
    case "doc":
    case "docx":
      return "border-gray-200 hover:border-blue-400";
    case "txt":
      return "border-gray-200 hover:border-gray-400";
    default:
      return "border-gray-200 hover:border-yellow-400";
  }
};

const Documents = () => {
  const [documents, setDocuments] = useState([]); // All documents fetched from server
  const [searchQuery, setSearchQuery] = useState(""); // Search input value (searchBar) (filters by filename or upload date)
  const [filterType, setFilterType] = useState("all"); // Filter dropdown value (all, pdf, doc, docx, txt)
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  const [alerts, setAlerts] = useState([]); // Alert notifications array (success/error messages)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, doc: null }); // Delete confirmation modal state
  const [isUploading, setIsUploading] = useState(false); // Upload in progress state (disables upload button)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("documentsViewMode") || "grid"; // Persisted in localStorage default value is grid
  }); // View mode: "grid" or "list" (table view)

  // Persist view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("documentsViewMode", viewMode);
  }, [viewMode]);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Uses useMemo to avoid recalculating on every render
  const filteredDocs = useMemo(() => {
    let filtered = documents;
    // Filter by type if not "all"
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.type === filterType);
    }
    // Filter by search query (filename or upload date)
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.uploadedAt.includes(searchQuery)
      );
    }
    return filtered;
  }, [documents, searchQuery, filterType]); // Recalculate when these change

  // Load all documents from API
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await documentsService.fetchDocuments();
      setDocuments(docs);
    } catch (error) {
      showAlert("error", "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  // show an alert notification with auto dismisses after 4s
  const showAlert = (type, message) => {
    const id = Date.now() + Math.random(); // Unique ID for alert
    const newAlert = { id, type, message }; // type: success or error - message for display
    setAlerts((prev) => [...prev, newAlert]);
    setTimeout(() => removeAlert(id), 4000);
  };

  // Remove an alert by ID
  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Handle file upload from input
  // Validates file types and uploads each file
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Only allow these file types
    const validTypes = ["pdf", "doc", "docx", "txt"];

    // Process each file
    for (const file of files) {
      // Extract file extension (e.g., "pdf" from "document.pdf")
      const fileType = file.name.split(".").pop().toLowerCase();

      // Validate file type
      if (!validTypes.includes(fileType)) {
        showAlert("error", `Invalid file type: ${file.name}`);
        continue; // Skip this file, process next one
      }

      setIsUploading(true);
      try {
        // Upload file and get back document object
        const newDoc = await documentsService.uploadDocument(file);

        // Add new document to beginning of array (most recent first)
        setDocuments((prev) => [newDoc, ...prev]);

        showAlert("success", `Successfully uploaded: ${file.name}`);
      } catch (error) {
        // Show error message from server (e.g., duplicate file error)
        showAlert("error", error.message || `Failed to upload: ${file.name}`);
      } finally {
        setIsUploading(false);
      }
    }
    // Reset file input so same file can be uploaded again (It will already be blocked by upload.js due to the same name)
    e.target.value = "";
  };

  // Handle document deletion
  // Called when user confirms deletion in modal
  const handleDelete = async () => {
    const { doc } = deleteModal;
    try {
      // Delete from server
      await documentsService.deleteDocument(doc.filename);

      // Remove from local state
      setDocuments((prev) => prev.filter((d) => d.filename !== doc.filename));

      showAlert("success", `Deleted: ${doc.filename}`);
    } catch (error) {
      showAlert("error", "Failed to delete document");
    }

    // Close modal
    setDeleteModal({ isOpen: false, doc: null });
  };

  // Handle document download
  const handleDownload = async (doc) => {
    try {
      await documentsService.downloadDocument(doc);
      showAlert("success", `Downloaded: ${doc.filename}`);
    } catch (error) {
      showAlert("error", "Failed to download document");
    }
  };

  // Ag Grid Configuration
  // Column definitions for AG Grid table view
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Document", // Column header text
        field: "filename", // Data field to display
        tooltipField: "filename", // Show tooltip on hover
        flex: 2, // Takes 2x space compared to other columns
        cellRenderer: (params) => (
          // Custom cell renderer for document name with icon
          <div className="flex items-center gap-3 h-full">
            <FileIcon type={params.data.type} />
            <div>
              <div className="font-medium text-gray-900">
                {params.data.filename}
              </div>
              {/* maybe use it later if we will remove .extension */}
              {/* <div className="text-sm text-gray-500 uppercase">
                {params.data.type}
              // </div> */}
            </div>
          </div>
        ),
        cellStyle: { display: "flex", alignItems: "center" }, // Vertically center content
      },
      {
        headerName: "Uploaded",
        field: "uploadedAt",
        flex: 1, // Takes 1x space
        cellStyle: { display: "flex", alignItems: "center" },
      },
      {
        headerName: "Size",
        field: "size",
        flex: 1,
        cellStyle: { display: "flex", alignItems: "center" },
      },
      {
        headerName: "Actions",
        field: "actions",
        flex: 1,
        cellRenderer: (params) => (
          // Custom cell renderer for action buttons
          <div className="flex items-center justify-end gap-2 h-full">
            {/* Download button */}
            <button
              onClick={() => handleDownload(params.data)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
              title="Download"
              type="button"
            >
              <Download className="w-5 h-5" />
            </button>
            {/* Delete button */}
            <button
              onClick={() => setDeleteModal({ isOpen: true, doc: params.data })}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete"
              type="button"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ),
        cellStyle: { display: "flex", alignItems: "center" },
      },
    ],
    [] // No dependencies, columns don't change
  );

  // Default column configuration for AG Grid
  const defaultColDef = useMemo(
    () => ({
      sortable: true, // Enable sorting on all columns
      filter: true, // Enable filtering on all columns
      resizable: true, // Enable column resizing
    }),
    []
  );

  const isSearching = searchQuery.trim().length > 0 || filterType !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Alert notifications (top of screen) */}
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      {/* Delete confirmation modal pop up*/}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, doc: null })}
        onConfirm={handleDelete}
        type="document"
        itemName={deleteModal.doc?.filename}
      />

      {/* Main content container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                HR Policy Documents
              </h1>
              <p className="text-gray-600">
                Manage the HR documents that Fahim uses to respond to employee
                questions.
              </p>
            </div>

            {/* Upload button */}
            <label className="relative cursor-pointer w-full sm:w-auto">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl lg:self-start">
                {isUploading ? "Uploading..." : "Upload Documents"}
                <Upload className="w-5 h-5" />
              </div>
            </label>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Documents Card */}
            <div
              onClick={() => setFilterType("all")}
              className={`bg-white p-5 rounded-lg shadow-sm border-2 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${
                filterType === "all"
                  ? "border-yellow-400"
                  : "border-gray-200 hover:border-yellow-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg text-gray-600 font-medium mb-1">
                    Total Documents
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {documents.length}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <Files className="w-7 h-7 text-gray-700" />
                </div>
              </div>
            </div>

            {/* PDF Files Card */}
            <div
              onClick={() => setFilterType("pdf")}
              className={`bg-white p-5 rounded-lg shadow-sm border-2 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${
                filterType === "pdf"
                  ? "border-red-400"
                  : "border-gray-200 hover:border-red-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg text-gray-600 font-medium mb-1">
                    PDF Files
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {documents.filter((d) => d.type === "pdf").length}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <File className="w-7 h-7 text-red-600" />
                </div>
              </div>
            </div>

            {/* Word Documents Card */}
            <div
              onClick={() => setFilterType("docx")}
              className={`bg-white p-5 rounded-lg shadow-sm border-2 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${
                filterType === "doc" || filterType === "docx"
                  ? "border-blue-400"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg text-gray-600 font-medium mb-1">
                    Word Documents
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {
                      documents.filter(
                        (d) => d.type === "doc" || d.type === "docx"
                      ).length
                    }
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Text Files Card */}
            <div
              onClick={() => setFilterType("txt")}
              className={`bg-white p-5 rounded-lg shadow-sm border-2 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${
                filterType === "txt"
                  ? "border-gray-400"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg text-gray-600 font-medium mb-1">
                    Text Files
                  </div>
                  <div className="text-3xl font-bold text-gray-600">
                    {documents.filter((d) => d.type === "txt").length}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH AND FILTER CONTROLS */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by File Name or Upload Date (YYYY-MM-DD)..."
                  autoFocus={true}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-yellow-400 rounded-lg focus:ring-3 focus:ring-yellow-400 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-2">
                {/* File type filter dropdown */}
                <div className="relative inline-flex">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="cursor-pointer appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-500"
                  >
                    <option value="all">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="docx">DOCX</option>
                    <option value="txt">TXT</option>
                  </select>
                  {/* Dropdown chevron icon */}
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>

                {/* View mode toggle (list/grid) */}
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    type="button"
                    className={`p-2 rounded cursor-pointer ${
                      viewMode === "list"
                        ? "bg-yellow-200 shadow-sm"
                        : "hover:bg-yellow-100"
                    }`}
                  >
                    <List className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    type="button"
                    className={`p-2 rounded cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-yellow-200 shadow-sm"
                        : "hover:bg-yellow-100"
                    }`}
                  >
                    <Grid className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DOCUMENTS DISPLAY */}
        {isLoading ? (
          // Loading spinner
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          // Empty state (no documents match filters)
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documents found
            </h3>
            {isSearching ? (
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            ) : (
              <p className="text-gray-600">
                No documents uploaded yet. Upload a document to get started.
              </p>
            )}
          </div>
        ) : viewMode === "list" ? (
          // List view (AG Grid table)
          <div style={{ height: 600, width: "100%" }}>
            <AgGridReact
              getRowStyle={() => ({ cursor: "pointer" })}
              theme={myTheme}
              rowData={filteredDocs}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={70}
              animateRows // Smooth row animations
              pagination // Enable pagination
              paginationPageSize={10} // Default page size
              paginationPageSizeSelector={[10, 25, 50, 100]} // Page size options
              domLayout="autoHeight"
            />
          </div>
        ) : (
          // Grid view (cards)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all duration-300
                               hover:shadow-lg hover:scale-105 transition-all duration-300
                               ${getCardBorderClass(doc.type)}
                               `}
              >
                {/* Card header with icon and action buttons */}
                <div className="flex items-start justify-between mb-4">
                  <FileIcon type={doc.type} />
                  <div className="flex gap-2">
                    {/* Download button */}
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 cursor-pointer text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      type="button"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, doc })}
                      className="p-1.5 text-red-600 cursor-pointer hover:bg-red-50 rounded-full transition-colors"
                      type="button"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                {/* Document filename (truncated with ellipsis if too long) */}
                <h3
                  className="font-semibold text-gray-900 mb-2 truncate"
                  title={doc.filename}
                >
                  {doc.filename}
                </h3>
                {/* Document metadata (size and upload date) */}
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{doc.size}</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
