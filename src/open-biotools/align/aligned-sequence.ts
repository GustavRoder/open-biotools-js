import { IAlignedSequence } from './i-aligned-sequence';
import { ISequence } from '../sequence/sequence';



/**
 * @description AlignedSequence is a class containing the single aligned unit of alignment.
 */
export class AlignedSequence implements IAlignedSequence {

  
  metadata: object;
  sequences: ISequence[];


  constructor() {
    this.metadata = {};
    this.sequences = [];
  }


}
