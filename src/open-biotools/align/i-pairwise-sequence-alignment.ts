import { PairwiseAlignedSequence } from './pairwise-aligned-sequence';
import { ISequence } from '../sequence/sequence';
import { ISequenceAlignment } from './i-sequence-alignment';

    /// <summary>
    /// An IPairwiseSequenceAlignment is the result of running a Pairwise alignment algorithm on a set 
    /// of two sequences.
    /// </summary>
    /// <remarks>
    /// this is just a storage object – it’s up to an algorithm object to fill it in.
    /// for efficiency’s sake, we are leaving it up to calling code to keep track of the 
    /// input sequences, if desired.
    /// </remarks>
    export interface IPairwiseSequenceAlignment extends ISequenceAlignment //, ICollection<PairwiseAlignedSequence>
    {
        /// <summary>
        /// Gets list of the (output) aligned sequences with score, offset and consensus. 
        /// </summary>
        pairwiseAlignedSequences: PairwiseAlignedSequence[];

        /// <summary>
        /// Gets accessor for the first sequence.
        /// </summary>
        firstSequence: ISequence;

        /// <summary>
        /// Gets accessor for the second sequence.
        /// </summary>
        secondSequence: ISequence;

        /// <summary>
        /// Add a new Aligned Sequence Object to the end of the list.
        /// </summary>
        /// <param name="pairwiseAlignedSequence">The PairwiseAlignedSequence to add.</param>
        addSequence(pairwiseAlignedSequence: PairwiseAlignedSequence): void;
        
    }