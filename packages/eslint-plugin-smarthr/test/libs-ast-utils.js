const { containsNode, containsAwait } = require('../libs/ast-utils')

describe('containsNode', () => {
  // buildAncestorChainがcase句のbodyとしてconsequent配列そのものを渡すため、
  // targetはASTノードだけでなく配列の場合もある
  const innerConsequent = [{ type: 'ExpressionStatement' }]
  const parent = {
    type: 'BlockStatement',
    body: [
      {
        type: 'SwitchStatement',
        cases: [{ type: 'SwitchCase', consequent: innerConsequent }],
      },
    ],
  }

  it('ネストしたノードを見つける', () => {
    expect(containsNode(parent, innerConsequent[0])).toBe(true)
  })

  it('ネストした配列自身をtargetとして見つける', () => {
    expect(containsNode(parent, innerConsequent)).toBe(true)
  })

  it('parentとtargetが同一の場合はtrueを返す', () => {
    expect(containsNode(innerConsequent, innerConsequent)).toBe(true)
  })

  it('含まれていないノードはfalseを返す', () => {
    expect(containsNode(parent, { type: 'ExpressionStatement' })).toBe(false)
  })

  it('含まれていない配列はfalseを返す', () => {
    expect(containsNode(parent, [{ type: 'ExpressionStatement' }])).toBe(false)
  })
})

describe('containsNodeType（containsAwait経由）', () => {
  it('配列の要素内にあるノード型を見つける', () => {
    const node = {
      type: 'ArrayExpression',
      elements: [{ type: 'Literal' }, { type: 'AwaitExpression' }],
    }
    expect(containsAwait(node)).toBe(true)
  })

  it('関数スコープを超えて探索しない', () => {
    const node = {
      type: 'CallExpression',
      arguments: [
        {
          type: 'ArrowFunctionExpression',
          body: { type: 'AwaitExpression' },
        },
      ],
    }
    expect(containsAwait(node)).toBe(false)
  })

  it('含まれていない場合はfalseを返す', () => {
    expect(containsAwait({ type: 'ArrayExpression', elements: [{ type: 'Literal' }] })).toBe(false)
  })
})

// 配列の子ノードを二重走査すると走査量が2^nで増加する（#1536）
describe('走査量がネストの深さに対して線形であること', () => {
  const DEPTH = 20
  const VISIT_LIMIT = DEPTH * 10

  // elementsをゲッターにして、ノードを1回訪問するたびに1回カウントする。
  // 上限を超えたら打ち切ることで、2^n回の走査を待たずに失敗する
  const buildCountingTree = (depth) => {
    const counter = { visits: 0 }

    const createNode = (child) => {
      const node = { type: 'ArrayExpression' }
      Object.defineProperty(node, 'elements', {
        enumerable: true,
        get() {
          counter.visits += 1
          if (counter.visits > VISIT_LIMIT) {
            throw new Error(`走査回数が上限(${VISIT_LIMIT})を超えました`)
          }
          return [child]
        },
      })
      return node
    }

    let node = { type: 'Literal', value: 0 }
    for (let i = 0; i < depth; i++) {
      node = createNode(node)
    }

    return { node, counter }
  }

  it('containsNodeTypeの走査量がノード数に比例する', () => {
    const { node, counter } = buildCountingTree(DEPTH)

    expect(containsAwait(node)).toBe(false)
    expect(counter.visits).toBeLessThanOrEqual(DEPTH * 2)
  })

  it('containsNodeの走査量がノード数に比例する', () => {
    const { node, counter } = buildCountingTree(DEPTH)

    expect(containsNode(node, { type: 'Literal', value: 0 })).toBe(false)
    expect(counter.visits).toBeLessThanOrEqual(DEPTH * 2)
  })
})
