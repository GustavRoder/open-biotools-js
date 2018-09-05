import { AlignedSequence } from './aligned-sequence';
import { ISequence } from '../sequence/sequence';



/**
 * @description PairwiseAlignedSequence is a class containing the single aligned unit of pairwise alignment.
 */
export class PairwiseAlignedSequence extends AlignedSequence {

  /**
   * @description Constant string indicating consensus in meta-data.
   */
  private readonly consensusKey: string = 'Consensus';

  /**
   * @description Constant string indicating alignment score in meta-data.
   */
  private readonly scoreKey: string = 'Score';

  /**
   * @description Constant string indicating offset of first sequence in alignment.
   */
  private readonly firstOffsetKey: string = 'FirstOffset';

  /**
   * @description Constant string indicating offset of second sequence in alignment.
   */
  private readonly secondOffsetKey: string = 'SecondOffset';


  constructor() {
    super();
  }


  /**
   * @description Gets the Alignment of First Sequence.
   */
  public get firstSequence(): ISequence {
    return this.sequences.length > 0 ? this.sequences[0] : null;
  }

  /**
   * @description Sets the Alignment of First Sequence.
   */
  public set firstSequence(seq: ISequence) {
    if (this.sequences.length === 0) this.sequences.push(null);
    this.sequences[0] = seq;
  }

  /**
   * @description Gets the Alignment of Second Sequence.
   */
  public get secondSequence(): ISequence {
    return this.sequences.length > 1 ? this.sequences[1] : null;
  }

  /**
   * @description Sets the Alignment of Second Sequence.
   */
  public set secondSequence(seq: ISequence) {
    if (this.sequences.length === 0) this.sequences.push(null);
    if (this.sequences.length === 1) this.sequences.push(null);
    this.sequences[1] = seq;
  }

  /**
   * @description Gets the Consensus of FirstSequence and SecondSequence.
   */
  public get consensus(): ISequence {
    return this.metadata[this.consensusKey];
  }

  /**
   * @description Sets the Consensus of FirstSequence and SecondSequence.
   */
  public set consensus(seqCons: ISequence) {
    this.metadata[this.consensusKey] = seqCons;
  }

  /**
   * @description Gets the Score of the alignment.
   */
  public get score(): number {
    return this.metadata[this.scoreKey] ? this.metadata[this.scoreKey] : 0;
  }

  /**
   * @description Sets the Score of the alignment.
   */
  public set score(value: number) {
    this.metadata[this.scoreKey] = value;
  }

  /**
   * @description Gets the Offset of FirstSequence.
   */
  public get firstOffset(): number {
    return this.metadata[this.firstOffsetKey] ? this.metadata[this.firstOffsetKey] : 0;
  }

  /**
   * @description Sets the Offset of FirstSequence.
   */
  public set firstOffset(value: number) {
    this.metadata[this.firstOffsetKey] = value;
  }

  /**
   * @description Gets the Offset of SecondSequence.
   */
  public get secondOffset(): number {
    return this.metadata[this.secondOffsetKey] ? this.metadata[this.secondOffsetKey] : 0;
  }

  /**
   * @description Sets the Offset of SecondSequence.
   */
  public set secondOffset(value: number) {
    this.metadata[this.secondOffsetKey] = value;
  }


  /**
   * @description Converts the Consensus, First and Second sequences.
   * @returns Consensus, First and Second sequences.
   */
  public toString(): string {
    let str = '';
    str += this.consensus.sequence + '\n';
    str += this.firstSequence.sequence + '\n';
    str += this.secondSequence.sequence + '\n';
    return str;
  }


}