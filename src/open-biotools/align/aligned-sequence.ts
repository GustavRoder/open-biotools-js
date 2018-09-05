import { IAlignedSequence } from "./i-aligned-sequence";
import { ISequence } from '../sequence/sequence';

/// <summary>
/// AlignedSequence is a class containing the single aligned unit of alignment.
/// </summary>
export class AlignedSequence implements IAlignedSequence {
  metadata: object;
  sequences: ISequence[];

  /// <summary>
  /// Initializes a new instance of the AlignedSequence class.
  /// </summary>
  constructor() {
    this.metadata = {};
    this.sequences = [];
  }
}
