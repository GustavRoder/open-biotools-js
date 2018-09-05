import { ISequenceAlignment } from './i-sequence-alignment';
import { ISequence } from '../sequence/sequence';
import { IAlignedSequence } from './i-aligned-sequence';



/**
 * @description A simple implementation of ISequenceAlignment that stores the 
 * result of an alignment. 
 */
export class SequenceAlignment implements ISequenceAlignment {

  alignedSequences: IAlignedSequence[];

  metadata: object;

  sequences: ISequence[];


  constructor(initialSequences: ISequence[]) {
    this.metadata = {};
    this.alignedSequences = [];
    this.sequences = [];

    for (let seq of initialSequences)
      this.sequences.push(seq);
  }


  /**
   * @description Converts the Aligned Sequences to string.
   */
  toString(): string {
    let str: string = '';
    for (let seq of this.alignedSequences)
      str += seq.toString();
    return str;
  }


}