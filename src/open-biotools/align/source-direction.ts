/**
 * @description Direction to source of cell value, used during traceback.
 * This is coded as a set of consts rather than using an enum.  Enums are ints and 
 * referring to these in the code requires casts to and from (sbyte), which makes
 * the code more difficult to read.
 */
export class SourceDirection {
  
  /**
   * @description During traceback, stop at this cell (used by SmithWaterman).
   */
  static readonly stop: number = 0;

  /**
   * @description Source was up and left from current cell.
   */
  static readonly diagonal: number = 1;

  /**
   * @description Source was up from current cell.
   */
  static readonly up: number = 2;

  /**
   * @description Source was left of current cell.
   */
  static readonly left: number = 3;

  /**
   * @description During traceback, stop at this cell.
   */
  static readonly block: number = -2;

  /**
   * @description Error code, if cell has code Invalid error has occurred.
   */
  static readonly invalid: number = -3;
  
}
