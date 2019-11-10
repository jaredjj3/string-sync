import { KeyGetter, UniqueIdentifierGetter, MissingValueGetter } from './types';
import { uniqBy, keyBy } from 'lodash';

interface Getters<V, M> {
  getKey: KeyGetter<V>;
  getUniqueIdentifier: UniqueIdentifierGetter<V>;
  getMissingValue: MissingValueGetter<M>;
}

export const alignOneToOne = <V, M>(
  keys: Array<number | string>,
  values: V[],
  getters: Getters<V, M>
): Array<V | M> => {
  const uniqValues = uniqBy(values, getters.getUniqueIdentifier);
  const valuesByKey = keyBy(uniqValues, getters.getKey);

  const len = keys.length;
  const aligned = new Array(len);
  for (let ndx = 0; ndx < len; ndx++) {
    const key = keys[ndx];
    const value = valuesByKey[key] || getters.getMissingValue(key);
    aligned[ndx] = value;
  }

  return aligned;
};
