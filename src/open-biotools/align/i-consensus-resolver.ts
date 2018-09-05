import { IAlphabet } from '../sequence/alphabet';



/**
 * @description Framework to compute the consensus for a list of symbols
    * For example, one can construct consensus for 
    * a set of aligned sequences in the following way: 
    * Sequence 1: A G T C G A
    * Sequence 2: A G G C - A
    * Sequence 3: A G G T G -
    * Consensus : A G G C G A
    * In the example here, we might choose the character that 
    * occurs maximum number of times for consensus
    * This means that consensus for characters at position 1: {A, A, A} is A,
    * while consensus for characters at position 3: {T, G, G} is G, and so on.
    * This interface provides the framework for consensus generation. 
    * Implement this interface to provide different implementations 
    * for building consensus.
 */
export interface IConsensusResolver {
    
    /**
     * @description Gets or sets sequence alphabet.
     */
    sequenceAlphabet: IAlphabet;

    /**
     * @description Find consensus symbol for a list of symbols.
     * @param {string[]} items List of input symbols.
     */
    getConsensus(items: string[]): string;
    
}