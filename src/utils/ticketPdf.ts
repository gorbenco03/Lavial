import * as Print from 'expo-print';
import { StoredTicket } from './storage';

export const generateTicketHTML = (ticket: StoredTicket): string => {
  const formattedDate = new Date(ticket.date).toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate QR code using online API for PDF
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qrData)}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f6f7fb;
            padding: 40px 20px;
            color: #0f172a;
          }
          .ticket-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .ticket-header {
            background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .ticket-header h1 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 10px;
          }
          .ticket-header .route {
            font-size: 20px;
            opacity: 0.95;
          }
          .ticket-body {
            padding: 30px;
          }
          .details-section {
            margin-bottom: 25px;
          }
          .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-size: 15px;
            color: #1f2937;
          }
          .detail-row strong {
            color: #0f172a;
            font-weight: 700;
            margin-right: 8px;
          }
          .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 30px;
            background: #f9fafb;
            border-radius: 12px;
            border: 2px solid #e5e7eb;
          }
          .qr-section h3 {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
          }
          .qr-section p {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 20px;
          }
          .qr-code {
            margin: 20px 0;
          }
          .qr-code img {
            width: 240px;
            height: 240px;
            border: 3px solid #fff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .qr-data {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #64748b;
            background: white;
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            word-break: break-all;
          }
          .price-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-top: 2px solid #e5e7eb;
            margin-top: 20px;
          }
          .price-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 600;
          }
          .price-value {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
          }
          .footer {
            padding: 20px 30px;
            background: #f9fafb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <h1>BILET AUTOBUZ</h1>
            <div class="route">${ticket.from} → ${ticket.to}</div>
          </div>
          <div class="ticket-body">
            <div class="details-section">
              <div class="detail-row">
                <strong>Data:</strong> ${formattedDate}
              </div>
              <div class="detail-row">
                <strong>Plecare:</strong> ${ticket.departureTime}
              </div>
              <div class="detail-row">
                <strong>Sosire:</strong> ${ticket.arrivalTime}
              </div>
              ${ticket.passengerName ? `
              <div class="detail-row">
                <strong>Pasager:</strong> ${ticket.passengerName}
              </div>
              ` : ''}
            </div>
            <div class="qr-section">
              <h3>Cod QR Bilet</h3>
              <p>Scanează acest cod pentru a valida biletul tău</p>
              <div class="qr-code">
                <img src="${qrCodeUrl}" alt="QR Code" />
              </div>
              <div class="qr-data">${ticket.qrData}</div>
            </div>
            <div class="price-section">
              <span class="price-label">Total Plătit</span>
              <span class="price-value">${ticket.price.toFixed(2)} ${ticket.currency || 'RON'}</span>
            </div>
          </div>
          <div class="footer">
            Păstrează acest bilet accesibil. Poți fi întrebat să îl prezinți înainte de îmbarcare.
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateTicketPDF = async (ticket: StoredTicket): Promise<string> => {
  const html = generateTicketHTML(ticket);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });
  return uri;
};

