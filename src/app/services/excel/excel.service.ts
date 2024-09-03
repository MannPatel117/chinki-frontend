import { Injectable } from '@angular/core';
import { utils, writeFileXLSX } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }


  public exportAsExcelFile(json: any[], excelFileName: string, heading: string): void {
    if (!json || json.length === 0) {
      console.error("The provided JSON data is empty or undefined.");
      return; // Early return if there's no data to process
    }
  
    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
  
    // Define column headers from JSON keys
    const headers = Object.keys(json[0]);
    
    // Set columns with headers and initial width
    worksheet.columns = headers.map(header => ({ header, key: header, width: 15 }));
  
    // Merge and format the first row as heading
    worksheet.mergeCells(1, 1, 1, headers.length); // Merge the first row across all columns
    const titleCell = worksheet.getCell('A1');
    titleCell.value = heading;
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }; // Center the text
    titleCell.font = { bold: true, size: 14 }; // Optional: make the heading bold
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '22d3ee' } // Skyblue color
    };
  
    // Add headers in the second row
    const headerRow = worksheet.getRow(2);
    headerRow.values = headers;
  
    // Style for the header row
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  
    // Add the JSON data to the worksheet
    json.forEach((data) => {
      const row = worksheet.addRow(Object.values(data)); // Adds each object as a new row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    // Check if worksheet.columns is defined
    if (worksheet.columns) {
      // Adjust column widths based on the longest content in each column
      worksheet.columns.forEach((column: Partial<ExcelJS.Column>) => {
        if (column && column.eachCell) { // Ensure the column is defined and eachCell is available
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const cellLength = cell.value ? cell.value.toString().length : 10;
            if (cellLength > maxLength) {
              maxLength = cellLength;
            }
          });
          column.width = maxLength + 2; // Adding some padding
        }
      });
    } else {
      console.error("Worksheet columns are undefined.");
    }
  
    // Write to a buffer and save the file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `${excelFileName}.xlsx`);
    }).catch(error => {
      console.error("Error writing excel file buffer:", error);
    });
  }

  public exportAsPdfFile(json: any[], pdfFileName: string, heading:any): void {
    
    if (!json || json.length === 0) {
      console.error("The provided JSON data is empty or undefined.");
      return; // Early return if there's no data to process
    }
  
    // Initialize jsPDF document in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    // Add custom heading on top
    doc.setFontSize(16); // Set font size for the heading
    doc.setFont('helvetica', 'bold'); // Set font style for the heading
    const pageWidth = doc.internal.pageSize.getWidth(); // Get page width
    const textWidth = doc.getTextWidth(heading); // Get text width for centering
    doc.text(heading, (pageWidth - textWidth) / 2, 15); // Center the heading text horizontally and set Y position to 15
  
    // Dynamically get headers from JSON keys
    const displayHeaders = Object.keys(json[0]).map(key => key.charAt(0).toUpperCase() + key.slice(1)); // Capitalize header names
    const headers = Object.keys(json[0]);
    // Map the JSON data to match the headers
    const tableData = json.map(item => headers.map(header => item[header]));
    // Generate the PDF table with autoTable
    autoTable(doc, {
      startY: 25, // Set start position of the table on the Y-axis, adjust to position table below heading
      head: [displayHeaders],
      body: tableData,
      theme: 'grid', // Optional: Set theme for table styling
      headStyles: {
        fillColor: [135, 206, 235], // Optional: Skyblue color for header background
        textColor: [0, 0, 0], // Optional: Black text color
        fontStyle: 'bold', // Optional: Bold font style for header
      },
      styles: {
        overflow: 'linebreak', // Optional: Handle overflow in cells
        cellWidth: 'wrap', // Optional: Wrap text in cells
      },
    });
  
    // Save the generated PDF
    doc.save(pdfFileName + '.pdf');
  }
}
