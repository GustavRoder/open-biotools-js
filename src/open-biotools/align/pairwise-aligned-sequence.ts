import { AlignedSequence } from './aligned-sequence';
import { ISequence } from '../sequence/sequence';

/// <summary>
/// PairwiseAlignedSequence is a class containing the single aligned unit of pairwise alignment.
/// </summary>
export class PairwiseAlignedSequence extends AlignedSequence {
  /// <summary>
  /// Constant string indicating consensus in meta-data.
  /// </summary>
  private readonly consensusKey: string = 'Consensus';

  /// <summary>
  /// Constant string indicating alignment score in meta-data.
  /// </summary>
  private readonly scoreKey: string = 'Score';

  /// <summary>
  /// Constant string indicating offset of first sequence in alignment.
  /// </summary>
  private readonly firstOffsetKey: string = 'FirstOffset';

  /// <summary>
  /// Constant string indicating offset of second sequence in alignment.
  /// </summary>
  private readonly secondOffsetKey: string = 'SecondOffset';


  /// <summary>
  /// Initializes a new instance of the PairwiseAlignedSequence class.
  /// </summary>
  constructor() {
    super();
  }


  /// <summary>
  /// Gets or sets Alignment of First Sequence.
  /// </summary>
  public get firstSequence(): ISequence {
    return this.sequences.length > 0 ? this.sequences[0] : null;
  }

  public set firstSequence(seq: ISequence) {
    if (this.sequences.length === 0) this.sequences.push(null);
    this.sequences[0] = seq;
  }

  /// <summary>
  /// Gets or sets Alignment of Second Sequence.
  /// </summary>
  public get secondSequence(): ISequence {
    return this.sequences.length > 1 ? this.sequences[1] : null;
  }

  public set secondSequence(seq: ISequence) {
    if (this.sequences.length === 0) this.sequences.push(null);
    if (this.sequences.length === 1) this.sequences.push(null);
    this.sequences[1] = seq;
  }

  /// <summary>
  /// Gets or sets Consensus of FirstSequence and SecondSequence.
  /// </summary>
  public get consensus(): ISequence {
    return this.metadata[this.consensusKey];
  }

  public set consensus(seqCons: ISequence) {
    this.metadata[this.consensusKey] = seqCons;
  }

  /// <summary>
  /// Gets or sets Score of the alignment.
  /// </summary>
  public get score(): number {
    return this.metadata[this.scoreKey] ? this.metadata[this.scoreKey] : 0;
  }

  public set score(value: number) {
    this.metadata[this.scoreKey] = value;
  }


  /// <summary>
  /// Gets or sets Offset of FirstSequence.
  /// </summary>
  public get firstOffset(): number {
    return this.metadata[this.firstOffsetKey] ? this.metadata[this.firstOffsetKey] : 0;
  }

  public set firstOffset(value: number) {
    this.metadata[this.firstOffsetKey] = value;
  }


  /// <summary>
  /// Gets or sets Offset of SecondSequence.
  /// </summary>
  public get secondOffset(): number {
    return this.metadata[this.secondOffsetKey] ? this.metadata[this.secondOffsetKey] : 0;
  }

  public set secondOffset(value: number) {
    this.metadata[this.secondOffsetKey] = value;
  }


  /// <summary>
  /// Converts the Consensus, First and Second sequences.
  /// </summary>
  /// <returns>Consensus, First and Second sequences.</returns>
  public toString(): string {
    let str = '';
    str += this.consensus.sequence + '\n';
    str += this.firstSequence.sequence + '\n';
    str += this.secondSequence.sequence + '\n';
    return str;
  }

}