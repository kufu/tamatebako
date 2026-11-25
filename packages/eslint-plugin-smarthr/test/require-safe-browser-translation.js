const rule = require('../rules/require-safe-browser-translation')
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

const errorMessage = (label) => `${label}が条件によって出入りしています。ブラウザの自動翻訳機能を利用している場合、Reactがクラッシュする可能性があります
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-safe-browser-translation
 - 意味づけ・スタイルのために要素で囲むべきテキストの場合、適切な要素で囲んでください(spanに限らず、要素で囲まれていれば問題ありません)
 - 現状のマークアップが正しい場合、smarthr-ui/SafeBrowserTranslationで囲み、意味づけ・スタイルのための要素ではないことを明確にしてください`

ruleTester.run('require-safe-browser-translation', rule, {
  valid: [
    // SafeBrowserTranslationで包まれている(&&)
    { code: `
      const Foo = ({ loading }) => (
        <div>
          {loading && (
            <SafeBrowserTranslation>
              <Localizer id="x" defaultText="処理中" />
            </SafeBrowserTranslation>
          )}
        </div>
      )
    ` },

    // SafeBrowserTranslationで包まれている(三項演算子)
    { code: `
      const Foo = ({ loading }) => (
        <div>
          {loading ? (
            <SafeBrowserTranslation>
              <Localizer id="x" defaultText="処理中" />
            </SafeBrowserTranslation>
          ) : null}
        </div>
      )
    ` },

    // SafeBrowserTranslationで包まれている(文字列リテラル)
    { code: `
      const Foo = ({ loading }) => (
        <div>{loading && <SafeBrowserTranslation>text</SafeBrowserTranslation>}</div>
      )
    ` },

    // 両方の分岐が対象コンポーネントのため、要素の出入りが発生しない
    { code: `
      const Foo = ({ exceeded }) => (
        <div>
          {exceeded ? (
            <Localizer id="a" defaultText="a" />
          ) : (
            <Localizer id="b" defaultText="b" />
          )}
        </div>
      )
    ` },

    // 両方の分岐でkeyが同じ(静的な文字列)ため安全
    { code: `
      const Foo = ({ exceeded }) => (
        <div>
          {exceeded ? (
            <Localizer key="same" id="a" defaultText="a" />
          ) : (
            <Localizer key="same" id="b" defaultText="b" />
          )}
        </div>
      )
    ` },

    // 両方の分岐が文字列リテラルのため安全
    { code: `
      const Foo = ({ checked }) => <div>{checked ? '選択済み' : '無選択'}</div>
    ` },

    // 文字列リテラルとテンプレートリテラルの組み合わせは、どちらも最終的に
    // 文字列としてレンダーされるため安全
    { code: `
      const Foo = ({ checked, name }) => (
        <div>{checked ? \`\${name}を選択済み\` : '無選択'}</div>
      )
    ` },

    // 対象コンポーネントではない要素の条件付きレンダリング
    { code: `
      const Foo = ({ loading }) => <div>{loading && <OtherComponent />}</div>
    ` },

    // 条件なしで常にレンダーされている
    { code: `
      const Foo = () => (
        <div>
          <Localizer id="x" defaultText="処理中" />
        </div>
      )
    ` },

    // &&の左辺(条件式側)に対象外の要素が出てきても問題ない
    { code: `
      const Foo = ({ a }) => <div>{Boolean(a) && <OtherComponent />}</div>
    ` },

    // 変数・関数呼び出しは型が静的に確定しないため対象外
    { code: `
      const Foo = ({ loading, content }) => <div>{loading && content}</div>
    ` },

    // JSX属性値はHTML属性でテキストノードを生成しないため対象外(&&)
    { code: `
      const Foo = ({ loading }) => <div aria-label={loading && '処理中'} />
    ` },

    // JSX属性値はHTML属性でテキストノードを生成しないため対象外(三項演算子)
    { code: `
      const Foo = ({ current }) => <a aria-current={current ? 'page' : undefined} />
    ` },

    // ネストした三項演算子で、すべての分岐が対象コンポーネントのため安全
    { code: `
      const Foo = ({ sort }) => (
        <div>
          {sort === 'asc' ? (
            <Localizer id="a" defaultText="a" />
          ) : sort === 'desc' ? (
            <Localizer id="b" defaultText="b" />
          ) : (
            <Localizer id="c" defaultText="c" />
          )}
        </div>
      )
    ` },

    // テンプレートリテラルと型の確定しない変数(number等)の組み合わせは、
    // Reactの内部的にはどちらも同じテキストノードとして扱われ安全
    { code: `
      const Foo = ({ count, max }) => (
        <div>{count > max ? \`\${max}+\` : count}</div>
      )
    ` },

    // 文字列リテラルと変数の組み合わせも同様に安全
    { code: `
      const Foo = ({ checked, label }) => <div>{checked ? '選択済み' : label}</div>
    ` },

    // 空文字列は「何もレンダーされない」値のため、&&の右辺でも対象外
    { code: `
      const Foo = ({ checked }) => <div>{checked && ''}</div>
    ` },

    // 両分岐が空文字列同士の組み合わせも対象外
    { code: `
      const Foo = ({ checked }) => <div>{checked ? '' : ''}</div>
    ` },

    // keyを両方省略した場合は対象外(現状維持の確認)
    { code: `
      const Foo = ({ exceeded }) => (
        <div>
          {exceeded ? <Localizer id="a" defaultText="a" /> : <Localizer id="b" defaultText="b" />}
        </div>
      )
    ` },

    // localize()の呼び出し結果がSafeBrowserTranslationで包まれている
    { code: `
      const Foo = ({ loading }) => {
        const { localize } = useIntl()
        return (
          <div>
            {loading && (
              <SafeBrowserTranslation>
                {localize({ id: 'x', defaultText: '処理中' })}
              </SafeBrowserTranslation>
            )}
          </div>
        )
      }
    ` },

    // 対象外のメソッド名の呼び出しは文字列である保証がないため対象外
    { code: `
      const Foo = ({ loading, getText }) => <div>{loading && getText()}</div>
    ` },

    // 両分岐が静的に空と確定しているテンプレートリテラル同士の組み合わせは対象外
    { code: `
      const Foo = ({ checked }) => <div>{checked ? \`\` : \`\`}</div>
    ` },

    // 空文字列とtrueはどちらも「何もレンダーされない」ことが確定しているため、
    // 両分岐とも未分類(targetEntriesが空)となり対象外
    { code: `
      const Foo = ({ checked }) => <div>{checked ? '' : true}</div>
    ` },

    // additionalTextComponentRegex: 追加したコンポーネントも、要素で囲まれていれば対象外
    {
      code: `const Foo = ({ loading }) => <div>{loading && <span><Trans id="x" /></span>}</div>`,
      options: [{ additionalTextComponentRegex: ['^Trans$'] }],
    },
    // オプション未指定の場合、追加していないコンポーネント・関数は対象外
    { code: `const Foo = ({ loading }) => <div>{loading && <Trans id="x" />}</div>` },
    { code: `const Foo = ({ loading }) => <div>{loading && t('x')}</div>` },
    // Fragmentで囲まれたテキストは検知できない(既知の限界)
    { code: `const Foo = ({ loading }) => <div>{loading && <>処理中</>}</div>` },
    // translated.xxx / localized.xxx は文字列とみなすため、文字列同士の切り替えは対象外
    { code: `const Foo = ({ page, translated }) => <div>{page === 'favorite' ? translated.favoriteModeText : translated.allModeText}</div>` },
    { code: `const Foo = ({ checked, localized }) => <div>{checked ? localized.checked : '無選択'}</div>` },
    // translated / localized そのもの、および先頭以外に含まれる場合は対象外
    { code: `const Foo = ({ loading, translated, props, untranslated }) => <div>{loading && translated}{loading && props.translated.value}{loading && untranslated.value}</div>` },
    // translated.xxx / localized.xxx が要素で囲まれている場合は対象外
    { code: `const Foo = ({ loading, translated }) => <div>{loading && <SafeBrowserTranslation>{translated.text}</SafeBrowserTranslation>}</div>` },
    // name / label / text / title / message / description 系は文字列とみなすため、文字列同士の切り替えは対象外
    { code: `const Foo = ({ checked, label, user }) => <div>{checked ? label : '未設定'}{checked ? user.name : user.displayName}</div>` },
    // name / label / text / title / message / description 系が要素で囲まれている場合は対象外
    { code: `const Foo = ({ loading, title }) => <div>{loading && <p>{title}</p>}</div>` },
    // 別の単語の末尾に含まれるだけの場合は対象外(rename, context, subtitle 等)
    { code: `const Foo = ({ loading, rename, context, subtitle, user }) => <div>{loading && rename}{loading && context}{loading && subtitle}{loading && user.filename}</div>` },
    // JSX属性値は対象外
    { code: `const Foo = ({ loading, label }) => <div aria-label={loading ? label : undefined} />` },
    // additionalTextVariableRegex: オプション未指定の場合、デフォルトの対象以外の変数・プロパティアクセスは対象外
    { code: `const Foo = ({ loading, caption }) => <div>{loading && caption}</div>` },
    { code: `const Foo = ({ loading, user }) => <div>{loading ? user.kana : null}</div>` },
    // additionalTextVariableRegex: マッチしない変数・プロパティアクセスは対象外
    {
      code: `const Foo = ({ loading, content, user }) => <div>{loading && content}{loading && user.age}{loading && kana}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$', '\\.kana$'] }],
    },
    // additionalTextVariableRegex: 文字列とみなすため、文字列同士の切り替えは対象外
    {
      code: `const Foo = ({ loading, caption, user }) => <div>{loading ? caption : '未設定'}{loading ? user.kana : caption}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$', '\\.kana$'] }],
    },
    // additionalTextVariableRegex: `.`つなぎで表せない式は対象外
    {
      code: `const Foo = ({ loading, users, key }) => <div>{loading && users[0].kana}{loading && getUser().kana}{loading && users[key]}</div>`,
      options: [{ additionalTextVariableRegex: ['kana$', '^users'] }],
    },
    // additionalTextVariableRegex: 要素で囲まれていれば対象外
    {
      code: `const Foo = ({ loading, caption }) => <div>{loading && <SafeBrowserTranslation>{caption}</SafeBrowserTranslation>}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$'] }],
    },
    // additionalTextVariableRegex: JSX属性値は対象外
    {
      code: `const Foo = ({ loading, caption }) => <div aria-label={loading ? caption : undefined} />`,
      options: [{ additionalTextVariableRegex: ['^caption$'] }],
    },
    // SafeBrowserTranslation以外の要素で囲まれている場合も対象外
    { code: `const Foo = ({ loading }) => <div>{loading && <p>処理中</p>}</div>` },
    { code: `const Foo = ({ loading }) => <div>{loading ? <Text><Localizer id="x" defaultText="処理中" /></Text> : null}</div>` },
  ],
  invalid: [
    // {cond && <Localizer />}
    {
      code: `
        const Foo = ({ loading }) => (
          <div>{loading && <Localizer id="x" defaultText="処理中" />}</div>
        )
      `,
      errors: [{ message: errorMessage('Localizer要素') }],
    },

    // {cond && <FormattedMessage />}
    {
      code: `
        const Foo = ({ loading }) => (
          <div>{loading && <FormattedMessage id="x" />}</div>
        )
      `,
      errors: [
        { message: errorMessage('FormattedMessage要素') },
      ],
    },

    // {cond ? <Localizer /> : null}
    {
      code: `
        const Foo = ({ loading }) => (
          <div>{loading ? <Localizer id="x" defaultText="処理中" /> : null}</div>
        )
      `,
      errors: [{ message: errorMessage('Localizer要素') }],
    },

    // {cond ? null : <Localizer />}
    {
      code: `
        const Foo = ({ loading }) => (
          <div>{loading ? null : <Localizer id="x" defaultText="処理中" />}</div>
        )
      `,
      errors: [{ message: errorMessage('Localizer要素') }],
    },

    // 片方のみ対象コンポーネントの三項演算子(型が異なるため要素の出入りが発生する)
    {
      code: `
        const Foo = ({ loading }) => (
          <div>
            {loading ? <Localizer id="x" defaultText="処理中" /> : <OtherComponent />}
          </div>
        )
      `,
      errors: [{ message: errorMessage('Localizer要素') }],
    },

    // ネストした三項演算子で、一部の分岐のみが対象コンポーネント
    {
      code: `
        const Foo = ({ mode, page, values }) => (
          <div>
            {mode === 'search' ? (
              <Localizer id="x" defaultText="検索結果" />
            ) : page === 'favorite' ? (
              values.favorite
            ) : (
              values.all
            )}
          </div>
        )
      `,
      errors: [{ message: errorMessage('Localizer要素') }],
    },

    // 同じコンポーネントでもkeyが異なる場合、Reactは要素を再利用しない
    {
      code: `
        const Foo = ({ exceeded }) => (
          <div>
            {exceeded ? (
              <Localizer key="a" id="a" defaultText="a" />
            ) : (
              <Localizer key="b" id="b" defaultText="b" />
            )}
          </div>
        )
      `,
      errors: [
        { message: errorMessage('Localizer要素') },
        { message: errorMessage('Localizer要素') },
      ],
    },

    // 片方のみkeyがある場合も、Reactは要素を再利用しない
    {
      code: `
        const Foo = ({ exceeded }) => (
          <div>
            {exceeded ? (
              <Localizer key="a" id="a" defaultText="a" />
            ) : (
              <Localizer id="b" defaultText="b" />
            )}
          </div>
        )
      `,
      errors: [
        { message: errorMessage('Localizer要素') },
        { message: errorMessage('Localizer要素') },
      ],
    },

    // keyが動的な式の場合、静的に同一とは判断できないため安全とみなさない
    {
      code: `
        const Foo = ({ exceeded, dynamicKey }) => (
          <div>
            {exceeded ? (
              <Localizer key={dynamicKey} id="a" defaultText="a" />
            ) : (
              <Localizer key={dynamicKey} id="b" defaultText="b" />
            )}
          </div>
        )
      `,
      errors: [
        { message: errorMessage('Localizer要素') },
        { message: errorMessage('Localizer要素') },
      ],
    },

    // LocalizerとFormattedMessageの混在は、keyが無くても要素の型自体が異なるため、
    // Reactは要素を再利用しない
    {
      code: `
        const Foo = ({ exceeded }) => (
          <div>
            {exceeded ? (
              <Localizer id="a" defaultText="a" />
            ) : (
              <FormattedMessage id="b" />
            )}
          </div>
        )
      `,
      errors: [
        { message: errorMessage('Localizer要素') },
        { message: errorMessage('FormattedMessage要素') },
      ],
    },

    // {cond && '文字列リテラル'}
    {
      code: `
        const Foo = ({ checked }) => <div>{checked && '選択済み'}</div>
      `,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },

    // {cond && \`テンプレートリテラル\`}
    {
      code: `
        const Foo = ({ checked, name }) => <div>{checked && \`\${name}を選択済み\`}</div>
      `,
      errors: [
        { message: errorMessage('テンプレートリテラル') },
      ],
    },

    // {cond ? '文字列リテラル' : null}
    {
      code: `
        const Foo = ({ checked }) => <div>{checked ? '選択済み' : null}</div>
      `,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },

    // コンポーネントと文字列リテラルの混在(型が異なるため要素の出入りが発生する。
    // 両方の分岐が危険な式のため、両方に報告される)
    {
      code: `
        const Foo = ({ loading }) => (
          <div>{loading ? <Localizer id="x" defaultText="処理中" /> : '処理中'}</div>
        )
      `,
      errors: [
        { message: errorMessage('Localizer要素') },
        { message: errorMessage('文字列リテラル') },
      ],
    },

    // 文字列リテラルと対象外コンポーネント(Icon等)の組み合わせ。number等の
    // 型不明な変数と違い、JSX要素は確実に要素であり、切り替えで要素の出入りが
    // 発生するため緩和の対象外(文字列リテラル側は報告される)
    {
      code: `
        const Foo = ({ checked }) => <div>{checked ? '選択済み' : <Icon />}</div>
      `,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },

    // 文字列リテラルと空文字列の組み合わせ(空文字列は「何もレンダーされない」値のため
    // 要素の有無そのものが切り替わり危険)
    {
      code: `
        const Foo = ({ loading }) => <div>{loading ? '処理中' : ''}</div>
      `,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },

    // ネストした三項演算子で、未分類の分岐(型不明な変数)と確定した空の分岐(null)が
    // 混在する場合。typeof valueが不明でも、nullとの切り替えで要素の有無が
    // 切り替わることは確定しているため報告する
    {
      code: `
        const Foo = ({ a, b, value }) => (
          <div>{a ? 'text' : b ? null : value}</div>
        )
      `,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },

    // JSXSpreadAttribute経由でkeyが渡されている場合、静的に値を判定できないため
    // 安全側に倒して動的なkeyと同様に扱う
    {
      code: `
        const Foo = ({ exceeded }) => (
          <div>
            {exceeded ? (
              <Localizer {...{ key: 'a' }} id="a" defaultText="a" />
            ) : (
              <Localizer {...{ key: 'b' }} id="b" defaultText="b" />
            )}
          </div>
        )
      `,
      errors: [
        { message: errorMessage('Localizer要素') },
        { message: errorMessage('Localizer要素') },
      ],
    },

    // keyの省略(present: false)と`key=""`のような明示的な空文字列指定は、
    // Reactでは前者がnull・後者が''であり異なる値のため、Reactは要素を再利用しない
    {
      code: `
        const Foo = ({ exceeded }) => (
          <div>
            {exceeded ? (
              <Localizer key="" id="a" defaultText="a" />
            ) : (
              <Localizer id="b" defaultText="b" />
            )}
          </div>
        )
      `,
      errors: [
        { message: errorMessage('Localizer要素') },
        { message: errorMessage('Localizer要素') },
      ],
    },

    // {cond && localize(...)}
    {
      code: `
        const Foo = ({ loading }) => {
          const { localize } = useIntl()
          return <div>{loading && localize({ id: 'x', defaultText: '処理中' })}</div>
        }
      `,
      errors: [
        { message: errorMessage('localize()の呼び出し結果') },
      ],
    },

    // {cond ? formatMessage(...) : null}(intl.formatMessage(...)のようなメンバー式経由)
    {
      code: `
        const Foo = ({ loading, intl }) => (
          <div>{loading ? intl.formatMessage({ id: 'x' }) : null}</div>
        )
      `,
      errors: [
        { message: errorMessage('formatMessage()の呼び出し結果') },
      ],
    },

    // 補間のない空のテンプレートリテラル(``)は空文字列と同じく「何もレンダーされない」値
    {
      code: `
        const Foo = ({ loading }) => <div>{loading ? '処理中' : \`\`}</div>
      `,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },

    // trueもnull/false同様「何もレンダーされない」ことが確定している
    {
      code: `
        const Foo = ({ checked }) => <div>{checked ? '選択済み' : true}</div>
      `,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },

    // 論理AND式の右辺に三項演算子が続く場合も、&&の右辺を辿って判定するため検知する
    {
      code: `
        const Foo = ({ visible, loading }) => (
          <div>{visible && (loading ? <Localizer id="x" defaultText="処理中" /> : null)}</div>
        )
      `,
      errors: [{ message: errorMessage('Localizer要素') }],
    },

    // additionalTextComponentRegex: 追加したコンポーネントも検知される
    {
      code: `const Foo = ({ loading }) => <div>{loading && <Trans id="x" />}</div>`,
      options: [{ additionalTextComponentRegex: ['^Trans$'] }],
      errors: [{ message: errorMessage('Trans要素') }],
    },
    // additionalTextComponentRegex: デフォルトのコンポーネントも引き続き検知される
    {
      code: `const Foo = ({ loading }) => <div>{loading && <Localizer id="x" defaultText="処理中" />}</div>`,
      options: [{ additionalTextComponentRegex: ['^Trans$'] }],
      errors: [{ message: errorMessage('Localizer要素') }],
    },
    // additionalTextFunctionRegex: 追加した関数の呼び出し結果も検知される
    {
      code: `const Foo = ({ loading }) => <div>{loading && t('x')}</div>`,
      options: [{ additionalTextFunctionRegex: ['^t$'] }],
      errors: [{ message: errorMessage('t()の呼び出し結果') }],
    },
    // additionalTextFunctionRegex: メンバー式経由の呼び出しも検知される
    {
      code: `const Foo = ({ loading, i18n }) => <div>{loading ? i18n.t('x') : null}</div>`,
      options: [{ additionalTextFunctionRegex: ['^t$'] }],
      errors: [{ message: errorMessage('t()の呼び出し結果') }],
    },
    // translated.xxx / localized.xxx はデフォルトで文字列とみなして検知される
    {
      code: `const Foo = ({ loading, translated }) => <div>{loading && translated.text}</div>`,
      errors: [{ message: errorMessage('translated.text') }],
    },
    {
      code: `const Foo = ({ loading, localized }) => <div>{loading ? localized?.text : null}</div>`,
      errors: [{ message: errorMessage('localized.text') }],
    },
    // 要素との切り替えは検知される
    {
      code: `
        const Foo = ({ mode, page, translated }) => (
          <div>
            {mode === 'search' ? (
              <SafeBrowserTranslation>
                <Localizer id="x" defaultText="検索結果" />
              </SafeBrowserTranslation>
            ) : page === 'favorite' ? (
              translated.favoriteModeText
            ) : (
              translated.allModeText
            )}
          </div>
        )
      `,
      errors: [{ message: errorMessage('translated.favoriteModeText') }, { message: errorMessage('translated.allModeText') }],
    },
    // name / label / text / title / message / description はデフォルトで文字列とみなして検知される
    {
      code: `const Foo = ({ loading, name, label, text, title, message, description }) => <div>{loading && name}{loading && label}{loading && text}{loading && title}{loading && message}{loading && description}</div>`,
      errors: [{ message: errorMessage('name') }, { message: errorMessage('label') }, { message: errorMessage('text') }, { message: errorMessage('title') }, { message: errorMessage('message') }, { message: errorMessage('description') }],
    },
    // xxxName のように大文字始まりで終わる名称も検知される
    {
      code: `const Foo = ({ loading, userName, errorMessage, item }) => <div>{loading && userName}{loading ? errorMessage : null}{loading && item.shortDescription}</div>`,
      errors: [{ message: errorMessage('userName') }, { message: errorMessage('errorMessage') }, { message: errorMessage('item.shortDescription') }],
    },
    // xxx.name のようなプロパティアクセスも検知される
    {
      code: `const Foo = ({ loading, user }) => <div>{loading && user.name}{loading && user?.department?.fullName}</div>`,
      errors: [{ message: errorMessage('user.name') }, { message: errorMessage('user.department.fullName') }],
    },
    // 要素との切り替えは検知される
    {
      code: `const Foo = ({ isNew, label }) => <button>{isNew ? <Text>新規</Text> : label}</button>`,
      errors: [{ message: errorMessage('label') }],
    },
    // additionalTextVariableRegex: デフォルトの対象も引き続き検知される
    {
      code: `const Foo = ({ loading, translated }) => <div>{loading && translated.text}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$'] }],
      errors: [{ message: errorMessage('translated.text') }],
    },
    // additionalTextVariableRegex: 変数名にマッチする場合、文字列とみなして検知される
    {
      code: `const Foo = ({ loading, caption }) => <div>{loading && caption}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$'] }],
      errors: [{ message: errorMessage('caption') }],
    },
    {
      code: `const Foo = ({ loading, caption }) => <div>{loading ? caption : null}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$'] }],
      errors: [{ message: errorMessage('caption') }],
    },
    // additionalTextVariableRegex: 属性名は`.`つなぎで指定できる
    {
      code: `const Foo = ({ loading, user }) => <div>{loading && user.kana}</div>`,
      options: [{ additionalTextVariableRegex: ['\\.kana$'] }],
      errors: [{ message: errorMessage('user.kana') }],
    },
    // additionalTextVariableRegex: オプショナルチェーン・non-null assertion相当・thisも`.`つなぎとして扱う
    {
      code: `const Foo = ({ loading, user }) => <div>{loading && user?.department?.kana}{loading ? this.props.kana : <Icon />}</div>`,
      options: [{ additionalTextVariableRegex: ['\\.kana$'] }],
      errors: [{ message: errorMessage('user.department.kana') }, { message: errorMessage('this.props.kana') }],
    },
    // additionalTextVariableRegex: 経路全体を指定することもできる
    {
      code: `const Foo = ({ loading, user, group }) => <div>{loading && user.kana}{loading && group.kana}</div>`,
      options: [{ additionalTextVariableRegex: ['^user\\.kana$'] }],
      errors: [{ message: errorMessage('user.kana') }],
    },
    // additionalTextVariableRegex: 要素・何もレンダーされない値との切り替えは検知される
    {
      code: `const Foo = ({ loading, caption }) => <div>{loading ? caption : <Icon />}{loading ? '' : caption}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$'] }],
      errors: [{ message: errorMessage('caption') }, { message: errorMessage('caption') }],
    },
    // additionalTextVariableRegex: コンポーネントとの切り替えは種類が異なるため両方検知される
    {
      code: `const Foo = ({ loading, caption }) => <div>{loading ? caption : <Localizer id="x" defaultText="処理中" />}</div>`,
      options: [{ additionalTextVariableRegex: ['^caption$'] }],
      errors: [{ message: errorMessage('caption') }, { message: errorMessage('Localizer要素') }],
    },
    // Fragmentの直下にある場合も検知される
    {
      code: `const Foo = ({ loading }) => <>{loading && '処理中'}</>`,
      errors: [{ message: errorMessage('文字列リテラル') }],
    },
  ],
})
