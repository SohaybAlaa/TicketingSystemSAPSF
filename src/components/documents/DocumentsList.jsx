import React from "react";
import { AgGridReact } from "ag-grid-react";

/**
 * DocumentsList - A component for displaying documents in a table/list layout using AgGrid
 * 
 * @param {Object} props
 * @param {Array} props.documents - Array of document objects to display
 * @param {Array} props.columnDefs - Column definitions for AgGrid
 * @param {Object} props.defaultColDef - Default column properties for AgGrid
 * @param {boolean} props.isRTL - Whether to use RTL layout
 * @param {string} props.theme - Theme for AgGrid
 * @param {string} [props.className="mt-6"] - Additional CSS classes
 * @param {number} [props.height=600] - Height of the grid in pixels
 * @param {number} [props.rowHeight=70] - Height of each row in pixels
 * @param {number} [props.pageSize=10] - Number of rows per page
 * @returns {JSX.Element}
 */
const DocumentsList = ({ 
  documents, 
  columnDefs, 
  defaultColDef,
  isRTL,
  theme,
  className = "mt-6",
  height = 600,
  rowHeight = 70,
  pageSize = 10
}) => {
  return (
    <div
      style={{ height, width: "100%" }}
      className={`${className} ${isRTL ? "ag-rtl" : ""}`}
    >
      <AgGridReact
        key={isRTL ? "rtl" : "ltr"}
        getRowStyle={() => ({ cursor: "pointer" })}
        theme={theme}
        rowData={documents}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowHeight={rowHeight}
        animateRows
        pagination
        paginationPageSize={pageSize}
        paginationPageSizeSelector={[10, 25, 50, 100]}
        domLayout="autoHeight"
        enableRtl={isRTL}
      />
    </div>
  );
};

export default DocumentsList;
