/// <summary> Direction to source of cell value, used during traceback. </summary>
export class SourceDirection {
  // This is coded as a set of consts rather than using an enum.  Enums are ints and 
  // referring to these in the code requires casts to and from (sbyte), which makes
  // the code more difficult to read.

  
  /// <summary> During traceback, stop at this cell (used by SmithWaterman). </summary>
  static readonly stop: number = 0;

  /// <summary> Source was up and left from current cell. </summary>
  static readonly diagonal: number = 1;

  /// <summary> Source was up from current cell. </summary>
  static readonly up: number = 2;

  /// <summary> Source was left of current cell. </summary>
  static readonly left: number = 3;

  /// <summary> During traceback, stop at this cell. </summary>
  static readonly block: number = -2;

  /// <summary> Error code, if cell has code Invalid error has occurred. </summary>
  static readonly invalid: number = -3;
  
}
