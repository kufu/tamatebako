import type { StoryObj } from '@storybook/react'
import type { PlayFunction } from 'storybook/internal/types'
import { screen } from 'storybook/test'

export interface FocusIndicatorConfig {
  /**
   * Pseudo States Addonの設定をカスタマイズする場合
   */
  pseudoOptions?: {
    focus?: boolean
    focusVisible?: boolean
    focusWithin?: boolean
    rootSelector?: string
  }
}

/**
 * アクセシビリティ簡易チェックリストの「フォーカスリングの四辺がすべて表示されている」を満たすかどうかチェックするためのStoryテンプレート
 * このテンプレートを使用するとフォーカス状態を擬似的に再現してくれます。
 *
 * ## 使い方
 *
 * ```typescript
 * import { focusIndicatorTemplate } from 'storybook-focus-indicator'
 *
 * export const Default: Story = { ... }
 * export const FocusIndicatorTest: Story = focusIndicatorTemplate(Default)
 * ```
 *
 * ## カスタマイズ
 *
 * ```typescript
 * export const FocusIndicatorTest: Story = focusIndicatorTemplate(Default, {
 *   pseudoOptions: {
 *     rootSelector: '#custom-root' // カスタムルート要素を指定
 *   }
 * })
 * ```
 *
 * @param defaultStory フォーカスインジゲーターのテストに使用したい、ベースとなるstory
 * @param config フォーカステストの設定
 * @returns フォーカステスト用のStory
 */
export const focusIndicatorTemplate = <TStory>(
  defaultStory: TStory,
  config: FocusIndicatorConfig = {}
): TStory => {
  const pseudoOptions = config.pseudoOptions ?? {}

  return {
    ...defaultStory,
    parameters: {
      // fixme: TStory extends StoryObj<any>にできればより型安全になるが、うまくいかないためasでキャストしている
      ...(defaultStory as StoryObj<any>).parameters,
      // Storybook Pseudo States Addonの設定
      // https://storybook.js.org/addons/storybook-addon-pseudo-states
      pseudo: {
        ...(defaultStory as StoryObj<any>).parameters?.pseudo,
        focus: pseudoOptions.focus ?? true,
        focusVisible: pseudoOptions.focusVisible ?? true,
        focusWithin: pseudoOptions.focusWithin ?? true,
        // Dialogなど、#storybook-rootに配置されないコンポーネントでもチェックできるように、bodyを指定
        rootSelector: pseudoOptions.rootSelector ?? 'body',
      },
    },
    play: async (args: Parameters<PlayFunction>[0]) => {
      // defaultStoryのplay関数があれば実行する
      await (defaultStory as StoryObj<any>).play?.(args)

      // 最初のリンクにフォーカスを当てるためのplay function
      try {
        const link = await screen.findByRole('link')
        link.focus()
      } catch {
        // タイムアウトした場合はここに来るが、何もしないことでエラーを回避
        console.log('リンクが出現しなかったため、フォーカスをスキップしました')
      }

      // 最初のcomboboxにフォーカスを当てるためのplay function
      try {
        const combobox = await screen.findByRole('combobox')
        combobox.focus()
      } catch {
        // タイムアウトした場合はここに来るが、何もしないことでエラーを回避
        console.log('コンボボックスが出現しなかったため、フォーカスをスキップしました')
      }
    },
  } as TStory
}
