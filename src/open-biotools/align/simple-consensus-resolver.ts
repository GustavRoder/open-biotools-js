import { IConsensusResolver } from './i-consensus-resolver';
import { DnaAlphabet, IAlphabet, ProteinAlphabet } from '../sequence/alphabet';


/// <summary>
/// Calculate the consensus for a list of symbols using simple frequency fraction method.
/// Normal (non-gap) symbols are given a weight of 100. 
/// The confidence of a symbol is the sum of weights for that symbol, 
/// divided by the total number of symbols occurring at that position. 
/// If symbols have confidence >= threshold, symbol corresponding 
/// to set of these high confidence symbols is used.
/// If no symbol meets the threshold, symbol corresponding 
/// to set of all the symbols at that position is used.
/// <para>
/// For ambiguous symbols, the corresponding set of base symbols are retrieved.
/// And for frequency calculation, each base symbol is given a weight of 
/// (100 / number of base symbols).
/// </para>
/// </summary>
export class SimpleConsensusResolver implements IConsensusResolver {

  /// <summary>
  /// Holds the current alphabet type
  /// </summary>
  alphabetType: IAlphabet;


  /// <summary>
  /// Initializes a new instance of the SimpleConsensusResolver class.
  /// </summary>
  /// <param name="seqAlphabet">Sequence Alphabet.</param>
  /// <param name="threshold">Threshold Value.</param>
  constructor(seqAlphabet?: IAlphabet, threshold?: number) {
    this.sequenceAlphabet = seqAlphabet;
    this.threshold = threshold;
  }


  /// <summary>
  /// Gets or sets sequence alphabet
  /// </summary>
  public get sequenceAlphabet(): IAlphabet {
    return this.alphabetType;
  }

  public set sequenceAlphabet(value: IAlphabet) {
    if (value.name === 'AmbiguousDna' || value.name === 'AmbiguousRna' || value.name === 'AmbiguousProtein') {
      this.alphabetType = value;
    }
    else if (typeof value === typeof DnaAlphabet /*|| value == RnaAlphabet.Instance*/ || typeof value === typeof ProteinAlphabet) {
      this.alphabetType = new DnaAlphabet() //Alphabets.AmbiguousAlphabetMap[value];
    } else {
      throw new Error('Could not set sequence alphabet for "' + value.name + '"');
    }
  }


  /// <summary>
  /// Gets or sets threshold value - used when generating consensus symbol
  /// The confidence level for a position must equal or exceed Threshold for
  /// a non-gap symbol to appear in the consensus at that position.
  /// </summary>
  threshold: number;

  /// <summary>
  /// Gets consensus symbols for the input list, 
  /// using frequency fraction method.
  /// Refer class summary for more details.
  /// </summary>
  /// <param name="items">List of input symbols.</param>
  /// <returns>Consensus Symbol.</returns>
  getConsensus(items: string[]): string {
    if (!this.sequenceAlphabet) throw new Error('SequenceAlphabet is not defined');
    if (!items || items.length === 0) throw new Error('Items is not defined or list empty');

    let symbolFrequency: string[] = [];
    let symbolsCount: number = 0;

    let gapSymbols = this.sequenceAlphabet.tryGetGapSymbols();
    let defaultGap = this.sequenceAlphabet.tryGetDefaultGapSymbol();

    let ambiguousSymbols = this.sequenceAlphabet.getAmbiguousSymbols();
    let basicSymbols: string[] = null;

    for (let item of items) {
      //Ignore gaps
      if (gapSymbols[item]) continue;
      if (!item) throw new Error('Item cannot be null');

      symbolsCount++;

      if (ambiguousSymbols.indexOf(item) > -1) {
        basicSymbols = this.sequenceAlphabet.tryGetBasicSymbols(item);

        let baseProbability: number = 1 / basicSymbols.length;
        for (let s of basicSymbols)
          symbolFrequency[s] = (symbolFrequency[s] ? symbolFrequency[s] : 0) + baseProbability;
      }
      else {
        symbolFrequency[item] = (symbolFrequency[item] ? symbolFrequency[item] : 0) + 1;
      }
    }
    
    // All symbols were gaps
    if (symbolsCount == 0) return defaultGap;

    // Check which characters are above threshold
    let aboveThresholdSymbols: string[] = [];

    for (let item of symbolFrequency) {
      let frequency: number = (symbolFrequency[item].value * 100) / symbolsCount;
      if (frequency > this.threshold) aboveThresholdSymbols[item] = item;
    }

    // If there are characters above threshold, consider those characters for consensus
    // Else, consider all characters
    return this.sequenceAlphabet.getConsensusSymbol(aboveThresholdSymbols.length > 0 ? aboveThresholdSymbols : Object.keys(symbolFrequency));
  }

}
