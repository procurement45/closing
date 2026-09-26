import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { POItem } from '../types';

export const exportToExcel = (poList: POItem[], siteName: string) => {
  const exportDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const formattedData = poList.map((po, index) => ({
    '#': index + 1,
    'Nama Site': po.site_name,
    'Nomor PO': po.po_number,
    'Tanggal PO': po.po_date,
    'Vendor': po.vendor,
    'Deskripsi Item': po.item_description,
    'Total Amount (IDR)': po.total_amount,
    'Feedback': po.feedback,
    'Catatan': po.notes,
    'Status': po.status,
    'Last Updated': po.last_updated,
    'Export Date': exportDate,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // #
    { wch: 18 }, // Nama Site
    { wch: 18 }, // Nomor PO
    { wch: 12 }, // Tanggal PO
    { wch: 25 }, // Vendor
    { wch: 35 }, // Deskripsi
    { wch: 16 }, // Total Amount
    { wch: 22 }, // Feedback
    { wch: 30 }, // Catatan
    { wch: 10 }, // Status
    { wch: 18 }, // Last Updated
    { wch: 20 }, // Export Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PO_Open_Report');

  const fileName = `PO_Open_Report_${siteName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = (poList: POItem[], siteName: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const exportDate = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate summary metrics
  const totalPO = poList.length;
  const totalAmount = poList.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const formattedAmount = 'Rp ' + totalAmount.toLocaleString('id-ID');

  // Document Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('LAPORAN PURCHASE ORDER (PO) OPEN BULANAN', 40, 40);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Site: ${siteName}   |   Dicetak: ${exportDate}`, 40, 56);
  doc.text(`Total PO Open: ${totalPO} baris   |   Total Nilai PO: ${formattedAmount}`, 40, 70);

  // Table Data
  const tableHead = [
    [
      '#',
      'Site',
      'No. PO',
      'Tgl PO',
      'Vendor',
      'Deskripsi Item',
      'Total Amount (Rp)',
      'Feedback',
      'Catatan',
      'Status',
    ],
  ];

  const tableBody = poList.map((po, index) => [
    index + 1,
    po.site_name,
    po.po_number,
    po.po_date,
    po.vendor,
    po.item_description,
    (po.total_amount || 0).toLocaleString('id-ID'),
    po.feedback || '-',
    po.notes || '-',
    po.status,
  ]);

  autoTable(doc, {
    startY: 85,
    head: tableHead,
    body: tableBody,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      font: 'Courier',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      lineColor: [148, 163, 184],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 65 },
      2: { cellWidth: 85, fontStyle: 'bold' },
      3: { cellWidth: 55 },
      4: { cellWidth: 100 },
      5: { cellWidth: 140 },
      6: { cellWidth: 85, halign: 'right' },
      7: { cellWidth: 95 },
      8: { cellWidth: 90 },
      9: { cellWidth: 45, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40 },
  });

  const fileName = `PO_Open_Report_${siteName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};
