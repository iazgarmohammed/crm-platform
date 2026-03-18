export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }

  // ── Get headers from first object keys ──
  const headers = Object.keys(data[0]).filter((key) =>
    !['id', 'createdAt', 'updatedAt'].includes(key)
  );

  // ── Build CSV rows ──
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        if (Array.isArray(val)) return `"${val.join(', ')}"`;
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"')
          ? `"${str}"`
          : str;
      }).join(',')
    ),
  ];

  // ── Trigger download ──
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};