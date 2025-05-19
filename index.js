const venom = require('venom-bot');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./credentials.json'); // archivo de clave JSON

const SHEET_ID = 'TU_ID_DE_GOOGLE_SHEET';
const doc = new GoogleSpreadsheet(SHEET_ID);
let sheet;

async function accederSheet() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow();
}

venom
  .create({ session: 'gastos-bot' })
  .then((client) => start(client))
  .catch((error) => console.log(error));

function start(client) {
  accederSheet().then(() => {
    client.onMessage(async (message) => {
      if (message.isGroupMsg === false) {
        const texto = message.body.toLowerCase();

        const match = texto.match(/^([a-záéíóúñ\s]+)\s+(\d+)$/i);
        if (match) {
          const categoria = match[1];
          const monto = parseInt(match[2]);
          const fecha = new Date().toISOString();
          await sheet.addRow({ fecha, categoria, monto });
          await client.sendText(message.from, `Registrado: ${categoria} - $${monto}`);
        }

        else if (texto === 'total hoy') {
          const hoy = new Date().toISOString().split('T')[0];
          const rows = await sheet.getRows();
          const total = rows
            .filter(r => r.fecha.startsWith(hoy))
            .reduce((acc, r) => acc + Number(r.monto), 0);
          await client.sendText(message.from, `Total de hoy: $${total}`);
        }

        else if (texto === 'resumen semana') {
          const rows = await sheet.getRows();
          const now = new Date();
          const semana = rows.filter(r => {
            const fecha = new Date(r.fecha);
            const diff = (now - fecha) / (1000 * 60 * 60 * 24);
            return diff <= 7;
          });
          const total = semana.reduce((acc, r) => acc + Number(r.monto), 0);
          await client.sendText(message.from, `Gastos últimos 7 días: $${total}`);
        }

        else if (texto === 'resumen mes') {
          const rows = await sheet.getRows();
          const ahora = new Date();
          const mesActual = ahora.getMonth();
          const anioActual = ahora.getFullYear();
          const total = rows
            .filter(r => {
              const fecha = new Date(r.fecha);
              return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
            })
            .reduce((acc, r) => acc + Number(r.monto), 0);
          await client.sendText(message.from, `Total del mes: $${total}`);
        }

        else if (texto.startsWith('categoria ')) {
          const cat = texto.replace('categoria ', '').trim();
          const rows = await sheet.getRows();
          const total = rows
            .filter(r => r.categoria.toLowerCase() === cat)
            .reduce((acc, r) => acc + Number(r.monto), 0);
          await client.sendText(message.from, `Total en categoría "${cat}": $${total}`);
        }
      }
    });
  });
}