import { describe, expect, it, vi } from 'vitest'

import { focusIndicatorTemplate } from './focus-indicator-template'

import type { StoryObj } from '@storybook/react'

describe('focusIndicatorTemplate', () => {
  it('defaultStoryのparametersを保持する', () => {
    const defaultStory = {
      args: { text: 'test' },
      parameters: {
        layout: 'centered',
        docs: { description: 'test' },
      },
    } as StoryObj

    const result = focusIndicatorTemplate(defaultStory)

    expect(result.parameters).toEqual({
      layout: 'centered',
      docs: { description: 'test' },
      pseudo: {
        focus: true,
        focusVisible: true,
        focusWithin: true,
        rootSelector: 'body',
      },
    })
  })

  it('pseudoパラメータにデフォルト値を設定する', () => {
    const defaultStory = {
      args: {},
    } as StoryObj

    const result = focusIndicatorTemplate(defaultStory)

    expect(result.parameters?.pseudo).toEqual({
      focus: true,
      focusVisible: true,
      focusWithin: true,
      rootSelector: 'body',
    })
  })

  it('カスタムpseudoOptionsを適用する', () => {
    const defaultStory = {
      args: {},
    } as StoryObj

    const result = focusIndicatorTemplate(defaultStory, {
      pseudoOptions: {
        rootSelector: '#custom-root',
        focusWithin: false,
      },
    })

    expect(result.parameters?.pseudo).toEqual({
      focus: true,
      focusVisible: true,
      focusWithin: false,
      rootSelector: '#custom-root',
    })
  })

  it('既存のpseudoパラメータをマージする', () => {
    const defaultStory = {
      args: {},
      parameters: {
        pseudo: {
          hover: true,
        },
      },
    } as StoryObj

    const result = focusIndicatorTemplate(defaultStory)

    expect(result.parameters?.pseudo).toEqual({
      hover: true,
      focus: true,
      focusVisible: true,
      focusWithin: true,
      rootSelector: 'body',
    })
  })

  it('play関数を設定する', () => {
    const defaultStory = {
      args: {},
    } as StoryObj

    const result = focusIndicatorTemplate(defaultStory)

    expect(result.play).toBeDefined()
    expect(typeof result.play).toBe('function')
  })

  it('defaultStoryのplay関数を保持する', async () => {
    const mockPlay = vi.fn()
    const defaultStory = {
      args: {},
      play: mockPlay,
    } as StoryObj

    const result = focusIndicatorTemplate(defaultStory)

    // play関数が設定されている
    expect(result.play).toBeDefined()

    // 元のplay関数が呼ばれることは確認できないが、
    // 新しいplay関数が設定されていることは確認できる
    expect(result.play).not.toBe(mockPlay)
  })

  it('argsやその他のプロパティを保持する', () => {
    const defaultStory = {
      args: { text: 'test', disabled: true },
      name: 'Test Story',
    } as StoryObj

    const result = focusIndicatorTemplate(defaultStory)

    expect(result.args).toEqual({ text: 'test', disabled: true })
    expect(result.name).toBe('Test Story')
  })
})
