import { ISequence } from "../sequence/sequence";

/// <summary>
/// Interface to hold single aligned unit of alignment.
/// </summary>
export interface IAlignedSequence {
  /// <summary>
  /// Gets information about the AlignedSequence, like score, offsets, consensus, etc..
  /// </summary>
  metadata: object;

  /// <summary>
  /// Gets list of sequences, aligned as part of an alignment.
  /// </summary>
  sequences: ISequence[];
}
