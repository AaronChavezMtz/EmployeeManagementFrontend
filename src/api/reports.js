import client from './client';

// Descarga un archivo binario (Excel/PDF) devuelto por la API y dispara la
// descarga en el navegador, usando el nombre de archivo que la API sugiere
// (header Content-Disposition) cuando está disponible.
async function downloadFile(url, params, fallbackName) {
  const response = await client.get(url, { params, responseType: 'blob' });
  const disposition = response.headers['content-disposition'];
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || fallbackName;

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const reportsApi = {
  exportEmployeesExcel: (params) => downloadFile('/reports/employees/excel', params, 'empleados.xlsx'),
  exportDepartmentsExcel: () => downloadFile('/reports/departments/excel', {}, 'resumen_departamentos.xlsx'),
  exportDepartmentsPdf: () => downloadFile('/reports/departments/pdf', {}, 'resumen_departamentos.pdf'),
};
