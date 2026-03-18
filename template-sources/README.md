# テンプレート素材フォルダ（6×5 = 30スロット）

**運用方針:** 文章と写真は **1 種類ずつ貼る**形にします。種類ごとに「この種類の文章＋写真」をチャットやアプリに送ってもらい、こちらでショーケースに反映します。

フォルダにまとめて置きたい場合だけ、下記の A・B や PDF／metadata の方法を利用できます。

---

## 枠の構成

- **6テンプレ** … Minimal Luxury / Dark Edge / Corporate Trust / Warm Organic / Pop Friendly / High Energy
- **各5バリアント** … デザイン違いの見本を5種類ずつ
- **合計30スロット**

---

## 画像の置き方

### A. スロット別（30フォルダ）

各スロット用の画像を次のパスに置きます。

```
template-sources/
  images/
    minimal_luxury/
      v1/   ← バリアント1（hero-01.jpg, hero-02.jpg, section-concept.jpg など）
      v2/
      v3/
      v4/
      v5/
    dark_edge/
      v1/ ... v5/
    corporate_trust/
      v1/ ... v5/
    warm_organic/
      v1/ ... v5/
    pop_friendly/
      v1/ ... v5/
    high_energy/
      v1/ ... v5/
```

**ファイル名の例（テンプレ4と同様）**

| 用途 | 例 |
|------|-----|
| ヒーロー1枚目 | `hero-01.jpg` |
| ヒーロー2枚目 | `hero-02.jpg` |
| ヒーロー3枚目 | `hero-03.jpg` |
| セクション「こだわり」 | `section-concept.jpg` |
| セクション「メニュー」 | `section-menu.jpg` |
| その他 | `section-〇〇.jpg` |

1スロットあたり **3～5枚** 程度を目安に揃えてください。

### B. サイト種類別（29種類 × 3～5枚）

「29種類のサイトイメージを、それぞれ3～5枚ずつ送る」場合は、**種類ごとのフォルダ**にまとめて置けます。

```
template-sources/
  by-site-type/
    カフェ/
      hero-01.jpg
      hero-02.jpg
      section-concept.jpg
      ...
    居酒屋/
      ...
    美容室/
      ...
    （全29種類分のフォルダ）
```

- フォルダ名は **種類名**（カフェ・居酒屋・美容室・ホテル など）でOKです。
- 中身は上記と同様 `hero-01.jpg` / `section-concept.jpg` などの名前で **3～5枚** 程度。
- どの種類をどのスロット（6テンプレ×5バリアントのどれ）に割り当てるかは、`manifest.json` の `slotAssignments` で後から紐づけできます。

---

## まとめて渡したい場合だけ（PDF やフォルダ）

通常は **1 種類ずつ文章と写真を貼る**運用のため、以下は「まとめて用意したいとき」の参考です。

### 方法1: PDF にまとめて置く

**1種類＝1PDF** にします。

1. Word や Google ドキュメントで、**1ページ目**に次のように書く：
   - **URL:** 参照したいサイトのURL
   - **業種:** カフェ / 居酒屋 / 美容室 など
   - **いいと思ったポイント:**（番号付きで 3～5 行）
     - 例: 1. ヒーロー全幅＋ロゴオーバーレイ  
     - 例: 2. 見出しは英字大＋和文小
2. **2ページ目以降**に、参照したい写真を **1枚ずつ** 貼る（1ページ＝1枚）。
3. PDF で保存し、`template-sources/by-site-type/種類名/source.pdf` に置く。

```
template-sources/
  by-site-type/
    カフェ/
      source.pdf   ← 1ページ目＝URL・業種・ポイントのテキスト、2ページ目～＝写真
    居酒屋/
      source.pdf
    ...
```

アプリ側では、この PDF を読み込むと **1ページ目のテキスト**（URL・業種・ポイント）と **2ページ目以降の画像** の両方を取り出せます（`src/lib/pdfExtract.ts` の `extractTextAndImagesFromPDF`）。  
→ **PDF を `template-sources/by-site-type/種類名/` に置いておけば、中身（文言）とコピペした写真の両方を参照できます。** チャットで「カフェの source.pdf を参照して」と指定するか、今後「参照用PDFを読み込む」UIから同じフォルダ内の PDF を選べるようにできます。

### 方法2: フォルダ＋metadata.json ＋ 画像ファイル

PDF を使わない場合は、種類ごとのフォルダに **テキストは JSON**、**写真は画像ファイル**で置きます。

```
template-sources/by-site-type/カフェ/
  metadata.json   ← URL・業種・ポイントを記述
  hero-01.jpg
  hero-02.jpg
  section-concept.jpg
```

**metadata.json の例**

```json
{
  "url": "https://example.com/cafe",
  "industry": "カフェ",
  "points": [
    "ヒーロー全幅＋ロゴオーバーレイ",
    "見出しは英字大＋和文小",
    "セクション間 120px 前後"
  ]
}
```

写真は `hero-01.jpg` / `section-concept.jpg` など、方法1と同じ名前ルールで 3～5 枚置きます。  
こちらはスクリプトやアプリで `metadata.json` を読んで画像パスと組み合わせて参照する想定です。

---

## manifest.json の使い方

- **slots** … 30スロット一覧（styleId + variant 1～5）。編集不要。
- **siteTypes** … 29種類の名前をメモ用に列挙。必要に応じて追加・変更。
- **slotAssignments** … 「この種類の画像を、このスロットで使う」という対応。  
  例: `"minimal_luxury_v3": "ホテル"` → テンプレ1のバリアント3には「ホテル」フォルダの画像を使う。

画像を追加したら、このリポジトリでコミットするか、フォルダごと共有してもらえれば、チャットで「template-sources/images/warm_organic/v2 を参照して」のように指定するだけで済みます。

---

## 運用のコツ

1. **まず by-site-type/種類名/** に3～5枚ずつ入れる。
2. **manifest.json** の `slotAssignments` で「どの種類をどのスロットに当てるか」を書く。
3. 必要なら **images/{styleId}/v{1-5}/** にコピーまたはシンボリックリンクで揃え、ショーケース用JSON（`warm-organic-showcase.json` など）の画像URLを差し替え用パスに更新する。

通常運用では **1 種類ずつ文章と写真を貼る**形で問題ありません。上記はまとめて渡したいときの補足です。
