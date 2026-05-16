import { describe, expect, it, vi } from 'vitest'
import { EMBEDDING_DIMS, runSeed, type SeedDocument, type SeedSupabaseClient } from '../../supabase/seeds/seed_runner'

type Filter = {
  column: string
  operator?: string
  type: 'eq' | 'not'
  value: unknown
}

type CoverageSnapshot = {
  total: number
  withEmbedding: number
}

const vector = Array.from({ length: EMBEDDING_DIMS }, () => 0.1)

const silentLogger = {
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
}

const doc: SeedDocument = {
  category: 'shipping',
  raw_text: '## Politica de envio DHL\n\nEl envio por DHL se prepara con cobertura nacional y seguimiento.',
  source_filename: 'shipping.md',
  source_id: 'politica-envios-detallada-v1',
  source_type: 'policy_doc',
  title: 'Politica de envio DHL',
}

class FakeSupabase implements SeedSupabaseClient {
  coverageCalls = 0
  coverageSnapshots: CoverageSnapshot[]
  deactivateCalls: Filter[][] = []
  insertError: string | null = null
  insertedRows: unknown[][] = []
  insertedIds: string[] = ['new-row-1']
  operations: string[] = []

  constructor(snapshots: CoverageSnapshot[] = [{ total: 1, withEmbedding: 1 }]) {
    this.coverageSnapshots = snapshots
  }

  from(table: string) {
    return new FakeQuery(this, table)
  }

  nextCoverageCount(hasEmbeddingFilter: boolean) {
    const snapshotIndex = Math.min(Math.floor(this.coverageCalls / 2), this.coverageSnapshots.length - 1)
    const snapshot = this.coverageSnapshots[snapshotIndex]

    if (!snapshot) {
      throw new Error('Missing fake coverage snapshot')
    }

    this.coverageCalls += 1
    this.operations.push('select-count')
    return hasEmbeddingFilter ? snapshot.withEmbedding : snapshot.total
  }
}

class FakeQuery implements PromiseLike<{ count?: number; data?: unknown; error?: { message: string } | null }> {
  private filters: Filter[] = []
  private operation: 'insert' | 'select' | 'update' | null = null
  private payload: unknown

  constructor(
    private readonly supabase: FakeSupabase,
    private readonly table: string,
  ) {}

  eq(column: string, value: unknown) {
    this.filters.push({ column, type: 'eq', value })
    return this
  }

  insert(value: unknown) {
    this.operation = 'insert'
    this.payload = Array.isArray(value) ? value : [value]
    return this
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push({ column, operator, type: 'not', value })
    return this
  }

  select(_columns?: string, _options?: Record<string, unknown>) {
    if (!this.operation) {
      this.operation = 'select'
    }

    return this
  }

  update(value: unknown) {
    this.operation = 'update'
    this.payload = value
    return this
  }

  then<TResult1 = { count?: number; data?: unknown; error?: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { count?: number; data?: unknown; error?: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }

  private execute() {
    expect(this.table).toBe('store_knowledge')

    if (this.operation === 'insert') {
      this.supabase.operations.push('insert')
      this.supabase.insertedRows.push(this.payload as unknown[])

      if (this.supabase.insertError) {
        return { data: null, error: { message: this.supabase.insertError } }
      }

      return {
        data: this.supabase.insertedIds.map((id) => ({ id })),
        error: null,
      }
    }

    if (this.operation === 'update') {
      this.supabase.operations.push('update')
      this.supabase.deactivateCalls.push(this.filters)
      return { data: null, error: null }
    }

    const hasEmbeddingFilter = this.filters.some(
      (filter) => filter.type === 'not' && filter.column === 'embedding' && filter.operator === 'is' && filter.value === null,
    )

    return {
      count: this.supabase.nextCoverageCount(hasEmbeddingFilter),
      data: null,
      error: null,
    }
  }
}

describe('store knowledge seed runner activation safety', () => {
  it('does not deactivate current active rows when embedding generation fails', async () => {
    const fakeSupabase = new FakeSupabase()

    await expect(
      runSeed({
        deps: {
          generateEmbedding: async () => null,
          logger: silentLogger,
          sleep: async () => undefined,
          supabase: fakeSupabase,
        },
        docs: [doc],
      }),
    ).rejects.toThrow(/Knowledge seed failed safety checks/)

    expect(fakeSupabase.insertedRows).toHaveLength(0)
    expect(fakeSupabase.deactivateCalls).toHaveLength(0)
  })

  it('fails non-zero on replacement insert errors without deactivating current active rows', async () => {
    const fakeSupabase = new FakeSupabase()
    fakeSupabase.insertError = 'insert failed'

    await expect(
      runSeed({
        deps: {
          generateEmbedding: async () => vector,
          logger: silentLogger,
          sleep: async () => undefined,
          supabase: fakeSupabase,
        },
        docs: [doc],
      }),
    ).rejects.toThrow(/Knowledge seed failed safety checks/)

    expect(fakeSupabase.insertedRows).toHaveLength(1)
    expect(fakeSupabase.deactivateCalls).toHaveLength(0)
  })

  it('inserts active replacement chunks before deactivating previous active rows', async () => {
    const fakeSupabase = new FakeSupabase()

    await expect(
      runSeed({
        deps: {
          generateEmbedding: async () => vector,
          logger: silentLogger,
          sleep: async () => undefined,
          supabase: fakeSupabase,
        },
        docs: [doc],
      }),
    ).resolves.toMatchObject({
      activeRows: 1,
      activeWithEmbedding: 1,
      docsFailed: 0,
      docsOk: 1,
    })

    expect(fakeSupabase.operations.indexOf('insert')).toBeGreaterThan(-1)
    expect(fakeSupabase.operations.indexOf('update')).toBeGreaterThan(fakeSupabase.operations.indexOf('insert'))
    expect(fakeSupabase.insertedRows[0]).toEqual([
      expect.objectContaining({
        embedding: vector,
        is_active: true,
        source_id: 'politica-envios-detallada-v1',
      }),
    ])
    expect(fakeSupabase.deactivateCalls[0]).toEqual(
      expect.arrayContaining([
        { column: 'source_id', type: 'eq', value: 'politica-envios-detallada-v1' },
        { column: 'is_active', type: 'eq', value: true },
        { column: 'id', operator: 'in', type: 'not', value: '(new-row-1)' },
      ]),
    )
  })

  it('fails when post-run active embedded coverage is incomplete', async () => {
    const fakeSupabase = new FakeSupabase([
      { total: 1, withEmbedding: 1 },
      { total: 2, withEmbedding: 1 },
    ])

    await expect(
      runSeed({
        deps: {
          generateEmbedding: async () => vector,
          logger: silentLogger,
          sleep: async () => undefined,
          supabase: fakeSupabase,
        },
        docs: [doc],
      }),
    ).rejects.toThrow(/Knowledge seed failed safety checks/)

    expect(fakeSupabase.insertedRows).toHaveLength(1)
    expect(fakeSupabase.deactivateCalls).toHaveLength(1)
  })
})
