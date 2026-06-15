import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Download,
  Trash2,
  File,
  FileText,
  FolderOpen,
  Files,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import AdminLayout from "@layouts/AdminLayout";
import AlertNotification from "@ui/AlertNotification";
import DeleteConfirmModal from "@components/modals/DeleteConfirmModal";
import StatisticsCard from "@ui/StatisticsCard";
import StatisticsCardGrid from "@ui/StatisticsCardGrid";
import SearchFilterBar from "@ui/SearchFilterBar";
import DocumentsGrid from "@components/documents/DocumentsGrid";
import DocumentsList from "@components/documents/DocumentsList";
import EmptyState from "@ui/EmptyState";
import { myTheme } from "@utils/agGridThemes";
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
        cellRenderer: (params) => (
          <div style={{ 
            direction: "ltr", 
            width: "100%",
            textAlign: isRTL ? "right" : "left",
            display: "flex",
            justifyContent: isRTL ? "flex-end" : "flex-start"
          }}>
            {params.value}
          </div>
        ),
        cellStyle: { display: "flex", alignItems: "center" },
      },
      {
        headerName: t("documentsMenu.table.actions"),
        field: "actions",
        flex: 1,
        cellRenderer: (params) => (
          <div className="flex items-center gap-2 h-full justify-end">

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
    <AdminLayout
      title={t("documentsMenu.title")}
      subtitle={
        <>
          {t("documentsMenu.subtitle.part1")} <span className="text-yellow-500 text-lg font-bold">{t("documentsMenu.subtitle.name")}</span> {t("documentsMenu.subtitle.part2")}
        </>
      }
      headerActions={
        <label className="relative cursor-pointer w-full sm:w-auto">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <div className="action-button">
            <span>
              {isUploading
                ? t("documentsMenu.uploading")
                : t("documentsMenu.upload")}
            </span>
            <Upload className="w-5 h-5" />
          </div>
        </label>
      }
    >
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, doc: null })}
        onConfirm={handleDelete}
        type="document"
        itemName={deleteModal.doc?.filename}
      />

      {/* STATISTICS CARDS */}
      <StatisticsCardGrid>
        {/* Total Documents Card */}
        <StatisticsCard
          title={t("documentsMenu.stats.total")}
          value={documents.length}
          icon={Files}
          iconBoxColor="#eab308"
          hoverShadow="rgba(234,179,8,0.3)"
          isActive={filterType === "all"}
          onClick={() => setFilterType("all")}
          isRTL={isRTL}
        />
        
        {/* PDF Files Card */}
        <StatisticsCard
          title={t("documentsMenu.stats.pdf")}
          value={documents.filter((d) => d.type === "pdf").length}
          icon={File}
          iconBoxColor="#dc2626"
          hoverShadow="rgba(220,38,38,0.3)"
          isActive={filterType === "pdf"}
          onClick={() => setFilterType("pdf")}
          isRTL={isRTL}
        />
        
        {/* Word Documents Card */}
        <StatisticsCard
          title={t("documentsMenu.stats.word")}
          value={documents.filter((d) => d.type === "doc" || d.type === "docx").length}
          icon={FileText}
          iconBoxColor="#2563eb"
          hoverShadow="rgba(37,99,235,0.3)"
          isActive={filterType === "doc" || filterType === "docx"}
          onClick={() => setFilterType("docx")}
          isRTL={isRTL}
        />
        
        {/* Text Files Card */}
        <StatisticsCard
          title={t("documentsMenu.stats.text")}
          value={documents.filter((d) => d.type === "txt").length}
          icon={FileText}
          iconBoxColor="#4b5563"
          hoverShadow="rgba(75,85,99,0.3)"
          isActive={filterType === "txt"}
          onClick={() => setFilterType("txt")}
          isRTL={isRTL}
        />
      </StatisticsCardGrid>

      {/* SEARCH AND FILTER CONTROLS */}
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterOptions={[
          { value: "all", label: t("documentsMenu.filters.all") },
          { value: "pdf", label: "PDF" },
          { value: "doc", label: "DOC" },
          { value: "docx", label: "DOCX" },
          { value: "txt", label: "TXT" },
        ]}
        isRTL={isRTL}
        t={t}
      />

      {/* DOCUMENTS DISPLAY */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 mt-6">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <EmptyState
            icon={FolderOpen}
            title={t("documentsMenu.empty.title")}
            description={isSearching ? t("documentsMenu.empty.noResults") : t("documentsMenu.empty.noDocuments")}
            semiDescription={isSearching && searchQuery ? `"${searchQuery}"` : undefined}
          />
        </div>
      ) : viewMode === "list" ? (
        <DocumentsList
          documents={filteredDocs}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          isRTL={isRTL}
          theme={myTheme}
        />
      ) : (
        <DocumentsGrid
          documents={filteredDocs}
          onDownload={handleDownload}
          onDelete={(doc) => setDeleteModal({ isOpen: true, doc })}
          isRTL={isRTL}
          FileIcon={FileIcon}
          getCardBorderClass={getCardBorderClass}
        />
      )}
    </AdminLayout>
  );
};

export default Documents;
