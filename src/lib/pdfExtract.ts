import * as pdfjsLib from 'pdfjs-dist';

// Worker: CDN で読み込み（バージョンは package に合わせる）
// npm パッケージと同一バージョンの worker を unpkg から読み込む
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

/**
 * PDF ファイルからテキストを抽出する（全ページ）
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const texts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) texts.push(pageText);
  }

  return texts.join('\n\n');
}

/**
 * 抽出したテキストを簡易パースしてページコンテンツの雛形にする
 * （最初の行をタイトル、次のブロックをヒーロー用などに割り当て）
 */
export function parseExtractedTextToContent(raw: string): {
  siteName: string;
  title: string;
  headline: string;
  subheadline: string;
  sections: { id: string; title: string; content: string }[];
  footerText: string;
} {
  const lines = raw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const siteName = lines[0] || 'サイト名';
  const title = lines[0] || 'ページタイトル';
  const headline = lines[1] || lines[0] || 'メインヘッドライン';
  const subheadline = lines[2] || 'サブコピーやキャッチコピーをここに記載します。';

  const rest = lines.slice(3);
  const sections: { id: string; title: string; content: string }[] = [];
  let i = 0;
  while (i < rest.length) {
    const line = rest[i];
    const looksLikeHeading = line.length < 50 && (i === 0 || rest[i - 1] === '');
    const contentStart = looksLikeHeading ? i + 1 : i;
    let contentEnd = contentStart;
    while (contentEnd < rest.length && rest[contentEnd] !== '') {
      contentEnd++;
    }
    const content = rest.slice(contentStart, contentEnd).join(' ').trim();
    sections.push({
      id: `section-${sections.length + 1}`,
      title: looksLikeHeading ? line : `セクション ${sections.length + 1}`,
      content: content || line,
    });
    i = contentEnd < rest.length ? contentEnd + 1 : rest.length;
  }

  if (sections.length === 0) {
    sections.push({
      id: 'section-1',
      title: 'ごあいさつ',
      content: rest.join(' ') || 'PDFから取り込んだ内容を編集してください。',
    });
  }

  return {
    siteName,
    title,
    headline,
    subheadline,
    sections,
    footerText: `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
  };
}
