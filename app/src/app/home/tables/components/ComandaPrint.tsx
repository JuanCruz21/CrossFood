'use client';

import React from 'react';
import type { Comanda } from '@/types/product';

interface ComandaPrintProps {
  comanda: Comanda;
}

export function ComandaPrint({ comanda }: ComandaPrintProps) {
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white text-black p-6 font-mono text-sm max-w-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-2xl font-bold mb-2">
          {comanda.destino === 'cocina' ? '🍳 COCINA' : '🍹 BAR'}
        </h1>
        <p className="text-xs">COMANDA #{comanda.id.substring(0, 8).toUpperCase()}</p>
      </div>

      {/* Info de Mesa */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between text-base font-bold">
          <span>MESA:</span>
          <span className="text-2xl">{comanda.mesa_numero}</span>
        </div>
        {comanda.numero_comensales && (
          <div className="flex justify-between">
            <span>Comensales:</span>
            <span>{comanda.numero_comensales}</span>
          </div>
        )}
        {comanda.mesero && (
          <div className="flex justify-between">
            <span>Mesero:</span>
            <span>{comanda.mesero}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span>Fecha:</span>
          <span>{formatFecha(comanda.fecha_hora)}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-t-2 border-black pt-4 mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left pb-2">CANT</th>
              <th className="text-left pb-2">PRODUCTO</th>
            </tr>
          </thead>
          <tbody>
            {comanda.items.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="border-b border-dashed border-gray-400">
                  <td className="py-2 font-bold text-xl w-12">{item.cantidad}</td>
                  <td className="py-2">
                    <div className="font-bold">{item.producto}</div>
                    {item.modificadores && item.modificadores.length > 0 && (
                      <div className="text-xs mt-1 space-y-0.5">
                        {item.modificadores.map((mod, modIdx) => (
                          <div key={modIdx} className="ml-2">• {mod}</div>
                        ))}
                      </div>
                    )}
                    {item.notas && (
                      <div className="text-xs italic mt-1 bg-yellow-100 p-1 rounded">
                        ⚠️ NOTA: {item.notas}
                      </div>
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-black pt-4 text-center">
        <p className="text-xs">*** COMANDA DE {comanda.destino.toUpperCase()} ***</p>
        <p className="text-xs mt-2">Orden: {comanda.orden_id.substring(0, 8).toUpperCase()}</p>
      </div>
    </div>
  );
}

export function generarComandaHTML(comanda: Comanda): string {
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comanda ${comanda.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      padding: 10mm;
      background: white;
      color: black;
      font-size: 12px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid black;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .header p { font-size: 10px; }
    .info { margin-bottom: 10px; }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .info-row.mesa span:last-child {
      font-size: 20px;
      font-weight: bold;
    }
    .items {
      border-top: 2px solid black;
      padding-top: 10px;
      margin-bottom: 10px;
    }
    .items table { width: 100%; border-collapse: collapse; }
    .items th {
      text-align: left;
      border-bottom: 1px solid black;
      padding-bottom: 5px;
      margin-bottom: 5px;
    }
    .item-row {
      border-bottom: 1px dashed #999;
      padding: 8px 0;
    }
    .item-row td:first-child {
      font-weight: bold;
      font-size: 18px;
      width: 40px;
    }
    .modificadores {
      font-size: 10px;
      margin-top: 3px;
      margin-left: 10px;
    }
    .notas {
      font-size: 10px;
      font-style: italic;
      margin-top: 3px;
      background: #ffeb3b;
      padding: 3px;
      border-radius: 3px;
    }
    .footer {
      border-top: 2px solid black;
      padding-top: 10px;
      text-align: center;
      font-size: 10px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${comanda.destino === 'cocina' ? '🍳 COCINA' : '🍹 BAR'}</h1>
    <p>COMANDA #${comanda.id.substring(0, 8).toUpperCase()}</p>
  </div>

  <div class="info">
    <div class="info-row mesa">
      <span>MESA:</span>
      <span>${comanda.mesa_numero}</span>
    </div>
    ${comanda.numero_comensales ? `
    <div class="info-row">
      <span>Comensales:</span>
      <span>${comanda.numero_comensales}</span>
    </div>
    ` : ''}
    ${comanda.mesero ? `
    <div class="info-row">
      <span>Mesero:</span>
      <span>${comanda.mesero}</span>
    </div>
    ` : ''}
    <div class="info-row">
      <span>Fecha:</span>
      <span>${formatFecha(comanda.fecha_hora)}</span>
    </div>
  </div>

  <div class="items">
    <table>
      <thead>
        <tr>
          <th>CANT</th>
          <th>PRODUCTO</th>
        </tr>
      </thead>
      <tbody>
        ${comanda.items.map(item => `
          <tr class="item-row">
            <td>${item.cantidad}</td>
            <td>
              <div><strong>${item.producto}</strong></div>
              ${item.modificadores && item.modificadores.length > 0 ? `
                <div class="modificadores">
                  ${item.modificadores.map(mod => `• ${mod}`).join('<br>')}
                </div>
              ` : ''}
              ${item.notas ? `
                <div class="notas">⚠️ NOTA: ${item.notas}</div>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>*** COMANDA DE ${comanda.destino.toUpperCase()} ***</p>
    <p>Orden: ${comanda.orden_id.substring(0, 8).toUpperCase()}</p>
  </div>
</body>
</html>
  `;
}

// Función para imprimir la comanda
export function imprimirComanda(comanda: Comanda) {
  const html = generarComandaHTML(comanda);
  const ventana = window.open('', '_blank', 'width=300,height=600');
  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();
    ventana.onload = () => {
      ventana.print();
      // Opcionalmente cerrar después de imprimir
      // ventana.onafterprint = () => ventana.close();
    };
  }
}
