import type { InvoiceFormData } from '@/types';
import type { CompanyData } from '@/hooks/useCompanySettings';

export class InvoiceService {
  static async generatePDF(data: InvoiceFormData, companyData: CompanyData): Promise<void> {
    try {
      console.log('InvoiceService received company data:', companyData);
      // Por ahora, vamos a crear un HTML que se pueda convertir a PDF
      const htmlContent = this.generateInvoiceHTML(data, companyData);
      
      // Crear un elemento temporal para el HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Aquí necesitaríamos jsPDF y html2canvas para convertir a PDF
      // Por ahora, vamos a mostrar el HTML en una nueva ventana
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.print();
      }

      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private static generateInvoiceHTML(data: InvoiceFormData, companyData: CompanyData): string {
    const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Albarán ${data.invoiceNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .company-info, .client-info {
            flex: 1;
          }
          .company-info {
            margin-right: 40px;
          }
          .section-title {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .invoice-details {
            margin-bottom: 30px;
          }
          .invoice-details table {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-details th, .invoice-details td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .invoice-details th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
          }
          .notes {
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #2563eb;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .header {
              margin-bottom: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ALBARÁN</h1>
          <p>${companyData.description}</p>
        </div>

        <div class="invoice-info">
          <div class="company-info">
            <div class="section-title">DATOS DE LA EMPRESA</div>
            <p><strong>${companyData.name}</strong></p>
            <p>${companyData.description}</p>
            ${companyData.address ? `<p>${companyData.address}</p>` : ''}
            <p>Email: ${companyData.email}</p>
            <p>Teléfono: ${companyData.phone}</p>
            ${companyData.website ? `<p>Web: ${companyData.website}</p>` : ''}
            ${companyData.taxId ? `<p>CIF/NIF: ${companyData.taxId}</p>` : ''}
          </div>
          <div class="client-info">
            <div class="section-title">DATOS DEL CLIENTE</div>
            <p><strong>${data.clientName}</strong></p>
            <p>${data.clientAddress.replace(/\n/g, '<br>')}</p>
            ${data.clientPhone ? `<p>Teléfono: ${data.clientPhone}</p>` : ''}
            ${data.clientEmail ? `<p>Email: ${data.clientEmail}</p>` : ''}
          </div>
        </div>

        <div class="invoice-details">
          <div class="section-title">DETALLES DEL ALBARÁN</div>
          <table>
            <tr>
              <th>Número de Albarán</th>
              <td>${data.invoiceNumber}</td>
              <th>Fecha de Emisión</th>
              <td>${formatDate(data.issueDate)}</td>
            </tr>
            ${data.deliveryDate ? `
            <tr>
              <th>Fecha de Entrega</th>
              <td colspan="3">${formatDate(data.deliveryDate)}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div class="invoice-details">
          <div class="section-title">DETALLES DEL SERVICIO</div>
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${data.serviceDescription}</td>
                <td>${data.quantity}</td>
                <td>${formatCurrency(data.unitPrice)}</td>
                <td>${formatCurrency(data.totalPrice)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td><strong>${formatCurrency(data.totalPrice)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        ${data.notes ? `
        <div class="notes">
          <div class="section-title">NOTAS ADICIONALES</div>
          <p>${data.notes.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>${companyData.terms}</p>
          <p>${companyData.footer}</p>
        </div>
      </body>
      </html>
    `;
  }
} 