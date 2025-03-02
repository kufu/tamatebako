const rule = require('../rules/best-practice-for-tailwind-no-root-margin')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

const errorMessage =
  'コンポーネントのルート要素に余白（margin/padding）を設定しないでください。コンポーネントは余白を持たず、使用する側で余白を制御するべきです。'

ruleTester.run('best-practice-for-tailwind-no-root-margin', rule, {
  valid: [
    // 余白のないコンポーネント
    {
      code: `
        const Button = () => {
          return <button className="shr-bg-blue-500">Click me</button>
        }
      `,
    },
    // コンポーネントのルート以外の要素での余白使用
    {
      code: `
        const Card = () => {
          return (
            <div className="shr-bg-white">
              <h2 className="shr-mt-4">Title</h2>
              <p className="shr-mb-2 shr-pt-2">Content</p>
            </div>
          )
        }
      `,
    },
    // 非コンポーネントでの余白使用（関数内のJSX）
    {
      code: `
        function renderContent() {
          return <div className="shr-mt-4 shr-pb-2">Content</div>
        }
      `,
    },
    // shr-min などの他のクラス名
    {
      code: `
        const Button = () => {
          return <button className="shr-min-w-100">Click me</button>
        }
      `,
    },
  ],
  invalid: [
    // マージンクラスを持つコンポーネント
    {
      code: `
        const Button = () => {
          return <button className="shr-mt-4">Click me</button>
        }
      `,
      errors: [{ message: errorMessage }],
    },
    // パディングクラスを持つコンポーネント
    {
      code: `
        const Box = () => {
          return (
            <div className="shr-p-4">
              <p>Content</p>
            </div>
          )
        }
      `,
      errors: [{ message: errorMessage }],
    },
    // 複数の余白クラスを持つコンポーネント
    {
      code: `
        const Card = () => {
          return (
            <div className="shr-mt-4 shr-pb-2 shr-bg-white">
              <p>Content</p>
            </div>
          )
        }
      `,
      errors: [{ message: errorMessage }],
    },
    // 他のクラスと組み合わせた余白
    {
      code: `
        const Box = () => {
          return (
            <div className="shr-bg-gray-100 shr-ml-2">
              <p>Content</p>
            </div>
          )
        }
      `,
      errors: [{ message: errorMessage }],
    },
  ],
})
