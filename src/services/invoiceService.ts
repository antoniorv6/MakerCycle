import type { InvoiceFormData } from '@/types';
import type { CompanyData } from '@/hooks/useCompanySettings';

export class InvoiceService {
  static async generatePDF(data: InvoiceFormData, companyData: CompanyData): Promise<void> {
    try {
      console.log('InvoiceService received company data:', companyData);
      console.log('InvoiceService received invoice data:', data);
      console.log('Invoice items:', data.items);
      
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
    try {
      console.log('generateInvoiceHTML called with data:', data);
      console.log('Items:', data.items);
      
      const formatCurrency = (value: number | undefined) => {
        console.log('formatCurrency called with value:', value, typeof value);
        
        // Convert to number if it's a string
        let numericValue: number;
        if (typeof value === 'string') {
          numericValue = parseFloat(value);
        } else {
          numericValue = value as number;
        }
        
        if (value === undefined || value === null || isNaN(numericValue) || typeof numericValue !== 'number') {
          console.log('formatCurrency returning default for invalid value');
          return '€0.00';
        }
        
        try {
          return `€${numericValue.toFixed(2)}`;
        } catch (error) {
          console.log('Error in toFixed, returning default');
          return '€0.00';
        }
      };
      const formatDate = (dateString: string) => {
        try {
          return new Date(dateString).toLocaleDateString('es-ES');
        } catch (error) {
          return new Date().toLocaleDateString('es-ES');
        }
      };

      return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Albarán ${data.invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
            background-color: #ffffff;
            font-size: 14px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: -0.025em;
            position: relative;
            z-index: 1;
          }
          
          .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            font-weight: 400;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px;
          }
          
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          
          .company-info, .client-info {
            background: #f8fafc;
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          
          .section-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 16px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
          }
          
          .company-info p, .client-info p {
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .company-info strong {
            color: #1f2937;
            font-weight: 600;
          }
          
          .invoice-details {
            margin-bottom: 40px;
          }
          
          .invoice-details table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }
          
          .invoice-details th, .invoice-details td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .invoice-details th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .invoice-details td {
            color: #6b7280;
            font-size: 14px;
          }
          
          .services-table {
            margin-top: 24px;
          }
          
          .services-table th {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 12px;
          }
          
          .services-table td {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
          }
          
          .services-table tr:hover {
            background-color: #f9fafb;
          }
          
          .total-row {
            font-weight: 700;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            font-size: 16px;
          }
          
          .total-row td {
            color: white !important;
          }
          
          .notes {
            margin-top: 40px;
            padding: 24px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          
          .notes .section-title {
            color: #92400e;
            border-bottom-color: #f59e0b;
          }
          
          .footer {
            margin-top: 40px;
            padding: 24px;
            background: #f8fafc;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          
          .footer p {
            margin: 8px 0;
            font-size: 12px;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .invoice-number {
            background: #3b82f6;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
            display: inline-block;
            margin-top: 16px;
          }
          
          .date-info {
            display: flex;
            gap: 24px;
            margin-top: 16px;
          }
          
          .date-item {
            flex: 1;
            text-align: center;
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          
          .date-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .date-value {
            font-size: 14px;
            color: #374151;
            font-weight: 600;
          }
          
          @media print {
            body {
              padding: 0;
              background: white;
            }
            
            .container {
              box-shadow: none;
              border-radius: 0;
            }
            
            .header {
              background: #3b82f6 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .total-row {
              background: #10b981 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .services-table th {
              background: #3b82f6 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ALBARÁN</h1>
            <p>${companyData.description || 'Servicios de Impresión 3D'}</p>
            <div class="invoice-number">${data.invoiceNumber || 'ALB-001'}</div>
          </div>

          <div class="content">
            <div class="invoice-info">
              <div class="company-info">
                <div class="section-title">DATOS DE LA EMPRESA</div>
                <p><strong>${companyData.name || '3DCraftFlow'}</strong></p>
                <p>${companyData.description || 'Servicios de Impresión 3D'}</p>
                ${companyData.address ? `<p>${companyData.address}</p>` : ''}
                <p>Email: ${companyData.email || 'info@3dcraftflow.com'}</p>
                <p>Teléfono: ${companyData.phone || '+34 XXX XXX XXX'}</p>
                ${companyData.website ? `<p>Web: ${companyData.website}</p>` : ''}
                ${companyData.taxId ? `<p>CIF/NIF: ${companyData.taxId}</p>` : ''}
              </div>
              <div class="client-info">
                <div class="section-title">DATOS DEL CLIENTE</div>
                <p><strong>${data.clientName || 'Cliente'}</strong></p>
                <p>${(data.clientAddress || '').replace(/\n/g, '<br>')}</p>
                ${data.clientPhone ? `<p>Teléfono: ${data.clientPhone}</p>` : ''}
                ${data.clientEmail ? `<p>Email: ${data.clientEmail}</p>` : ''}
              </div>
            </div>

            <div class="invoice-details">
              <div class="section-title">INFORMACIÓN DEL ALBARÁN</div>
              <div class="date-info">
                <div class="date-item">
                  <div class="date-label">Fecha de Emisión</div>
                  <div class="date-value">${data.issueDate ? formatDate(data.issueDate) : new Date().toLocaleDateString('es-ES')}</div>
                </div>
                ${data.deliveryDate ? `
                <div class="date-item">
                  <div class="date-label">Fecha de Entrega</div>
                  <div class="date-value">${formatDate(data.deliveryDate)}</div>
                </div>
                ` : ''}
              </div>
            </div>

            <div class="invoice-details">
              <div class="section-title">DETALLES DE LOS SERVICIOS</div>
              <table class="services-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${(data.items || []).map(item => {
                    if (!item) return '';
                    
                    const unitPrice = item.unitPrice || 0;
                    const quantity = item.quantity || 0;
                    const total = unitPrice * quantity;
                    
                    return `
                    <tr>
                      <td>${item.description || ''}</td>
                      <td>${quantity}</td>
                      <td>${formatCurrency(unitPrice)}</td>
                      <td>${formatCurrency(total)}</td>
                    </tr>
                  `;
                  }).join('')}
                  <tr class="total-row">
                    <td colspan="3"><strong>TOTAL</strong></td>
                    <td><strong>${formatCurrency(data.totalPrice || 0)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${data.notes ? `
            <div class="notes">
              <div class="section-title">NOTAS ADICIONALES</div>
              <p>${(data.notes || '').replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            <div class="footer">
              <p>${companyData.terms || 'Este documento es un albarán de entrega de servicios de impresión 3D. Para cualquier consulta, contacte con nosotros.'}</p>
              <p>${companyData.footer || 'Gracias por confiar en nuestros servicios de impresión 3D.'}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    } catch (error) {
      console.error('Error generating invoice HTML:', error);
      throw error;
    }
  }
} 