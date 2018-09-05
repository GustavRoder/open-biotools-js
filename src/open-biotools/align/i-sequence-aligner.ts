import { IConsensusResolver } from './i-consensus-resolver';
import { SimilarityMatrix } from './similarity-matrix';
import { ISequenceAlignment } from './i-sequence-alignment';
import { ISequence } from '../sequence/sequence';



/// <summary>
/// A sequence aligner is an algorithm which takes N sequences as input and produces an 
/// alignment of the sequences as output.
/// </summary>
export interface ISequenceAligner {
  
  /// <summary>
  /// Gets the name of the sequence alignment algorithm being
  /// implemented. This is intended to give developer
  /// some information of the alignment algorithm.
  /// </summary>
  name: string;

  /// <summary>
  /// Gets the description of the sequence alignment algorithm being
  /// implemented.This is intended to give developer
  /// some information of the alignment algorithm.
  /// </summary>
  description: string;

  /// <summary>
  /// Gets or sets the object that will be used to compute the alignment's consensus.
  /// </summary>
  consensusResolver: IConsensusResolver;

  /// <summary>
  /// Gets or sets value of similarity matrix
  /// The similarity matrix determines the score for any possible pair
  /// of symbols that are encountered at a common location across the 
  /// sequences being aligned.
  /// </summary>
  similarityMatrix: SimilarityMatrix;

  /// <summary>
  /// Gets or sets value of GapOpenCost
  /// The GapOpenCost is the cost of inserting a gap character into 
  /// a sequence.
  /// </summary>
  /// <remarks>
  /// In the linear gap model, all gaps use this cost. In the affine gap
  /// model, the GapExtensionCost below is also used.
  /// </remarks>
  gapOpenCost: number;

  /// <summary>
  /// Gets or sets value of GapExtensionCost 
  /// The GapExtensionCost is the cost of extending an already existing gap.
  /// This is used for the affine gap model, not used for the linear gap model.
  /// </summary>
  gapExtensionCost: number;

  /// <summary>
  /// AlignSimple aligns the set of input sequences using the linear gap model (one gap penalty), 
  /// and returns the best alignment found.
  /// </summary>
  /// <param name="inputSequences">The sequences to align.</param>
  /// <returns>List of sequence alignments.</returns>
  alignSimple(inputSequences: ISequence[]): ISequenceAlignment[];

  /// <summary>
  /// Align aligns the set of input sequences using the affine gap model (gap open and gap extension penalties)
  /// and returns the best alignment found.
  /// </summary>
  /// <param name="inputSequences">The sequences to align.</param>
  /// <returns>List of sequence alignments.</returns>
  align(inputSequences: ISequence[]): ISequenceAlignment[];

}