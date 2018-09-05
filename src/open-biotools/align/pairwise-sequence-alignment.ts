import { SequenceAlignment } from './sequence-alignment';
import { IPairwiseSequenceAlignment } from './i-pairwise-sequence-alignment';
import { PairwiseAlignedSequence } from './pairwise-aligned-sequence';
import { ISequence } from '../sequence/sequence';



/// <summary>
/// A simple implementation of IPairwiseSequenceAlignment that stores the 
/// results as list of Aligned Sequences.
/// </summary>
export class PairwiseSequenceAlignment implements IPairwiseSequenceAlignment {

  /// <summary>
  /// Sequence alignment instance.
  /// </summary>
  readonly seqAlignment: SequenceAlignment;

  /// <summary>
  /// List of alignments.
  /// </summary>
  readonly alignedSequences: PairwiseAlignedSequence[];

  public get pairwiseAlignedSequences(): PairwiseAlignedSequence[] {
    return this.alignedSequences;
  }

  /// <summary>
  /// Gets any additional information about the Alignment.
  /// </summary>
  metadata: object;

  /// <summary>
  /// Gets list of sequences involved in this alignment.
  /// </summary>
  public get sequences(): ISequence[] {
    return this.seqAlignment.sequences;
  }


  /// <summary>
  /// Initializes a new instance of the PairwiseSequenceAlignment class
  /// Constructs PairwiseSequenceAlignment with input sequences.
  /// </summary>
  /// <param name="firstSequence">First input sequence.</param>
  /// <param name="secondSequence">Second input sequence.</param>
  constructor(firstSequence: ISequence, secondSequence: ISequence) {
    this.seqAlignment = new SequenceAlignment([firstSequence, secondSequence]);
    this.alignedSequences = [];
    this.isReadOnly = false;  // initializes to false by default, but make it explicit for good style.
  }




  /// <summary>
  /// Gets accessor for the first sequence.
  /// </summary>
  public get firstSequence(): ISequence {
    if (this.seqAlignment.sequences.length === 0) return null;
    return this.seqAlignment.sequences[0];
  }

  /// <summary>
  /// Gets accessor for the second sequence.
  /// </summary>
  public get secondSequence(): ISequence {
    if (this.seqAlignment.sequences.length <= 1) return null;
    return this.seqAlignment.sequences[1];
  }

  /// <summary>
  /// Gets or sets a value indicating whether PairwiseSequenceAlignment is read-only or not.
  /// </summary>
  isReadOnly: boolean;


  /// <summary>
  /// Add a new Aligned Sequence Object to the end of the list.
  /// </summary>
  /// <param name="pairwiseAlignedSequence">The sequence to add.</param>
  addSequence(pairwiseAlignedSequence: PairwiseAlignedSequence) {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.push(pairwiseAlignedSequence);
  }


  /// <summary>
  /// Adds an aligned sequence to the list of aligned sequences in the PairwiseSequenceAlignment.
  /// Throws exception if sequence alignment is read only.
  /// </summary>
  /// <param name="item">PairwiseAlignedSequence to add.</param>
  add(item: PairwiseAlignedSequence) {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.push(item);
  }

  /// <summary>
  /// Clears the PairwiseSequenceAlignment
  /// Throws exception if PairwiseSequenceAlignment is read only.
  /// </summary>
  clear() {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.splice(0, this.alignedSequences.length);
  }

  /// <summary>
  /// Returns true if the PairwiseSequenceAlignment contains the aligned sequence in the
  /// list of aligned sequences.
  /// </summary>
  /// <param name="item">PairwiseAlignedSequence object.</param>
  /// <returns>True if contains item, otherwise returns false.</returns>
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

  /// <summary>
  /// Removes item from the list of aligned sequences in the PairwiseSequenceAlignment.
  /// Throws exception if PairwiseSequenceAlignment is read only.
  /// </summary>
  /// <param name="item">Aligned sequence object.</param>
  /// <returns>True if item was removed, false if item was not found.</returns>
  remove(item: PairwiseAlignedSequence): boolean {
    if (this.isReadOnly) throw new Error('Readonly mode');
    this.alignedSequences.splice(this.alignedSequences.indexOf(item), 1);
    return true;
  }

  /// <summary>
  /// Converts the Aligned Sequences to string.
  /// </summary>
  /// <returns>Aligned Sequence Data.</returns>
  toString(): string {
    let str: string = '';
    for (let seq of this.alignedSequences)
      str += seq.toString();
    return str;
  }


}