import * as migration_20260515_220702 from './20260515_220702';

export const migrations = [
  {
    up: migration_20260515_220702.up,
    down: migration_20260515_220702.down,
    name: '20260515_220702'
  },
];
