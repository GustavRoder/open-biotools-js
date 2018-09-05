import { ISequence } from '../sequence/sequence';



/**
 * @description Interface to hold single aligned unit of alignment.
 */
export interface IAlignedSequence {

  /**
   * @description Gets information about the AlignedSequence, like score, offsets, consensus, etc..
   */
  metadata: object;

  /**
   * @description Gets list of sequences, aligned as part of an alignment.
   */
  sequences: ISequence[];

}
