import { IAlignedSequence } from "./i-aligned-sequence";
import { ISequence } from "../sequence/sequence";

/// <summary>
/// An ISequenceAlignment is the result of running an alignment algorithm on a set 
/// of two or more sequences. This could be a pairwise alignment, an MSA (multiple 
/// sequence alignment), or an overlap alignment of the sort needed for sequence
/// assembly.
/// </summary>
/// <remarks>
/// this is just a storage object – it’s up to an algorithm object to fill it in.
/// for efficiency’s sake, we are leaving it up to calling code to keep track of the 
/// input sequences, if desired.
/// </remarks>
export interface ISequenceAlignment {
  /// <summary>
  /// Gets list of the IAlignedSequences which contains aligned sequences with score, offset and consensus .
  /// </summary>
  alignedSequences: IAlignedSequence[];

  /// <summary>
  /// Gets list of sequences.
  /// </summary>
  sequences: ISequence[];

  /// <summary>
  /// Gets any additional information about the Alignment.
  /// </summary>
  metadata: object;

}