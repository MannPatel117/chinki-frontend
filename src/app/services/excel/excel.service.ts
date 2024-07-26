import { Injectable } from '@angular/core';
import { utils, writeFileXLSX } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }


  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const ws = utils.json_to_sheet(json);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, excelFileName+".xlsx");
  }

  public exportAsPdfFile(json: any[], pdfFileName: string): void {
    const doc = new jsPDF();
    const tableData = json.map(item => [
      item.product,
      item.quantity,
      item.lowWarning,
      item.supplierName
    ]);

    autoTable(doc, {
      head: [['Product', 'Quantity', 'Low Warning', 'Supplier Name']],
      body: tableData
    });

    doc.save(pdfFileName + '.pdf');
  }
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';