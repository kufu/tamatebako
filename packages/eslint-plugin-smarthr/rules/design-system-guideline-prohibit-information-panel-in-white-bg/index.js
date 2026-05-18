/**
 * InformationPanelを白背景に配置することを禁止するルール
 *
 * SmartHR Design System ガイドラインに基づき、InformationPanelを白背景に直接配置することを防ぎます。
 *
 * 検出パターン:
 * 1. Base内にInformationPanel
 * 2. Dialog内にInformationPanel（contentBgColorが未指定またはWHITE）
 *
 * 例外:
 * - BaseColumn内にある場合（BaseColumnは背景色を持つため）
 * - DialogでcontentBgColorがWHITE以外の場合
 *
 * @see https://smarthr.design/products/components/information-panel/
 */

module.exports = {
  meta: {
    type: 'suggestion',
    messages: {
      inWhiteBg: 'InformationPanelを白背景に配置しないでください。Stack/Clusterなどレイアウトコンポーネントで包むか、BaseColumnを使用、またはDialog使用時はcontentBgColorを"COLUMN"や"OVER_BACKGROUND"に設定してください。詳細: https://smarthr.design/products/components/information-panel/',
    },
    schema: [],
  },

  create(context) {
    /**
     * InformationPanelから親方向に探索し、白背景コンテナをチェック
     * @param {Node} node - InformationPanelのノード
     * @param {string|RegExp} targetPattern - 検出対象のコンポーネント名パターン
     * @returns {{ ok: boolean, targetNode?: Node }} 検出結果
     */
    const checkWhiteBg = (node, targetPattern) => {
      let current = node.parent
      while (current) {
        if (current.type === 'JSXElement') {
          const name = current.openingElement.name.name

          // BaseColumnが見つかったらOK（探索終了）
          if (name === 'BaseColumn') {
            return { ok: true }
          }

          // targetパターンにマッチするか確認
          const isTarget = typeof targetPattern === 'string'
            ? name === targetPattern
            : targetPattern.test(name)

          if (isTarget) {
            return { ok: false, targetNode: current }
          }
        }
        current = current.parent
      }
      return { ok: true } // 何も見つからない場合はOK
    }

    return {
      // Base以下のInformationPanel
      'JSXElement[openingElement.name.name="Base"] JSXElement[openingElement.name.name="InformationPanel"]'(node) {
        const result = checkWhiteBg(node, 'Base')
        if (!result.ok) {
          context.report({ node, messageId: 'inWhiteBg' })
        }
      },

      // Dialog以下のInformationPanel
      'JSXElement[openingElement.name.name=/Dialog$/] JSXElement[openingElement.name.name="InformationPanel"]'(node) {
        const result = checkWhiteBg(node, /Dialog$/)
        if (!result.ok) {
          // contentBgColor属性をチェック
          const attr = result.targetNode.openingElement.attributes.find(
            a => a.type === 'JSXAttribute' && a.name.name === 'contentBgColor'
          )
          const bgColor = attr?.value?.value

          // contentBgColorが未指定またはWHITEの場合のみエラー
          if (!bgColor || bgColor === 'WHITE') {
            context.report({ node, messageId: 'inWhiteBg' })
          }
        }
      }
    }
  }
}
