import { getCommandCompletionContext } from '../src/completions/executeCompletions.ts'
import type { TestCase } from './testHarness.ts'

const tests: TestCase[] = [
  {
    name: 'completion context recognizes bracketed and quoted tags input values',
    run: () => {
      const panels = [{ name: 'entity1', tagsInput: '["hoge, fuga", "piyo"]' }]
      const context = getCommandCompletionContext('execute as @e[tag=', 'execute as @e[tag='.length, panels)

      if (!context.items.some((item) => item.label === 'hoge, fuga' && item.insertText.includes('"hoge, fuga"'))) {
        throw new Error('expected quoted tag completion from bracketed tags input')
      }

      if (!context.items.some((item) => item.label === 'piyo')) {
        throw new Error('expected plain tag completion from bracketed tags input')
      }
    },
  },
  {
    name: 'completion context suggests negated name and tag values',
    run: () => {
      const panels = [{ name: 'entity1', tagsInput: 'alpha, beta' }]
      const nameContext = getCommandCompletionContext('execute as @e[name=!', 'execute as @e[name=!'.length, panels)
      const tagContext = getCommandCompletionContext('execute as @e[tag=!', 'execute as @e[tag=!'.length, panels)

      if (!nameContext.items.some((item) => item.label === '!entity1')) {
        throw new Error('expected negated name completion to be suggested')
      }

      if (!tagContext.items.some((item) => item.label === '!alpha')) {
        throw new Error('expected negated tag completion to be suggested')
      }
    },
  },
  {
    name: 'completion context allows closing an empty tag selector value',
    run: () => {
      const context = getCommandCompletionContext('execute as @e[tag=', 'execute as @e[tag='.length, [])

      if (!context.items.some((item) => item.insertText === '@e[tag=]')) {
        throw new Error('expected empty tag selector completion to be closable')
      }
    },
  },
  {
    name: 'completion context quotes literal selector values that start with bang',
    run: () => {
      const panels = [{ name: '!bang', tagsInput: '["!danger"]' }]
      const nameContext = getCommandCompletionContext('execute as @e[name=', 'execute as @e[name='.length, panels)
      const tagContext = getCommandCompletionContext('execute as @e[tag=', 'execute as @e[tag='.length, panels)

      if (!nameContext.items.some((item) => item.label === '!bang' && item.insertText === '@e[name="!bang"')) {
        throw new Error('expected literal bang-prefixed name completion to be quoted')
      }

      if (nameContext.items.some((item) => item.label === '!!bang')) {
        throw new Error('did not expect double-bang display labels for literal bang-prefixed names')
      }

      if (!tagContext.items.some((item) => item.label === '!danger' && item.insertText === '@e[tag="!danger"')) {
        throw new Error('expected literal bang-prefixed tag completion to be quoted')
      }
    },
  },
  {
    name: 'completion context waits for a space after execute',
    run: () => {
      const context = getCommandCompletionContext('execute', 'execute'.length, [])

      if (context.items.length > 0) {
        throw new Error('did not expect suggestions before typing a space after execute')
      }
    },
  },
  {
    name: 'completion context only replaces text up to the cursor',
    run: () => {
      const input = 'execute a run'
      const cursor = 'execute a'.length
      const context = getCommandCompletionContext(input, cursor, [])
      const completion = context.items.find((item) => item.insertText === 'as')

      if (!completion) {
        throw new Error('expected as completion to be available')
      }

      const next = input.slice(0, context.rangeStart) + completion.insertText + input.slice(context.rangeEnd)
      if (next !== 'execute as run') {
        throw new Error(`unexpected completion result: ${next}`)
      }
    },
  },
  {
    name: 'completion context waits for a space after a finished subcommand',
    run: () => {
      const context = getCommandCompletionContext('execute as', 'execute as'.length, [])

      if (context.items.length > 0) {
        throw new Error('did not expect selector suggestions before typing a space after execute as')
      }
    },
  },
  {
    name: 'completion context shows selector suggestions after execute as and a space',
    run: () => {
      const context = getCommandCompletionContext('execute as ', 'execute as '.length, [])
      const labels = context.items.map((item) => item.label)

      if (!labels.includes('@s')) {
        throw new Error('expected selector suggestions after execute as and a trailing space')
      }
    },
  },
  {
    name: 'completion context keeps bare selector tokens active for selector arguments',
    run: () => {
      const context = getCommandCompletionContext('execute as @s', 'execute as @s'.length, [])
      const labels = context.items.map((item) => item.label)

      if (!labels.includes('@s[...]')) {
        throw new Error('expected selector argument completion after a bare selector token')
      }

      if (labels.includes('@s')) {
        throw new Error('did not expect the same bare selector to be suggested again after it was completed')
      }

      if (labels.includes('as')) {
        throw new Error('did not expect next-step subcommand suggestions before typing a space after a bare selector')
      }
    },
  },
  {
    name: 'completion context keeps selector tokens active at the end',
    run: () => {
      const context = getCommandCompletionContext('execute as @', 'execute as @'.length, [])
      const labels = context.items.map((item) => item.label)

      if (!labels.includes('@s')) {
        throw new Error('expected selector token suggestions while editing a selector')
      }
    },
  },
]

export default tests
