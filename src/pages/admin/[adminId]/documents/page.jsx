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
import { useTranslation } from "react-i18next";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { myTheme } from "../../../../utils/agGridThemes";
import { AgGridReact } from "ag-grid-react";
import AlertNotification from "../../../../components/ui/AlertNotification";
import DeleteConfirmModal from "../../../../components/modals/DeleteConfirmModal";

ModuleRegistry.registerModules([AllCommunityModule]);

const documentsService = {
  async fetchDocuments() {
    const response = await fetch("/api/public/shared/list?listType=document");
    if (!response.ok) throw new Error("Failed to fetch documents");
    const data = await response.json();
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

          const uploadedFile = data.file;
          const transformedDoc = {
            id: uploadedFile.id,
            name: uploadedFile.name,
            filename: uploadedFile.filename,
            size: uploadedFile.sizeFormatted,
            uploadedAt: new Date(uploadedFile.uploadedAt)
              .toISOString()
              .split("T")[0],
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
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

const FileIcon = ({ type }) => {
  const colors = {
    pdf: "text-red-500",
    doc: "text-blue-500",
    docx: "text-blue-500",
    txt: "text-gray-500",
  };
  return <FileText className={`w-8 h-8 ${colors[type] || "text-gray-400"}`} />;
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, doc: null });
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("documentsViewMode") || "grid";
  });

  useEffect(() => {
    localStorage.setItem("documentsViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocs = useMemo(() => {
    let filtered = documents;
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.type === filterType);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          (doc.filename &&
            doc.filename.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (doc.uploadedAt && doc.uploadedAt.includes(searchQuery))
      );
    }
    return filtered;
  }, [documents, searchQuery, filterType]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await documentsService.fetchDocuments();
      setDocuments(docs);
    } catch (error) {
      showAlert("error", t("documentsMenu.alerts.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type, message) => {
    const id = Date.now() + Math.random();
    const newAlert = { id, type, message };
    setAlerts((prev) => [...prev, newAlert]);
    setTimeout(() => removeAlert(id), 4000);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validTypes = ["pdf", "doc", "docx", "txt"];

    for (const file of files) {
      const fileType = file.name.split(".").pop().toLowerCase();

      if (!validTypes.includes(fileType)) {
        showAlert(
          "error",
          `${t("documentsMenu.alerts.invalidType")}: ${file.name}`
        );
        continue;
      }

      setIsUploading(true);
      try {
        const newDoc = await documentsService.uploadDocument(file);
        setDocuments((prev) => [newDoc, ...prev]);
        showAlert(
          "success",
          `${t("documentsMenu.alerts.uploadSuccess")}: ${file.name}`
        );
      } catch (error) {
        showAlert(
          "error",
          error.message ||
            `${t("documentsMenu.alerts.uploadFailed")}: ${file.name}`
        );
      } finally {
        setIsUploading(false);
      }
    }
    e.target.value = "";
  };

  const handleDelete = async () => {
    const { doc } = deleteModal;
    try {
      await documentsService.deleteDocument(doc.filename);
      setDocuments((prev) => prev.filter((d) => d.filename !== doc.filename));
      showAlert(
        "success",
        `${t("documentsMenu.alerts.deleteSuccess")}: ${doc.filename}`
      );
    } catch (error) {
      showAlert("error", t("documentsMenu.alerts.deleteFailed"));
    }
    setDeleteModal({ isOpen: false, doc: null });
  };

  const handleDownload = async (doc) => {
    try {
      await documentsService.downloadDocument(doc);
      showAlert(
        "success",
        `${t("documentsMenu.alerts.downloadSuccess")}: ${doc.filename}`
      );
    } catch (error) {
      showAlert("error", t("documentsMenu.alerts.downloadFailed"));
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: t("documentsMenu.table.document"),
        field: "filename",
        tooltipField: "filename",
        flex: 2,
        cellRenderer: (params) => {
          if (isRTL) {
            return (
              <div
                className="flex items-center gap-3 h-full justify-start w-full"
                style={{ direction: "rtl" }}
              >
                <FileIcon type={params.data.type} />
                <div className="text-right">
                  <div className="font-semibold text-gray-900 tracking-wide">
                    {params.data.filename}
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-3 h-full w-full">
              <FileIcon type={params.data.type} />
              <div>
                <div className="font-semibold text-gray-900">
                  {params.data.filename}
                </div>
              </div>
            </div>
          );
        },
        cellStyle: { display: "flex", alignItems: "center" },
      },
      {
        headerName: t("documentsMenu.table.uploaded"),
        field: "uploadedAt",
        flex: 1,
        cellStyle: { display: "flex", alignItems: "center" },
      },
      {
        headerName: t("documentsMenu.table.size"),
        field: "size",
        flex: 1,
        cellStyle: { display: "flex", alignItems: "center" },
      },
      {
        headerName: t("documentsMenu.table.actions"),
        field: "actions",
        flex: 1,
        cellRenderer: (params) => (
          <div
            className={`flex items-center gap-2 h-full ${
              isRTL ? "justify-end" : "justify-end"
            }`}
          >
            {isRTL ? (
              <>
                <button
                  onClick={() =>
                    setDeleteModal({ isOpen: true, doc: params.data })
                  }
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t("documentsMenu.actions.delete")}
                  type="button"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownload(params.data)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                  title={t("documentsMenu.actions.download")}
                  type="button"
                >
                  <Download className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleDownload(params.data)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                  title={t("documentsMenu.actions.download")}
                  type="button"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({ isOpen: true, doc: params.data })
                  }
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t("documentsMenu.actions.delete")}
                  type="button"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        ),
        cellStyle: { display: "flex", alignItems: "center" },
      },
    ],
    [t, isRTL]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const isSearching = searchQuery.trim().length > 0 || filterType !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, doc: null })}
        onConfirm={handleDelete}
        type="document"
        itemName={deleteModal.doc?.filename}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className={isRTL ? "text-right" : ""}>
              <h1
                className={`text-3xl font-bold text-gray-900 mb-2 ${
                  isRTL ? "tracking-wide" : ""
                }`}
              >
                {t("documentsMenu.title")}
              </h1>
              <p
                className={`text-gray-600 ${
                  isRTL ? "leading-relaxed tracking-wide" : ""
                }`}
              >
                {t("documentsMenu.subtitle")}
              </p>
            </div>

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
                <span className={isRTL ? "tracking-wide" : ""}>
                  {isUploading
                    ? t("documentsMenu.uploading")
                    : t("documentsMenu.upload")}
                </span>
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
                <div className={isRTL ? "text-right" : ""}>
                  <div
                    className={`text-lg text-gray-600 font-semibold mb-1 ${
                      isRTL ? "tracking-wide" : ""
                    }`}
                  >
                    {t("documentsMenu.stats.total")}
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
                <div className={isRTL ? "text-right" : ""}>
                  <div
                    className={`text-lg text-gray-600 font-semibold mb-1 ${
                      isRTL ? "tracking-wide" : ""
                    }`}
                  >
                    {t("documentsMenu.stats.pdf")}
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
                <div className={isRTL ? "text-right" : ""}>
                  <div
                    className={`text-lg text-gray-600 font-semibold mb-1 ${
                      isRTL ? "tracking-wide" : ""
                    }`}
                  >
                    {t("documentsMenu.stats.word")}
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
                <div className={isRTL ? "text-right" : ""}>
                  <div
                    className={`text-lg text-gray-600 font-semibold mb-1 ${
                      isRTL ? "tracking-wide" : ""
                    }`}
                  >
                    {t("documentsMenu.stats.text")}
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
              <div className={`flex-1 relative ${isRTL ? "text-right" : ""}`}>
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${
                    isRTL ? "right-3" : "left-3"
                  }`}
                />
                <input
                  type="text"
                  placeholder={t("documentsMenu.search")}
                  autoFocus={true}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-2 border border-yellow-400 rounded-lg focus:ring-3 focus:ring-yellow-400 focus:border-transparent outline-none ${
                    isRTL ? "pr-10 pl-4 tracking-wide" : "pl-10 pr-4"
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <div className="relative inline-flex">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`cursor-pointer appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-500 ${
                      isRTL
                        ? "pl-10 pr-4 tracking-wide font-semibold"
                        : "pr-10 pl-4"
                    }`}
                  >
                    <option value="all">
                      {t("documentsMenu.filters.all")}
                    </option>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="docx">DOCX</option>
                    <option value="txt">TXT</option>
                  </select>
                  <ChevronDown
                    className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 ${
                      isRTL ? "left-3" : "right-3"
                    }`}
                  />
                </div>

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
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3
              className={`text-lg font-bold text-gray-900 mb-2 ${
                isRTL ? "tracking-wide" : ""
              }`}
            >
              {t("documentsMenu.empty.title")}
            </h3>
            {isSearching ? (
              <p
                className={`text-gray-600 ${
                  isRTL ? "leading-relaxed tracking-wide" : ""
                }`}
              >
                {t("documentsMenu.empty.noResults")}
              </p>
            ) : (
              <p
                className={`text-gray-600 ${
                  isRTL ? "leading-relaxed tracking-wide" : ""
                }`}
              >
                {t("documentsMenu.empty.noDocuments")}
              </p>
            )}
          </div>
        ) : viewMode === "list" ? (
          <div
            style={{ height: 600, width: "100%" }}
            className={isRTL ? "ag-rtl" : ""}
          >
            <AgGridReact
              key={isRTL ? "rtl" : "ltr"}
              getRowStyle={() => ({ cursor: "pointer" })}
              theme={myTheme}
              rowData={filteredDocs}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={70}
              animateRows
              pagination
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              domLayout="autoHeight"
              enableRtl={isRTL}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all duration-300
                               hover:shadow-lg hover:scale-105 transition-all duration-300
                               ${getCardBorderClass(doc.type)}
                               `}
              >
                <div
                  className={`flex items-start justify-between mb-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  {isRTL ? (
                    <>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 cursor-pointer text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          type="button"
                        >
                          <Download className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, doc })}
                          className="p-1.5 text-red-600 cursor-pointer hover:bg-red-50 rounded-full transition-colors"
                          type="button"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                      <FileIcon type={doc.type} />
                    </>
                  ) : (
                    <>
                      <FileIcon type={doc.type} />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 cursor-pointer text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          type="button"
                        >
                          <Download className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, doc })}
                          className="p-1.5 text-red-600 cursor-pointer hover:bg-red-50 rounded-full transition-colors"
                          type="button"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <h3
                  className={`font-bold text-gray-900 mb-2 truncate ${
                    isRTL ? "text-right tracking-wide" : ""
                  }`}
                  title={doc.filename}
                >
                  {doc.filename}
                </h3>
                <div
                  className={`space-y-1 text-sm text-gray-600 ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`flex justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="font-medium">{doc.size}</span>
                    <span className="font-medium">{doc.uploadedAt}</span>
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
