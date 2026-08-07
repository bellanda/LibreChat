import { getFileType } from './files';

describe('getFileType', () => {
  /** CSV is a spreadsheet to the user, whatever its mimetype family says.
   * Resolving it by the `text/` category prefix lands it on the generic
   * "Document" icon while XLSX — matched by mimetype — gets "Spreadsheet". */
  it('gives CSV the same spreadsheet icon as XLSX', () => {
    const xlsx = getFileType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const csv = getFileType('text/csv');

    expect(csv.title).toBe('Spreadsheet');
    expect(csv.paths).toBe(xlsx.paths);
    expect(csv.fill).toBe(xlsx.fill);
  });

  it('still resolves plain text to the document icon', () => {
    expect(getFileType('text/plain').title).toBe('Document');
  });
});
