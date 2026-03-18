import * as pdfjsLib from 'pdfjs-dist';

// Worker: CDN で読み込み（バージョンは package に合わせる）
// npm パッケージと同一バージョンの worker を unpkg から読み込む
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

/**
 * PDF の指定ページを画像（data URL）として取得する（ブラウザのみ・キャンバス使用）
 * 1ページ目＝テキスト用、2ページ目以降＝写真として使う想定
 */
export async function getPageAsImageDataUrl(file: File, pageNum1Based: number): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNum1Based);
  const scale = 2;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  await page.render({
    canvasContext: ctx,
    viewport,
    canvas,
  }).promise;
  return canvas.toDataURL('image/png');
}

/**
 * PDF から「1ページ目＝テキスト」「2ページ目以降＝画像」として取り出す。
 * 29種類×1ファイルずつ（1種類＝1PDF）の形式で、URL・文言・コピペした写真を一括参照する用途。
 */
export async function extractTextAndImagesFromPDF(file: File): Promise<{
  text: string;
  images: string[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const page1 = await pdf.getPage(1);
  const content = await page1.getTextContent();
  const text = content.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const images: string[] = [];
  const scale = 2;
  for (let i = 2; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toDataURL('image/png'));
  }

  return { text, images };
}

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
 * デザイン参照用：1ページ目テキストを「URL・業種・参照したいポイント」にパースする
 * 形式例:
 *   URL: https://...
 *   業種: カフェ
 *   いいと思ったポイント:
 *   1. ヒーロー全幅＋ロゴオーバーレイ
 *   2. 見出しは英字大＋和文小
 */
export function parseReferencePageText(raw: string): {
  url: string;
  industry: string;
  points: string[];
} {
  const urlMatch = raw.match(/(?:URL|url|URL：|url：)\s*[：:]\s*(\S+)/i);
  const industryMatch = raw.match(/(?:業種|ジャンル)\s*[：:]\s*(.+?)(?:\n|$)/i);
  const points: string[] = [];
  const pointBlock = raw.match(/(?:いいと思ったポイント|参照したい点|ポイント)[\s:：]*\n([\s\S]*?)(?=\n\n|$)/i);
  if (pointBlock) {
    const list = pointBlock[1].split(/\n/).map((s) => s.trim()).filter(Boolean);
    for (const line of list) {
      const m = line.match(/^\d+[\.．)\]\s]+\s*(.+)$/) || line.match(/^[・\-]\s*(.+)$/);
      if (m) points.push(m[1].trim());
      else if (line.length > 0 && line.length < 200) points.push(line);
    }
  }
  return {
    url: (urlMatch?.[1] ?? '').trim(),
    industry: (industryMatch?.[1] ?? '').trim(),
    points,
  };
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
