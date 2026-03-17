import { useCallback, useState } from 'react';
import { extractTextFromPDF, parseExtractedTextToContent } from '../lib/pdfExtract';
import type { PageContent } from '../types';

interface PDFUploadProps {
  onComplete: (content: PageContent) => void;
}

export function PDFUpload({ onComplete }: PDFUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file?.name.toLowerCase().endsWith('.pdf')) {
        setError('PDFファイルを選択してください。');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const text = await extractTextFromPDF(file);
        const content = parseExtractedTextToContent(text || '新しいページ');
        onComplete(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'PDFの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    },
    [onComplete]
  );

  const handlePaste = useCallback(() => {
    if (!pastedText.trim()) {
      setError('テキストを入力してください。');
      return;
    }
    setError(null);
    const content = parseExtractedTextToContent(pastedText.trim());
    onComplete(content);
  }, [pastedText, onComplete]);

  const startFromScratch = useCallback(() => {
    const content: PageContent = {
      siteName: 'マイサイト',
      title: 'ホーム',
      headline: 'ようこそ',
      subheadline: 'キャッチコピーをここに入力してください。',
      sections: [
        { id: 'section-1', title: 'ごあいさつ', content: '本文を編集してください。' },
      ],
      footerText: `© ${new Date().getFullYear()} マイサイト. All rights reserved.`,
    };
    onComplete(content);
  }, [onComplete]);

  return (
    <div className="panel pdf-upload">
      <h2>コンテンツの取り込み</h2>
      <p className="hint">PDFからテキストを抽出するか、テキストを貼り付けてページの叩き台を作成します。</p>

      {!pasteMode ? (
        <>
          <label className="file-label">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFile}
              disabled={loading}
            />
            <span className="file-button">{loading ? '読み込み中…' : 'PDFを選択'}</span>
          </label>
          <button type="button" className="text-button" onClick={() => setPasteMode(true)}>
            テキストを貼り付けて作成
          </button>
          <button type="button" className="text-button secondary" onClick={startFromScratch}>
            空のページから作成
          </button>
        </>
      ) : (
        <>
          <textarea
            className="paste-area"
            placeholder="ここにテキストを貼り付けてください。最初の行がタイトル、続きが本文として使われます。"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={8}
          />
          <div className="row">
            <button type="button" className="primary" onClick={handlePaste}>
              この内容で作成
            </button>
            <button type="button" className="secondary" onClick={() => setPasteMode(false)}>
              キャンセル
            </button>
          </div>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
