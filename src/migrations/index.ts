import * as migration_20260518_075939 from './20260518_075939';
import * as migration_20260520_230707 from './20260520_230707';

export const migrations = [
  {
    up: migration_20260518_075939.up,
    down: migration_20260518_075939.down,
    name: '20260518_075939',
  },
  {
    up: migration_20260520_230707.up,
    down: migration_20260520_230707.down,
    name: '20260520_230707'
  },
];
