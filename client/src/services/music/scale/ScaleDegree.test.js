import { Scale, ScaleDegree } from './';
import { Note, scales } from 'services';
import { times, sample } from 'lodash';

const randomScale = () => {
  const key = sample(Note.ALL_LITERALS);
  const scaleName = sample(Object.keys(scales));
  return Scale.for(key, scaleName);
};

test('ScaleDegree.constructor', () => {
  ScaleDegree.LITERALS.forEach(literal => {
    const scale = randomScale()
    const scaleDegree = new ScaleDegree(literal, scale);
    expect(scaleDegree.literal).toBe(literal);
    expect(scaleDegree.scale).toBe(scale);
  });
});

test('ScaleDegree.constructor disallows invalid literals', () => {
  ['1%', 'b4', 'b1', 'foo', 'bar'].forEach(literal => {
    const scale = randomScale();
    expect(() => new ScaleDegree(literal, scale)).toThrow();
  });
});

test('ScaleDegree.constructor makes the scale property immutable', () => {
  const scale = randomScale();
  const scaleDegree = new ScaleDegree('1', scale);
  expect(() => scaleDegree.scale = randomScale()).toThrow();
});

test('ScaleDegree.prototype.key returns the scale key', () => {
  const scale = randomScale();
  const scaleDegree = new ScaleDegree('1', scale);
  expect(scaleDegree.key).toBe(scale.key);

  const key = 'hello world'
  scale.key = key;
  expect(scaleDegree.key).toBe(scale.key);
});