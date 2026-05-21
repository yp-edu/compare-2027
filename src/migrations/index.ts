import * as migration_20260521_000421 from './20260521_000421'

export const migrations = [
  {
    up: migration_20260521_000421.up,
    down: migration_20260521_000421.down,
    name: '20260521_000421',
  },
]
