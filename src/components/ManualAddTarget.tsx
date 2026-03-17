import { useState, useCallback } from 'react';
import { addToQueue } from '../lib/queueStorage';
import { isApiAvailable, api } from '../lib/api';
import type { VerificationSignals } from '../types';

const emptySignals: VerificationSignals = {
  placeId: null,
  mapsUrl: null,
  rating: null,
  userRatingsTotal: null,
  hasOpeningHours: false,
  hasPhoto: false,
  needsVerification: true,
};

interface ManualAddTargetProps {
  onAdded?: () => void;
}

export function ManualAddTarget({ onAdded }: ManualAddTargetProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('manual');
  const [done, setDone] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      if (isApiAvailable()) {
        await api.addToQueue({
          source: 'manual',
          name: name.trim(),
          address: address.trim(),
          placeId: null,
          notes: notes.trim(),
          signals: emptySignals,
          category: category.trim() || 'manual',
        });
        onAdded?.();
      } else {
        addToQueue({
          source: 'manual',
          name: name.trim(),
          address: address.trim(),
          placeId: null,
          notes: notes.trim(),
          signals: emptySignals,
          category: category.trim() || 'manual',
        });
      }
      setDone(true);
      setName('');
      setAddress('');
      setNotes('');
      setCategory('manual');
      setTimeout(() => setDone(false), 2000);
    },
    [name, address, notes, category, onAdded]
  );

  return (
    <div className="panel manual-add">
      <h2>手動で追加</h2>
      <p className="hint">
        Instagram などで見つけた店舗はここから追加してください。実在確認はダッシュボードで行います。
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>店舗名 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 〇〇カフェ"
            required
          />
        </div>
        <div className="field">
          <label>住所</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="例: 東京都港区..."
          />
        </div>
        <div className="field">
          <label>メモ（Instagram URL など）</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div className="field">
          <label>業種・カテゴリ</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例: カフェ"
          />
        </div>
        <button type="submit" className="primary" disabled={!name.trim()}>
          {done ? 'キューに追加しました' : 'キューに追加'}
        </button>
      </form>
    </div>
  );
}
