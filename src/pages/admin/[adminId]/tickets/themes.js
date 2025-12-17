// themes.js
import { themeQuartz, iconSetQuartzBold } from 'ag-grid-community';

export const myTheme = themeQuartz
  .withPart(iconSetQuartzBold)
  .withParams({
    accentColor: "#FDC700",
    borderColor: "#DEE2E6",
    borderRadius: 5,
    browserColorScheme: "light",
    cellTextColor: "#212529",
    columnBorder: false,
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen-Sans",
      "Ubuntu",
      "Cantarell",
      "Helvetica Neue",
      "sans-serif"
    ],
    fontSize: 15,
    foregroundColor: "#212529",
    headerBackgroundColor: "#343A40",
    headerFontFamily: ["Arial", "sans-serif"],
    headerFontSize: 16,
    headerFontWeight: 700,
    headerRowBorder: true,
    headerTextColor: "#FFFFFF",
    headerVerticalPaddingScale: 1,
    iconSize: 18,
    oddRowBackgroundColor: "#F8F9FA",
    rowBorder: true,
    spacing: 10,
    wrapperBorder: true,
    wrapperBorderRadius: 16
  });
