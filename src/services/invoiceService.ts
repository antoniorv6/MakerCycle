import type { InvoiceFormData } from '@/types';
import type { CompanyData } from '@/hooks/useCompanySettings';

export class InvoiceService {
  static async generatePDF(data: InvoiceFormData, companyData: CompanyData, currencySymbol: string = '€'): Promise<void> {
    try {
      
      // Por ahora, vamos a crear un HTML que se pueda convertir a PDF
      const htmlContent = this.generateInvoiceHTML(data, companyData, currencySymbol);
      
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

  private static generateInvoiceHTML(data: InvoiceFormData, companyData: CompanyData, currencySymbol: string = '€'): string {
    try {
      
      const formatCurrency = (value: number | undefined) => {
        
        // Convert to number if it's a string
        let numericValue: number;
        if (typeof value === 'string') {
          numericValue = parseFloat(value);
        } else {
          numericValue = value as number;
        }
        
        if (value === undefined || value === null || isNaN(numericValue) || typeof numericValue !== 'number') {
          return `${currencySymbol}0.00`;
        }
        
        try {
          return `${currencySymbol}${numericValue.toFixed(2)}`;
        } catch (error) {
          return `${currencySymbol}0.00`;
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
            padding: 20px;
            color: #000000;
            line-height: 1.4;
            background-color: #ffffff;
            font-size: 12px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            border-bottom: 2px solid #000000;
            padding: 20px 0;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .header-left h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.025em;
            color: #000000;
          }
          
          .header-left p {
            margin: 4px 0 0 0;
            font-size: 14px;
            font-weight: 400;
            color: #666666;
          }
          
          .invoice-number {
            font-weight: 600;
            font-size: 14px;
            color: #000000;
          }
          
          .content {
            padding: 0;
          }
          
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          
          .company-info, .client-info {
            padding: 0;
          }
          
          .section-title {
            font-weight: 600;
            color: #000000;
            margin-bottom: 8px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 1px solid #000000;
            padding-bottom: 4px;
          }
          
          .company-info p, .client-info p {
            margin: 3px 0;
            font-size: 12px;
            line-height: 1.3;
            color: #000000;
          }
          
          .company-info strong {
            color: #000000;
            font-weight: 600;
          }
          
          .date-info {
            display: flex;
            gap: 40px;
            margin-bottom: 20px;
            padding: 10px 0;
            border-top: 1px solid #cccccc;
            border-bottom: 1px solid #cccccc;
          }
          
          .date-item {
            flex: 1;
          }
          
          .date-label {
            font-size: 10px;
            color: #666666;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 600;
            margin-bottom: 2px;
          }
          
          .date-value {
            font-size: 12px;
            color: #000000;
            font-weight: 500;
          }
          
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .services-table th {
            background: #ffffff;
            color: #000000;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 10px;
            padding: 12px 8px;
            text-align: left;
            border-bottom: 2px solid #000000;
            border-top: 1px solid #000000;
          }
          
          .services-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #cccccc;
            color: #000000;
            font-size: 12px;
          }
          
          .services-table tr:last-child td {
            border-bottom: 2px solid #000000;
          }
          
          .total-row {
            font-weight: 700;
            background: #ffffff;
            color: #000000;
            font-size: 13px;
          }
          
          .total-row td {
            color: #000000 !important;
            padding: 12px 8px;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
          }
          
          .notes {
            margin-top: 20px;
            padding: 15px 0;
            border-top: 1px solid #cccccc;
          }
          
          .notes .section-title {
            color: #000000;
            border-bottom-color: #000000;
            margin-bottom: 8px;
          }
          
          .notes p {
            margin: 0;
            font-size: 11px;
            color: #000000;
            line-height: 1.4;
          }
          
          .footer {
            margin-top: 30px;
            padding: 15px 0;
            border-top: 1px solid #cccccc;
            text-align: center;
          }
          
          .footer p {
            margin: 2px 0;
            font-size: 10px;
            color: #666666;
            line-height: 1.3;
          }
          
          @media print {
            body {
              padding: 0;
              background: white;
            }
            
            .container {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <h1>ALBARÁN</h1>
              <p>${companyData.description || 'Servicios de Impresión 3D'}</p>
            </div>
            <div class="invoice-number">${data.invoiceNumber || 'ALB-001'}</div>
          </div>

          <div class="content">
            <div class="invoice-info">
              <div class="company-info">
                <div class="section-title">EMPRESA</div>
                <p><strong>${companyData.name || 'MakerCycle'}</strong></p>
                <p>${companyData.description || 'Servicios de Impresión 3D'}</p>
                ${companyData.address ? `<p>${companyData.address}</p>` : ''}
                <p>Email: ${companyData.email || 'info@makercycle.com'}</p>
                <p>Tel: ${companyData.phone || '+34 XXX XXX XXX'}</p>
                ${companyData.website ? `<p>Web: ${companyData.website}</p>` : ''}
                ${companyData.taxId ? `<p>CIF: ${companyData.taxId}</p>` : ''}
              </div>
              <div class="client-info">
                <div class="section-title">CLIENTE</div>
                <p><strong>${data.clientName || 'Cliente'}</strong></p>
                <p>${(data.clientAddress || '').replace(/\n/g, '<br>')}</p>
                ${data.clientPhone ? `<p>Tel: ${data.clientPhone}</p>` : ''}
                ${data.clientEmail ? `<p>Email: ${data.clientEmail}</p>` : ''}
              </div>
            </div>

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

            <table class="services-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
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

            ${data.notes ? `
            <div class="notes">
              <div class="section-title">NOTAS</div>
              <p>${(data.notes || '').replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            <div class="footer">
              <p>${companyData.terms || 'Este documento es un albarán de entrega de servicios de impresión 3D.'}</p>
              <p>${companyData.footer || 'Gracias por confiar en nuestros servicios.'}</p>
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