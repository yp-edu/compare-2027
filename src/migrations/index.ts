import * as migration_20260515_220702 from './20260515_220702'
import * as migration_20260516_062348 from './20260516_062348'
import * as migration_20260516_120000 from './20260516_120000'

export const migrations = [
  {
    up: migration_20260515_220702.up,
    down: migration_20260515_220702.down,
    name: '20260515_220702',
  },
  {
    up: migration_20260516_062348.up,
    down: migration_20260516_062348.down,
    name: '20260516_062348',
  },
  {
    up: migration_20260516_120000.up,
    down: migration_20260516_120000.down,
    name: '20260516_120000',
  },
]
