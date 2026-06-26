# 自動車検査員試験 クイズアプリ

自動車検査員試験の過去問対策用 Web 学習アプリです。スマートフォンやブラウザから、仕事の合間などいつでも問題演習ができます。

> **注意**: 本リポジトリに含まれる問題は学習用のオリジナル類題です。実際の試験過去問の全文コピーではありません。

## 機能

- 1問ずつ表示して解答
- 正誤判定と解説の表示
- 進捗の保存（localStorage）
- カテゴリ・年度でのフィルタ
- 間違えた問題の復習モード
- モバイル対応のレスポンシブ UI

## 技術スタック

- Vite
- React 19
- TypeScript

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## 問題データの追加方法

問題は `data/questions.json` に JSON 配列で管理しています。以下のスキーマに従ってオブジェクトを追加してください。

```json
{
  "id": "q013",
  "category": "道路運送車両法",
  "year": 2024,
  "question": "問題文をここに記載",
  "choices": [
    "選択肢A",
    "選択肢B",
    "選択肢C",
    "選択肢D"
  ],
  "correctAnswer": 0,
  "explanation": "解説文（任意）"
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | string | 一意の問題ID |
| `category` | string | カテゴリ名（フィルタに使用） |
| `year` | number | 出題年度（任意、フィルタに使用） |
| `question` | string | 問題文 |
| `choices` | string[] | 選択肢の配列 |
| `correctAnswer` | number | 正解のインデックス（0始まり） |
| `explanation` | string | 解説（任意） |

JSON を編集したら、開発サーバーを再起動するか `npm run build` で反映を確認してください。

## GitHub への push 手順

```bash
# リモートリポジトリを追加（初回のみ）
git remote add origin https://github.com/<ユーザー名>/jidousha-kensain-quiz.git

# 変更をコミット
git add .
git commit -m "Initial commit: quiz app"

# main ブランチに push
git push -u origin main
```

## GitHub Pages へのデプロイ

本プロジェクトには GitHub Actions による自動デプロイ設定（`.github/workflows/deploy.yml`）が含まれています。

### 手順

1. GitHub でリポジトリを作成し、コードを push する
2. リポジトリの **Settings → Pages** を開く
3. **Build and deployment → Source** で **GitHub Actions** を選択する
4. `main`（または `master`）ブランチに push すると、ワークフローが自動実行される
5. デプロイ完了後、`https://<ユーザー名>.github.io/jidousha-kensain-quiz/` でアクセス可能

### ローカルで GitHub Pages 向けビルド

```bash
# Windows (PowerShell)
$env:GITHUB_PAGES="true"; npm run build

# macOS / Linux
GITHUB_PAGES=true npm run build
```

`vite.config.ts` の `base` パスが `/jidousha-kensain-quiz/` に設定されます。リポジトリ名を変更した場合は、`vite.config.ts` とワークフローの設定を合わせて更新してください。

## ライセンス

学習・個人利用を想定しています。問題データを追加する際は、著作権に配慮し、実際の過去問の全文コピーは避けてください。
