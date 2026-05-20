import * as migration_20260518_075939 from './20260518_075939'

export const migrations = [
  {
    up: migration_20260518_075939.up,
    down: migration_20260518_075939.down,
    name: '20260518_075939',
  },
]
