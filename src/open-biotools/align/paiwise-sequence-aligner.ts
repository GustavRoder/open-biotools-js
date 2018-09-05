import { ISequence, Sequence } from '../sequence/sequence';
import { IPairwiseSequenceAlignment } from './i-pairwise-sequence-alignment';
import { SimilarityMatrix } from './similarity-matrix';
import { IConsensusResolver } from './i-consensus-resolver';
import { DiagonalSimilarityMatrix } from './diagonal-similarity-matrix';
import { IAlphabet } from '../sequence/alphabet';
import { PairwiseSequenceAlignment } from './pairwise-sequence-alignment';
import { PairwiseAlignedSequence } from './pairwise-aligned-sequence';
import { SourceDirection } from './source-direction';
import { ISequenceAligner } from './i-sequence-aligner';



/// <summary>
/// A sequence alignment algorithm that aligns exactly two 
/// sequences. This may diverge from ISequenceAligner at some 
/// point; meanwhile, it's important to maintain the distinction
/// (e.g., assembly requires a pairwise algorithm).
/// </summary>
export interface IPairwiseSequenceAligner extends ISequenceAligner {
  /// <summary>
  /// A convenience method - we know there are exactly two inputs.
  /// AlignSimple uses a single gap penalty.
  /// </summary>
  /// <param name="sequence1">First input sequence.</param>
  /// <param name="sequence2">Second input sequence.</param>
  /// <returns>List of Aligned Sequences.</returns>
  alignSimple(sequence1: ISequence, sequence2: ISequence, localSimilarityMatrix: SimilarityMatrix, gapPenalty: number): IPairwiseSequenceAlignment[];

  /// <summary>
  /// A convenience method - we know there are exactly two inputs.
  /// Align uses the affine gap model, which requires a gap open and a gap extension penalty.
  /// </summary>
  /// <param name="sequence1">First input sequence.</param>
  /// <param name="sequence2">Second input sequence.</param>
  /// <returns>List of Aligned Sequences.</returns>
  align(inputA: ISequence, inputB: ISequence, localSimilarityMatrix: SimilarityMatrix, gapOpenPenalty: number, gapExtensionPenalty: number): IPairwiseSequenceAlignment[];
}



/// <summary>
/// Base class for our pair-wise sequence aligners. This implements the core shared 
/// portions of the Smith-Waterman and Needleman-Wunsch aligners.
/// </summary>
export class PairwiseSequenceAligner implements IPairwiseSequenceAligner {

  /// <summary>
  /// Traceback table built during the matrix creation step
  /// </summary>
  traceback: number[][];

  /// <summary>
  /// Generated score table - this is filled in with the scoring matrix when debugging
  /// </summary>
  scoreTable: number[];

  /// <summary>
  /// Rows in ScoreTable
  /// </summary>
  rows: number;

  /// <summary>
  /// Columns in ScoreTable
  /// </summary>
  cols: number;

  /// <summary>
  /// A variable to keep track of whether the traceback table was constructed with an affine gap model.
  /// </summary>
  usingAffineGapModel: boolean;

  /// <summary>
  /// This array keeps track of the length of gaps up to a point along the horizontal axis.
  /// Only used with the affine gap model
  /// </summary>
  h_Gap_Length: number[];

  /// <summary>
  /// This array keeps track of the length of gaps up to a point along the vertical axis.
  /// nly used with the affine gap model.
  /// </summary>
  v_Gap_Length: number[];

  /// <summary>
  /// The reference sequence being aligned (sequence #1)
  /// </summary>
  referenceSequence: string[];

  /// <summary>
  /// The query sequence being aligned (sequence #2)
  /// </summary>
  querySequence: string[];

  /// <summary>
  /// The gap character being used for the shared alphabet between the reference and query sequence.
  /// </summary>
  _gap: string;

  /// <summary>
  /// Original sequence
  /// </summary>
  _sequence1: ISequence;

  /// <summary>
  /// Original sequence #2
  /// </summary>
  _sequence2: ISequence;

  /// <summary>
  /// Gets the name of the current Alignment algorithm used.
  /// This is a overridden property from the abstract parent.
  /// </summary>
  name: string

  /// <summary>
  /// Gets the Description of the current Alignment algorithm used.
  /// This is a overridden property from the abstract parent.
  /// </summary>
  description: string;

  /// <summary>
  /// True to include the score table and matrix as part of the output.
  /// This is placed into the Metadata for the alignment. It is turned off by
  /// default due to the expense of generating it.
  /// </summary>
  includeScoreTable: boolean;

  /// <summary>
  /// Gets or sets value of similarity matrix
  /// The similarity matrix determines the score for any possible pair
  /// of symbols that are encountered at a common location across the 
  /// sequences being aligned.
  /// </summary>
  similarityMatrix: SimilarityMatrix;


  pGapOpenCost: number;

  /// <summary>
  /// Gets or sets value of GapOpenCost
  /// The GapOpenCost is the cost of inserting a gap character into 
  /// a sequence.
  /// </summary>
  public get gapOpenCost(): number {
    return this.pGapOpenCost;
  }

  public set gapOpenCost(value: number) {
    // Hard constrain on GapOpen/Extension costs, some programs have inputs of these be positive 
    // and then flip them internally so it is confusing.  Our users will know the difference right away.
    if (value >= 0) throw new Error('GapOpenCost", "Gap Open Cost must be less than 0');
    this.pGapOpenCost = value;
  }

  pGapExtensionCost: number;

  /// <summary>
  /// Gets or sets value of GapExtensionCost 
  /// The GapExtensionCost is the cost of extending an already existing gap.
  /// This is only used in the affine gap model
  /// </summary>
  public get gapExtensionCost(): number {
    return this.pGapExtensionCost;
  }

  public set gapExtensionCost(value: number) {
    if (value > 0) throw new Error('GapExtensionCost", "Gap Extension Cost must be less than 0');
    this.pGapExtensionCost = value;
  }

  /// <summary>
  /// Gets or sets the object that will be used to compute the alignment's consensus.
  /// </summary>
  consensusResolver: IConsensusResolver;

  /// <summary>
  /// Default constructor
  /// </summary>
  constructor() {
    this.similarityMatrix = new DiagonalSimilarityMatrix(2, -2);
    this.gapOpenCost = -8;
    this.gapExtensionCost = -1;
    this.includeScoreTable = false;
  }

  /// <summary>
  /// Align aligns the set of input sequences using the affine gap model (gap open and gap extension penalties)
  /// and returns the best alignment found.
  /// </summary>
  /// <param name="inputSequences">The sequences to align.</param>
  /// <returns>List of sequence alignments.</returns>

  // align(inputSequences: ISequence[]): IPairwiseSequenceAlignment[] {

  //   let listOfSequences = inputSequences;
  //   if (listOfSequences.length !== 2) throw new Error('Number of input sequences should be 2');

  //   return this.align(listOfSequences[0], listOfSequences[1]);
  // }

  /// <summary>
  /// Align aligns the set of input sequences using the affine gap model (gap open and gap extension penalties)
  /// and returns the best alignment found.
  /// </summary>
  /// <param name="inputSequences">The sequences to align.</param>
  /// <returns>List of sequence alignments.</returns>

  //   ISequenceAligner.Align(inputSequences: ISequence[]): ISequenceAlignment[]
  // {
  //   return this.Align(inputSequences).Cast<ISequenceAlignment>().ToList();
  // }

  /// <summary>
  /// AlignSimple aligns the set of input sequences using the linear gap model (one gap penalty), 
  /// and returns the best alignment found.
  /// </summary>
  /// <param name="inputSequences">The sequences to align.</param>
  /// <returns>List of sequence alignments.</returns>

  //   alignSimple(inputSequences: ISequence[]): IPairwiseSequenceAlignment[]
  // {
  //   let listOfSequences = inputSequences;
  //   if (listOfSequences.length !== 2) throw new Error('The number of input sequences should be 2');
  //   return this.alignSimple(listOfSequences[0], listOfSequences[1]);
  // }

  /// <summary>
  /// AlignSimple aligns the set of input sequences using the linear gap model (one gap penalty), 
  /// and returns the best alignment found.
  /// </summary>
  /// <param name="inputSequences">The sequences to align.</param>
  /// <returns>List of sequence alignments.</returns>

  // IList<ISequenceAlignment> ISequenceAligner.AlignSimple(IEnumerable <ISequence > inputSequences)
  // {
  //   return this.AlignSimple(inputSequences).Cast<ISequenceAlignment>().ToList();
  // }

  /// <summary>
  /// Pairwise alignment of two sequences using a linear gap penalty.  The various algorithms in derived classes (NeedlemanWunsch, 
  /// SmithWaterman, and PairwiseOverlap) all use this general engine for alignment with a linear gap penalty.
  /// </summary>
  /// <param name="sequence1">First sequence</param>
  /// <param name="sequence2">Second sequence</param>
  /// <returns>List of sequence alignments.</returns>
  /// <param name="localSimilarityMatrix">Scoring matrix.</param>
  /// <param name="gapPenalty">Gap penalty (by convention, use a negative number for this.).</param>
  /// <param name="inputA">First input sequence.</param>
  /// <param name="inputB">Second input sequence.</param>
  /// <returns>A list of sequence alignments.</returns>  
  alignSimple(sequence1: ISequence, sequence2: ISequence, localSimilarityMatrix: SimilarityMatrix, gapPenalty: number): IPairwiseSequenceAlignment[] {
    this.similarityMatrix = localSimilarityMatrix;
    this.gapOpenCost = gapPenalty;
    return this.doAlign(sequence1, sequence2, false);
  }


  /// <summary>
  /// Pairwise alignment of two sequences using an affine gap penalty.  The various algorithms in derived classes (NeedlemanWunsch, 
  /// SmithWaterman, and PairwiseOverlap) all use this general engine for alignment with an affine gap penalty.
  /// </summary>
  /// <param name="localSimilarityMatrix">Scoring matrix.</param>
  /// <param name="gapOpenPenalty">Gap open penalty (by convention, use a negative number for this.).</param>
  /// <param name="gapExtensionPenalty">Gap extension penalty (by convention, use a negative number for this.).</param>
  /// <param name="inputA">First input sequence.</param>
  /// <param name="inputB">Second input sequence.</param>
  /// <returns>A list of sequence alignments.</returns>
  align(inputA: ISequence, inputB: ISequence, localSimilarityMatrix: SimilarityMatrix, gapOpenPenalty: number, gapExtensionPenalty: number): IPairwiseSequenceAlignment[] {
    this.similarityMatrix = localSimilarityMatrix;
    this.gapOpenCost = gapOpenPenalty;
    this.gapExtensionCost = gapExtensionPenalty;
    return this.doAlign(inputA, inputB, true);
  }

  /// <summary>
  /// Method which performs the alignment work.
  /// </summary>
  /// <param name="sequence1">First sequence</param>
  /// <param name="sequence2">Second sequence</param>
  /// <param name="useAffineGapModel">True to use affine gap model (separate open vs. extension cost)</param>
  /// <returns></returns>
  doAlign(sequence1: ISequence, sequence2: ISequence, useAffineGapModel: boolean): IPairwiseSequenceAlignment[] {
    this.usingAffineGapModel = useAffineGapModel;
    if (!sequence1) throw new Error('sequence1');
    if (!sequence2) throw new Error('sequence2');

    // if (!Alphabets.CheckIsFromSameBase(sequence1.Alphabet, sequence2.Alphabet)) {
    //   Trace.Report(Properties.Resource.InputAlphabetsMismatch);
    //   throw new ArgumentException(Properties.Resource.InputAlphabetsMismatch);
    // }

    if (!this.similarityMatrix) throw new Error('similarityMatrix is null');

    if (!this.similarityMatrix.validateSequence(sequence1)) throw new Error('Could not validate sequence1');
    if (!this.similarityMatrix.validateSequence(sequence2)) throw new Error('Could not validate sequence1');

    if (this.gapOpenCost > this.gapExtensionCost) throw new Error('GapOpen is greater than GapExtension');

    this._sequence1 = sequence1;
    this._sequence2 = sequence2;
    //this._gap = Alphabets.CheckIsFromSameBase(Alphabets.Protein, sequence1.Alphabet) ? Alphabets.Protein.Gap : Alphabets.DNA.Gap;

    this.referenceSequence = this.getByteArrayFromSequence(this._sequence1);
    this.querySequence = this.getByteArrayFromSequence(this._sequence2);

    // Assign consensus resolver if it was not assigned already.
    let alphabet: IAlphabet = sequence1.alphabet;
    if (!this.consensusResolver)
      this.consensusResolver = new SimpleConsensusResolver(alphabet.hasAmbiguity ? alphabet : Alphabets.AmbiguousAlphabetMap[sequence1.Alphabet]);
    else
      this.consensusResolver.sequenceAlphabet = alphabet.HasAmbiguity ? alphabet : Alphabets.AmbiguousAlphabetMap[sequence1.Alphabet];

    //return new List < IPairwiseSequenceAlignment > { Process() };
    return null;
  }

  /// <summary>
  /// Retrieve or copy the sequence array
  /// </summary>
  /// <param name="sequence"></param>
  /// <returns></returns>
  getByteArrayFromSequence(sequence: ISequence): string[] {
    return [ ...sequence.sequence ];
  }

  /// <summary>
  /// This method performs the pairwise alignment between two sequences (reference and query).
  /// It does this using the standard Dynamic Programming model:
  /// 1. Initialization of the scoring matrix (Rs.Length x Qs.Length)
  /// 2. Filling of the scoring matrix and traceback table
  /// 3. Traceback (alignment)
  /// </summary>
  /// <returns>Aligned sequences</returns>
  Process(): PairwiseSequenceAlignment {
    // Step 1: Initialize
    this.initialize();

    // Step 2: Matrix fill (scoring)
    var scores = this.createTracebackTable();

    // Step 3: Traceback (alignment)
    return this.createAlignment(scores);
  }

  /// <summary>
  /// This is step (1) in the dynamic programming model - to initialize the default values
  /// for the scoring matrix and traceback tables.
  /// </summary>
  initialize() {
    // Check the bounds
    if (this.querySequence.length >= Number.MAX_VALUE) throw new Error('Reference sequence contains too many residues (cannot exceed ' + Number.MAX_VALUE + ' values).');
    if (this.referenceSequence.length >= Number.MAX_VALUE) throw new Error('Query sequence contains too many residues (cannot exceed ' + Number.MAX_VALUE + ' values).');

    // Track rows/cols
    this.rows = this.querySequence.length + 1;
    this.cols = this.referenceSequence.length + 1;

    // Attempt to keep the scoring table if requested. For performance/memory we use a single
    // array here, but it limits the size dramatically so see if we can actually hold it.
    if (this.includeScoreTable || this.usingAffineGapModel) {
      let maxIndex = this.rows * this.cols;
      if (maxIndex > Number.MAX_VALUE) {
        if (this.usingAffineGapModel) throw new Error('Rows * Cols too large');
        this.includeScoreTable = false;
      }
      else if (this.includeScoreTable) {
        this.scoreTable = new Array<number>(maxIndex);
      }
    }

    // Allocate the first pass of the traceback
    //this.traceback = [this.][];
    //this.traceback[0] = new sbyte[Cols]; // Initialized to STOP
  }

  /// <summary>
  /// This is step (2) in the dynamic programming model - to fill in the scoring matrix
  /// and calculate the traceback entries.  This is algorithm specific and so is left
  /// as an abstract method.
  /// </summary>

  // protected abstract IEnumerable < OptScoreMatrixCell > CreateTracebackTable();
  createTracebackTable(): OptScoreMatrixCell[] { return [] };



  /// <summary>
  /// This is step (3) in the dynamic programming model - to walk the traceback/scoring
  /// matrix and generate the alignment.
  /// </summary>
  createAlignment(startingCells: OptScoreMatrixCell[]): PairwiseSequenceAlignment {
    // Generate each alignment
    let alignment = new PairwiseSequenceAlignment(this._sequence1, this._sequence2);
    for (let startingCell of startingCells)
      alignment.pairwiseAlignedSequences.push(this.createAlignmentFromCell(startingCell));

    // Include the scoring table if requested
    if (this.includeScoreTable) alignment.metadata['scoreTable'] = this.getScoreTable();

    return alignment;
  }

  /// <summary>
  /// This takes a specific starting location in the scoring matrix and generates
  /// an alignment from it using the traceback scores.
  /// </summary>
  /// <param name="startingCell">Starting point</param>
  /// <returns>Pairwise alignment</returns>
  createAlignmentFromCell(startingCell: OptScoreMatrixCell): PairwiseAlignedSequence {
    let gapStride: number = this.cols + 1;
    //Using list to avoid allocation issues
    let estimatedLength = (1.1 * Math.max(this.referenceSequence.length, this.querySequence.length));
    let firstAlignment: string[] = new Array<string>(estimatedLength);
    let secondAlignment: string[] = new Array<string>(estimatedLength);

    // Get the starting cell position and record the optimal score found there.
    let i: number = startingCell.row;
    let j: number = startingCell.col;
    var finalScore = startingCell.score;

    let rowGaps: number = 0, colGaps: number = 0, identicalCount: number = 0, similarityCount: number = 0;

    // Walk the traceback matrix and build the alignments.
    while (!this.tracebackIsComplete(i, j)) {
      let tracebackDirection: number = this.traceback[i][j];
      // Walk backwards through the trace back
      let gapLength: number;
      switch (tracebackDirection) {
        case SourceDirection.diagonal:
          let n1 = this.referenceSequence[j - 1];
          let n2 = this.querySequence[i - 1];
          firstAlignment.push(n1);
          secondAlignment.push(n2);
          i--;
          j--;
          // Track some useful statistics
          if (n1 == n2 && n1 != this._gap) {
            identicalCount++;
            similarityCount++;
          }
          else if (this.similarityMatrix[n2, n1] > 0)
            similarityCount++;
          break;
        case SourceDirection.left:
          //Add 1 because this only counts number of extensions
          if (this.usingAffineGapModel) {
            gapLength = this.h_Gap_Length[i * gapStride + j];
            for (let k = 0; k < gapLength; k++) {
              firstAlignment.push(this.referenceSequence[--j]);
              secondAlignment.push(this._gap);
              rowGaps++;
            }
          }
          else {
            firstAlignment.push(this.referenceSequence[--j]);
            secondAlignment.push(this._gap);
            rowGaps++;
          }
          break;
        case SourceDirection.up:
          //add 1 because this only counts number of extensions.
          if (this.usingAffineGapModel) {
            gapLength = this.v_Gap_Length[i * gapStride + j];
            for (let k = 0; k < gapLength; k++) {
              firstAlignment.push(this._gap);
              colGaps++;
              secondAlignment.push(this.querySequence[--i]);
            }
          }
          else {
            secondAlignment.push(this.querySequence[--i]);
            firstAlignment.push(this._gap);
            colGaps++;
          }
          break;
      }
    }

    // We build the alignments in reverse since we were
    // walking backwards through the matrix table. To create
    // the proper alignments we need to resize and reverse
    // both underlying arrays.
    firstAlignment.reverse();
    secondAlignment.reverse();
    // Create the Consensus sequence
    let consensus = new Array<string>(Math.min(firstAlignment.length, secondAlignment.length));
    for (let n = 0; n < consensus.length; n++) {
      consensus[n] = this.consensusResolver.getConsensus([firstAlignment[n], secondAlignment[n]]);
    }

    // Create the result alignment
    let pairwiseAlignedSequence = new PairwiseAlignedSequence();
    pairwiseAlignedSequence.score = finalScore;
    //pairwiseAlignedSequence.FirstSequence = new Sequence(_sequence1.Alphabet, firstAlignment.ToArray()) { ID = _sequence1.ID },
    //pairwiseAlignedSequence.SecondSequence = new Sequence(_sequence2.Alphabet, secondAlignment.ToArray()) { ID = _sequence2.ID },
    pairwiseAlignedSequence.consensus = new Sequence(this.consensusResolver.sequenceAlphabet, consensus.toString());

    // Offset is start of alignment in input sequence with respect to other sequence.
    if (i >= j) {
      pairwiseAlignedSequence.firstOffset = i - j;
      pairwiseAlignedSequence.secondOffset = 0;
    } else {
      pairwiseAlignedSequence.firstOffset = 0;
      pairwiseAlignedSequence.secondOffset = j - i;
    }

    // Add in ISequenceAlignment metadata
    pairwiseAlignedSequence.metadata['Score'] = pairwiseAlignedSequence.score;
    pairwiseAlignedSequence.metadata['FirstOffset'] = pairwiseAlignedSequence.firstOffset;
    pairwiseAlignedSequence.metadata['SecondOffset'] = pairwiseAlignedSequence.secondOffset;
    pairwiseAlignedSequence.metadata['Consensus'] = pairwiseAlignedSequence.consensus;
    pairwiseAlignedSequence.metadata['StartOffsets'] = [j, i];
    pairwiseAlignedSequence.metadata['EndOffsets'] = [startingCell.col - 1, startingCell.row - 1];
    pairwiseAlignedSequence.metadata['Insertions'] = [colGaps, rowGaps]; // ref, query insertions
    pairwiseAlignedSequence.metadata['IdenticalCount'] = identicalCount;
    pairwiseAlignedSequence.metadata['SimilarityCount'] = similarityCount;

    return pairwiseAlignedSequence;
  }


  /**
   * @description This method is used to determine when the traceback step is complete.
   * It is algorithm specific.
   * @param {number} row Current row
   * @param {number} col Current column
   * @returns True if we are finished with the traceback step, false if not.
   */
  tracebackIsComplete(row: number, col: number): boolean {
    return this.traceback[row][col] === SourceDirection.stop;
  }



  /// <summary>
  /// This method generates a textual representation of the scoring/traceback matrix
  /// for diagnostic purposes.
  /// </summary>
  /// <returns>String</returns>
  getScoreTable(): string {
    if (!this.scoreTable) return '';
    let str: string = '';

    for (let i = 0; i < this.querySequence.length + 2; i++) {
      for (let j = 0; j < this.referenceSequence.length + 2; j++) {
        if (i === 0) {
          if (j === 0 || j === 1) {
            str += ' ';
          }
          else {
            str += j === 2 ? '           ' : '    ';
            str += this.referenceSequence[j - 2];
          }
        }
        else if (j == 0) {
          if (i == 1) {
            str += '    ';
          }
          else {
            str += '   ' + this.querySequence[i - 2];
          }
        }
        else {
          let ch: string;
          switch (this.traceback[i - 1][j - 1]) {
            case SourceDirection.diagonal:
              ch = '\\';
              break;
            case SourceDirection.left:
              ch = '<';
              break;
            case SourceDirection.up:
              ch = '^';
              break;
            case SourceDirection.stop:
              ch = '*';
              break;
            default:
              ch = ' ';
              break;
          }
          str += ' ' + ch + this.scoreTable[(i - 1) * this.cols + (j - 1)];
          //sb.AppendFormat(" {0}{1,3}", ch, this.scoreTable[(i - 1) * this.cols + (j - 1)]);
        }
        str += ' ';
      }
      str += '\n';
    }
    return str;
  }

  /// <summary>
  /// Generates the size too large error message.
  /// 
  /// If Rows x Cols greater than Int32.Max, create an error message to inform the user.
  /// </summary>
  /// <returns>The size too large error message.</returns>
  generateSizeTooLargeErrorMessage(): string {
    return 'Sequences too large for pairwise alignment. Size attempted was ' +
      this.rows + ' x ' + this.cols + ' but maximum allowable size is: ' + Number.MAX_VALUE +
      '.  If your sequences are large, a seed-and-extend algorithm (like NUCMER) ' +
      'is likely more appropriate as it will use far less memory.';
  }

  /// <summary>
  /// Generates the OOM error message when allocating gap tracebacks.
  /// 
  /// This message should be produced when an error occurs when allocating the traceback matrices
  /// for the gap states.
  /// </summary>
  /// <returns>The OOM error message when allocating gap tracebacks.</returns>
  generateOOMErrorMessageWhenAllocatingGapTracebacks(): string {
    return 'Note enough memory for pairwise alignment. An error was thrown when' +
      'allocating the gap matrices of size ' +
      this.rows + ' x ' + this.cols + '.  If your sequences are large, a seed-and-extend algorithm (like NUCMER) ' +
      'is likely more appropriate as it will use far less memory.';
  }


}



/// <summary>
/// Optimum score maxtrix cell
/// </summary>
class OptScoreMatrixCell {
  /// <summary>
  /// Position (y) of this cell
  /// </summary>
  row: number;

  /// <summary>
  /// Position (x) of this cell
  /// </summary>
  col: number;

  /// <summary>
  /// Score at this position
  /// </summary>
  score: number;

}