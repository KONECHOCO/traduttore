// Esportazione dei documenti tradotti in Word (.docx): solo traduzione, oppure bilingue
// (tabella a due colonne: originale | traduzione, paragrafo per paragrafo).
import { exportBlobFile } from './fileExport';

export async function exportDocx({ filename, title, pairs, bilingual, labels }) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = await import('docx');

  const paragraphs = text => text.split(/\n+/).map(line => new Paragraph({ children: [new TextRun(line)], spacing: { after: 120 } }));

  const children = [new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 })];
  if (bilingual) {
    const header = new TableRow({
      tableHeader: true,
      children: [labels.original, labels.translation].map(
        h => new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })
      )
    });
    const rows = pairs.map(
      p => new TableRow({
        children: [p.orig, p.trans].map(txt => new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: paragraphs(txt || '') }))
      })
    );
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }));
  } else {
    pairs.forEach(p => children.push(...paragraphs(p.trans || '')));
  }

  const doc = new Document({ creator: 'OmniLingo', title, sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  await exportBlobFile(filename, blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
