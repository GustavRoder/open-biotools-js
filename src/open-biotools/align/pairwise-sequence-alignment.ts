import { SequenceAlignment } from './sequence-alignment';
import { IPairwiseSequenceAlignment } from './i-pairwise-sequence-alignment';
import { PairwiseAlignedSequence } from './pairwise-aligned-sequence';
import { ISequence } from '../sequence/sequence';



/**
 * @description A simple implementation of IPairwiseSequenceAlignment that stores the 
 * results as list of Aligned Sequences.
 */
export class PairwiseSequenceAlignment implements IPairwiseSequenceAlignment {

  /**
   * @description  Sequence alignment instance.
   */
  readonly seqAlignment: SequenceAlignment;

  /**
   * @description List of alignments.
   */
  readonly alignedSequences: PairwiseAlignedSequence[];

  public get pairwiseAlignedSequences(): PairwiseAlignedSequence[] {
    return this.alignedSequences;
  }

  /**
   * @description Gets any additional information about the Alignment.
   */
  metadata: object;

  /**
   * @description Gets list of sequences involved in this alignment.
   */
  public get sequences(): ISequence[] {
    return this.seqAlignment.sequences;
  }


  /**
   * @description Initializes a new instance of the PairwiseSequenceAlignment class
   * Constructs PairwiseSequenceAlignment with input sequences.
   * @param firstSequence First input sequence.
   * @param secondSequence Second input sequence.
   */
  constructor(firstSequence: ISequence, secondSequence: ISequence) {
    this.seqAlignment = new SequenceAlignment([firstSequence, secondSequence]);
    this.alignedSequences = [];
    this.isReadOnly = false;  // initializes to false by default, but make it explicit for good style.
  }


  /**
   * @description Gets accessor for the first sequence.
   */
  public get firstSequence(): ISequence {
    if (this.seqAlignment.sequences.length === 0) return null;
    return this.seqAlignment.sequences[0];
  }

  /**
   * @description Gets accessor for the second sequence.
   */
  public get secondSequence(): ISequence {
    if (this.seqAlignment.sequences.length <= 1) return null;
    return this.seqAlignment.sequences[1];
  }

  /**
   * @description Gets or sets a value indicating whether PairwiseSequenceAlignment is read-only or not.
   */
  isReadOnly: boolean;

  /**
   * @description Add a new Aligned Sequence Object to the end of the list.
   * @param pairwiseAlignedSequence The sequence to add.
   */
  addSequence(pairwiseAlignedSequence: PairwiseAlignedSequence) {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.push(pairwiseAlignedSequence);
  }

  /**
   * @description Adds an aligned sequence to the list of aligned sequences in the PairwiseSequenceAlignment.
   * Throws exception if sequence alignment is read only.
   * @param item PairwiseAlignedSequence to add.
   */
  add(item: PairwiseAlignedSequence) {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.push(item);
  }

  /**
   * @description Clears the PairwiseSequenceAlignment
   * Throws an error if PairwiseSequenceAlignment is read only.
   */
  clear() {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.splice(0, this.alignedSequences.length);
  }

  /**
   * @description Returns true if the PairwiseSequenceAlignment contains the aligned sequence in the
   * list of aligned sequences.
   * @param item PairwiseAlignedSequence object.
   * @returns True if contains item, otherwise returns false.
   */
  contains(item: PairwiseAlignedSequence): boolean {
    return this.alignedSequences.indexOf(item) > -1;
  }

  /// <summary>
  /// Copies the aligned sequences from the PairwiseSequenceAlignment into an existing aligned sequence array.
  /// </summary>
  /// <param name="array">Array into which to copy the sequences.</param>
  /// <param name="arrayIndex">Starting index in array at which to begin the copy.</param>

  // public void CopyTo(PairwiseAlignedSequence[] array, int arrayIndex) {
  //   if (array == null) {
  //     throw new ArgumentNullException(Properties.Resource.ParameterNameArray);
  //   }

  //   foreach(PairwiseAlignedSequence seq in alignedSequences)
  //   {
  //     array[arrayIndex++] = seq;
  //   }
  // }

  /**
   * @description Removes item from the list of aligned sequences in the PairwiseSequenceAlignment.
   * Throws an error if PairwiseSequenceAlignment is read only.
   * @param item Aligned sequence object.
   * @returns True if item was removed, false if item was not found.
   */
  remove(item: PairwiseAlignedSequence): boolean {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.splice(this.alignedSequences.indexOf(item), 1);
    return true;
  }

  /**
   * @description Converts the Aligned Sequences to string.
   * @returns Aligned Sequence Data.
   */
  toString(): string {
    let str: string = '';
    for (let seq of this.alignedSequences)
      str += seq.toString();
    return str;
  }

}