# WhatsApp Gastos Bot

Bot de WhatsApp con Venom que registra y consulta gastos en una hoja de cálculo de Google Sheets.

## Funcionalidades

- Registrar gasto: `comida 2500`
- Consultar total del día: `total hoy`
- Resumen semanal: `resumen semana`
- Resumen mensual: `resumen mes`
- Total por categoría: `categoria comida`

## Configuración

1. Crear una cuenta de servicio en Google Cloud.
2. Descargar el archivo `credentials.json` y colocarlo en la raíz del proyecto.
3. Compartir la hoja de Google Sheets con el correo de la cuenta de servicio.
4. Colocar el ID de la hoja en la constante `SHEET_ID` en `index.js`.

## Instalación

```bash
npm install
npm start
```