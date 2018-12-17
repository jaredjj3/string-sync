import { Measure } from '../Measure';
import { first, get, last } from 'lodash';
import { IPosition } from '../../../../../@types/position';
export class Note {
  public static isBar(noteNote: any): boolean {
    return noteNote.duration.toLowerCase() === 'b';
  }

  public readonly graphic: any;

  public measure: Measure | undefined;
  public prev: Note | undefined | null;
  public next: Note | undefined | null;

  // Callers should not access the vexflow elements. Instead,
  // a method exposing and computing some aspect of the vexflow
  // element should be created.
  private readonly noteNote: any;
  private readonly tabNote: any;

  constructor(noteNote: any, tabNote: any, graphic: any) {
    this.noteNote = noteNote;
    this.tabNote = tabNote;
    this.graphic = graphic;
  }

  get durationTick(): number {
    return this.noteNote.getTicks().simplify().value();
  }

  public get isFirst(): boolean {
    return first(get(this.measure, 'notes', [])) === this;
  }

  public get isLast(): boolean {
    return last(get(this.measure, 'notes', [])) === this;
  }

  public get positions(): IPosition[] {
    const { positions } = this.tabNote;

    if (!positions) {
      return [];
    }

    return positions.map(({ fret, str }) => ({
      fret: parseInt(fret, 10),
      str: parseInt(str, 10)
    }));
  }

  public light(): void {
    this.setColor('red');
  }

  public unlight(): void {
    this.setColor('black');
  }

  private setColor(color: string): void {
    const paths = this.graphic.querySelectorAll('.vf-notehead path');
    paths.forEach(path => {
      path.setAttribute('stroke', color);
      path.setAttribute('fill', color);
    });
  }
}
