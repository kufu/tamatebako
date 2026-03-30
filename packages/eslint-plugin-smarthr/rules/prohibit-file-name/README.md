# smarthr/prohibit-file-name

正規表現に合致するファイル、ディレクトリの作成を阻害するルールです。プロジェクト固有の命名規則やアーキテクチャパターンを強制するために使用します。

## なぜファイル名を制限する必要があるのか

プロジェクトが大きくなるにつれ、ファイル名やディレクトリ構造の一貫性を保つことが重要になります：

- **アーキテクチャパターンの強制**: 例えば、Redux Toolkitの `createSlice` を使用する場合、古い `actions` や `reducers` ディレクトリの作成を禁止することで、新しいパターンへの移行を促進できます
- **命名規則の統一**: 特定のディレクトリ内では決められたファイル名を使用することを強制し、プロジェクト全体の統一感を保ちます
- **目的の明確化**: `index.ts` のような汎用的な名前を禁止し、より具体的な名前（`form.ts`, `validator.ts`など）を使用することで、ファイルの目的を明確にします

このルールにより、チーム全体で統一されたファイル命名規則を維持し、コードベースの保守性を向上させることができます。

## rules

```js
{
  rules: {
    'smarthr/prohibit-file-name': [
      'error', // 'warn', 'off'
      {
        '\/(actions|reducers)\/$': 'slicesディレクトリ内でcreateSliceを利用してください',
        '\/views\/(page|template)\.(ts(x)?)$': 'index.$2、もしくはTemplate.$2にリネームしてください',
        '\/modules\/(adapters|entities|repositories|slices)\/index\.ts(x)?$': '利用目的が推測出来ない為、リネームしてください(例: new, edit用ならform.tsなど)',
      },
    ]
  },
}
```

## ❌ Incorrect

```js
// src/pages/actions/index.ts
// src/modules/entities/index.ts
```

## ✅ Correct


```js
// src/pages/slices/index.ts
// src/modules/entities/item.ts
```
