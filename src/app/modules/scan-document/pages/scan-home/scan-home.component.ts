import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-scan-home',
  standalone: false,
  templateUrl: './scan-home.component.html',
  styleUrl: './scan-home.component.css'
})
export class ScanHomeComponent implements OnInit {

      scannedImages: string[] = [];
      isScanning = false;
      errorMessage: string | null = null;
      isSaving = false;
      private readonly baseUrl = `${environment.apiUrl}scanning`;

      uploadedDocuments: any[] = [];
      isLoadingDocs = false;
    

      constructor(){}
      ngOnInit(): void {
        this.loadUploadedDocuments();
      }

      /** Common method to open Flutter scanner and get Base64 image data */
  private async openScanner(): Promise<string[]> {
    try {
      const result = await (window as any).flutter_inappwebview?.callHandler('StartDocument');
      console.log('📄 Scanner result:', result);

      if (result && Array.isArray(result) && result.length > 0) {
        return result.map((base64: string) => `data:image/jpeg;base64,${base64}`);
      } else if (result?.error) {
        this.errorMessage = result.error;
      } else {
        this.errorMessage = 'Cannot perform this operation';
      }
    } catch (error) {
      console.error('Error calling Flutter handler:', error);
      this.errorMessage = 'Error while scanning document. Please try again.';
    }
    return [];
  }

  /** Scan new document (replace existing) */
  async startDocumentScan() {
    this.errorMessage = null;
    this.isScanning = true;
    try {
      const newImages = await this.openScanner();
      this.scannedImages = newImages;
    } finally {
      this.isScanning = false;
    }
  }

  /** Add more scans */
  async addMoreScans() {
    this.errorMessage = null;
    this.isScanning = true;
    try {
      const newImages = await this.openScanner();
      this.scannedImages = [...this.scannedImages, ...newImages];
    } finally {
      this.isScanning = false;
    }
  }

  deleteImage(index: number) {
    this.scannedImages.splice(index, 1);
  }

  clearAll() {
    this.scannedImages = [];
  }

  /** Save all scanned images into a single PDF */
  async saveScannedFile() {
    if (this.scannedImages.length === 0) {
      alert('No scanned images to save.');
      return;
    }

    const fileName = prompt('Enter a file name (without extension):', 'ScannedDocument');
    if (!fileName) return;

    this.isSaving = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < this.scannedImages.length; i++) {
        const img = this.scannedImages[i];
        const imgProps = pdf.getImageProperties(img);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        if (i < this.scannedImages.length - 1) pdf.addPage();
      }

      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, `${fileName}.pdf`);

      console.log('📦 PDF ready to upload:', formData.get('file'));

      // TODO: Replace with real backend call later
      await this.uploadToBackendDemo(formData);

      alert('✅ PDF file created and sent to backend successfully!');
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF.');
    } finally {
      this.isSaving = false;
    }
  }

  /** Placeholder backend call */
  async uploadToBackendDemo(formData: FormData) {
    try {
      const response = await fetch(`${this.baseUrl}/upload/document`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
  
      const data = await response.json();
      this.loadUploadedDocuments();
  
      alert('✅ PDF file uploaded to MongoDB successfully!');
    } catch (error) {
      console.error('Error uploading to backend:', error);
      alert('Upload failed. Please check your connection or backend logs.');
    }
  }

  async loadUploadedDocuments() {
    this.isLoadingDocs = true;
    try {
      const response = await fetch(`${this.baseUrl}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      // console.log('uploaded documents', data.documents);
      this.uploadedDocuments = data.documents??  [];
      console.log('Documents fetched:', this.uploadedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      this.isLoadingDocs = false;
    }
  }

  /** Open PDF in new tab */
  async viewDocument(id: string) {
    const pdfUrl = `${this.baseUrl}/document/${id}`;
    if ((window as any).flutter_inappwebview) {
      (window as any).flutter_inappwebview.callHandler('OpenPDF', pdfUrl);
    } else {
      // Fallback for web browser
      window.open(pdfUrl, '_blank');
    }
  }


}
