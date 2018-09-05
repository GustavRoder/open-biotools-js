import { PairwiseAlignedSequence } from './pairwise-aligned-sequence';
import { ISequence } from '../sequence/sequence';
import { ISequenceAlignment } from './i-sequence-alignment';



/**
 * @description An IPairwiseSequenceAlignment is the result of running a Pairwise alignment algorithm on a set 
 * of two sequences.
 * This is just a storage object – it’s up to an algorithm object to fill it in.
 * for efficiency’s sake, we are leaving it up to calling code to keep track of the 
 * input sequences, if desired.
 */
export interface IPairwiseSequenceAlignment extends ISequenceAlignment //, ICollection<PairwiseAlignedSequence>
{

    /**
     * @description Gets list of the (output) aligned sequences with score, offset and consensus. 
     */
    pairwiseAlignedSequences: PairwiseAlignedSequence[];

    /**
     * @description Gets accessor for the first sequence.
     */
    firstSequence: ISequence;

    /**
     * @description Gets accessor for the second sequence.
     */
    secondSequence: ISequence;


    /**
     * @description Add a new Aligned Sequence Object to the end of the list.
     * @param {PairwiseAlignedSequence} pairwiseAlignedSequence The PairwiseAlignedSequence to add.
     */
    addSequence(pairwiseAlignedSequence: PairwiseAlignedSequence): void;

}