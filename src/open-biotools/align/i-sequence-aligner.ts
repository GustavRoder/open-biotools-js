import { IConsensusResolver } from './i-consensus-resolver';
import { SimilarityMatrix } from './similarity-matrix';
import { ISequence } from '../sequence/sequence';
import { IPairwiseSequenceAlignment } from './i-pairwise-sequence-alignment';



/**
 * A sequence aligner is an algorithm which takes N sequences as input and produces an 
 * alignment of the sequences as output.
 */
export interface ISequenceAligner {
  
  /**
   * @description Gets the name of the sequence alignment algorithm being
   * implemented. This is intended to give developer
   * some information of the alignment algorithm.
   */
  name: string;

  /**
   * @description Gets the description of the sequence alignment algorithm being
   * implemented.This is intended to give developer
   * some information of the alignment algorithm.
   */
  description: string;

  /**
   * @description Gets or sets the object that will be used to compute the alignment's consensus.
   */
  consensusResolver: IConsensusResolver;

  /**
   * @description Gets or sets value of similarity matrix
   * The similarity matrix determines the score for any possible pair
   * of symbols that are encountered at a common location across the 
   * sequences being aligned.
   */
  similarityMatrix: SimilarityMatrix;

  /**
   * @description Gets or sets value of GapOpenCost
   * The GapOpenCost is the cost of inserting a gap character into a sequence.
   * In the linear gap model, all gaps use this cost. In the affine gap
   * model, the GapExtensionCost below is also used.
   */
  gapOpenCost: number;

  /**
   * @description Gets or sets value of GapExtensionCost 
   * The GapExtensionCost is the cost of extending an already existing gap.
   * This is used for the affine gap model, not used for the linear gap model.
   */
  gapExtensionCost: number;

  /**
   * @description AlignSimple aligns the set of input sequences using the linear gap model (one gap penalty), 
   * and returns the best alignment found.
   * @param sequence1 Sequence 1
   * @param sequence2 Sequence 2
   * @param localSimilarityMatrix Similarity matrix
   * @param gapPenalty Gap open penalty
   * @returns List of sequence alignments.
   */
  alignSimple(sequence1: ISequence, sequence2: ISequence, localSimilarityMatrix: SimilarityMatrix, gapPenalty: number): IPairwiseSequenceAlignment[]

  /**
   * @description Align aligns the set of input sequences using the affine gap model (gap open and gap extension penalties)
   * and returns the best alignment found.
   * @param inputA Sequence 1
   * @param inputB Sequence 2
   * @param localSimilarityMatrix Similarity matrix
   * @param gapOpenPenalty Gap open penalty
   * @param gapExtensionPenalty Gap extension penalty
   * @returns List of sequence alignments.
   */
  align(inputA: ISequence, inputB: ISequence, localSimilarityMatrix: SimilarityMatrix, gapOpenPenalty: number, gapExtensionPenalty: number): IPairwiseSequenceAlignment[];

}