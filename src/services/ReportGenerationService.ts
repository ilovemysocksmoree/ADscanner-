import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// @ts-ignore
// import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { format as dateFormat } from 'date-fns';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel } from 'docx';

export interface ReportData {
  id: string;
  date: string;
  type: string;
  target: string;
  findings: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    solution: string;
    cvss?: number;
    references?: string[];
  }>;
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    totalCount: number;
  };
  scanInfo: {
    startTime: string;
    endTime: string;
    scannerVersion: string;
    targetHost: string;
    scanType: string;
  };
}

class ReportGenerationService {
  private generateExecutiveSummary(data: ReportData): string {
    return `
Executive Summary
----------------
Scan Date: ${dateFormat(new Date(data.date), 'PPpp')}
Target: ${data.target}
Total Findings: ${data.summary.totalCount}

Risk Summary:
- Critical: ${data.summary.criticalCount}
- High: ${data.summary.highCount}
- Medium: ${data.summary.mediumCount}
- Low: ${data.summary.lowCount}

Scanner Version: ${data.scanInfo.scannerVersion}
Scan Duration: ${dateFormat(new Date(data.scanInfo.startTime), 'PPpp')} to ${dateFormat(new Date(data.scanInfo.endTime), 'PPpp')}
    `;
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      critical: '#7030A0',
      high: '#FF0000',
      medium: '#FFC000',
      low: '#00B050',
    };
    return colors[severity] || '#000000';
  }

  async generatePDFReport(data: ReportData): Promise<Blob> {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Security Assessment Report', 20, 20);
    
    // Report Header
    doc.setFontSize(12);
    doc.text(`Site: https://<site of the app>`, 20, 30);
    doc.text(`Generated on: ${dateFormat(new Date(), 'PPpp')}`, 20, 40);
    
    // Executive Summary
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, 50);
    doc.setFontSize(12);
    
    const summary = [
      ['Scan Date', dateFormat(new Date(data.date), 'PPpp')],
      ['Target', data.target],
      ['Total Findings', data.summary.totalCount.toString()]
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: summary,
      theme: 'grid',
    });
    
    // Summary of Alerts
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Summary of Alerts', 20, 20);
    
    const alertSummary = [
      ['Risk Level', 'Number of Alerts'],
      ['High', '0'],
      ['Medium', '3'],
      ['Low', '4'],
      ['Informational', '3']
    ];
    
    autoTable(doc, {
      startY: 30,
      head: [['Risk Level', 'Number of Alerts']],
      body: alertSummary,
      theme: 'grid',
    });
    
    // Detailed Alerts
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Alerts', 20, 20);
    
    const alertDetails = [
      ['Name', 'Risk Level', 'Number of Instances'],
      ['Content Security Policy (CSP) Header Not Set', 'Medium', '56'],
      ['Cross-Domain Misconfiguration', 'Medium', '69'],
      ['Hidden File Found', 'Medium', '4'],
      ['Cross-Domain JavaScript Source File Inclusion', 'Low', '96'],
      ['Server Leaks Version Information via "Server" HTTP Response Header Field', 'Low', '71'],
      ['Strict-Transport-Security Header Not Set', 'Low', '71'],
      ['Timestamp Disclosure - Unix', 'Low', '1'],
      ['Information Disclosure - Suspicious Comments', 'Informational', '2'],
      ['Modern Web Application', 'Informational', '49'],
      ['Re-examine Cache-control Directives', 'Informational', '19']
    ];
    
    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Risk Level', 'Number of Instances']],
      body: alertDetails,
      theme: 'grid',
    });
    
    // Alert Detail Example
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Alert Detail', 20, 20);
    doc.setFontSize(12);
    doc.text('Medium Content Security Policy (CSP) Header Not Set', 20, 30);
    doc.text('Description:', 20, 40);
    doc.text('Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.', 20, 50, { maxWidth: 170 });
    doc.text('URL: https://app8.amazingvault.link/', 20, 90);
    doc.text('Method: GET', 20, 100);
    
    return doc.output('blob');
  }

  async generateWordReport(data: ReportData): Promise<Blob> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'Security Assessment Report',
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: 'Executive Summary',
            heading: HeadingLevel.HEADING_1,
          }),
          ...this.generateWordExecutiveSummary(data),
          new Paragraph({
            text: 'Detailed Findings',
            heading: HeadingLevel.HEADING_1,
          }),
          ...this.generateWordFindings(data),
        ],
      }],
    });

    return await Packer.toBlob(doc);
  }

  private generateWordExecutiveSummary(data: ReportData): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({ text: 'Scan Date: ', bold: true }),
          new TextRun(dateFormat(new Date(data.date), 'PPpp')),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Target: ', bold: true }),
          new TextRun(data.target),
        ],
      }),
      // Add more summary paragraphs...
    ];
  }

  private generateWordFindings(data: ReportData): Paragraph[] {
    const findings: Paragraph[] = [];
    
    data.findings.forEach(finding => {
      findings.push(
        new Paragraph({
          text: finding.title,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Severity: ', bold: true }),
            new TextRun({ 
              text: finding.severity.toUpperCase(),
              color: this.getSeverityColor(finding.severity),
            }),
          ],
        }),
        // Add more finding details...
      );
    });
    
    return findings;
  }

  generateCSVReport(data: ReportData): string {
    const headers = ['Severity', 'Title', 'Description', 'Solution', 'CVSS', 'References'];
    const rows = data.findings.map(finding => [
      finding.severity,
      finding.title,
      finding.description,
      finding.solution,
      finding.cvss || '',
      (finding.references || []).join('; '),
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }

  generateJSONReport(data: ReportData): string {
    return JSON.stringify(data, null, 2);
  }

  async exportReport(data: ReportData, format: 'pdf' | 'doc' | 'csv' | 'json'): Promise<void> {
    const timestamp = dateFormat(new Date(), 'yyyy-MM-dd-HHmmss');
    const filename = `security-report-${timestamp}`;

    try {
      switch (format) {
        case 'pdf': {
          const blob = await this.generatePDFReport(data);
          saveAs(blob, `${filename}.pdf`);
          break;
        }
        case 'doc': {
          const blob = await this.generateWordReport(data);
          saveAs(blob, `${filename}.docx`);
          break;
        }
        case 'csv': {
          const csv = this.generateCSVReport(data);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          saveAs(blob, `${filename}.csv`);
          break;
        }
        case 'json': {
          const json = this.generateJSONReport(data);
          const blob = new Blob([json], { type: 'application/json' });
          saveAs(blob, `${filename}.json`);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error(`Failed to generate ${format.toUpperCase()} report`);
    }
  }
}

export const reportGenerationService = new ReportGenerationService(); 