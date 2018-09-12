export interface IAlphabet {

  //Properties

  gap: string;

  hasAmbiguity: boolean;

  hasGaps: boolean;

  hasTerminations: boolean;

  isComplementSupported: boolean;

  name: string;

  symbols: string[];

  //Methods

  getAmbiguousSymbols(): string[];

  getConsensusSymbol(symbols: string[]): string;

  tryGetBasicSymbols(ambiguousSymbol: string): string[];

  tryGetDefaultGapSymbol(): string;

  tryGetGapSymbols(): string[];

  validateSequence(sequence: string, offset: number, length: number): boolean;

}




export class Alphabet implements IAlphabet {

  gap: string;

  hasAmbiguity: boolean;

  hasGaps: boolean;

  hasTerminations: boolean;

  isComplementSupported: boolean;

  name: string;

  symbols: string[];


  constructor() {
    this.gap = '-';
    this.symbols = [];
  }


  getAmbiguousSymbols(): string[] {
    throw new Error('Basis class - Method not implemented.');
  }

  getConsensusSymbol(symbols: string[]): string {
    throw new Error('Method not implemented.');
  }

  tryGetBasicSymbols(ambiguousSymbol: string): string[] {
    throw new Error('Method not implemented.');
  }

  tryGetDefaultGapSymbol(): string {
    return '-';
  }

  tryGetGapSymbols(): string[] {
    return [this.tryGetDefaultGapSymbol()];
  }

  public validateSequence(sequence: string, offset: number, length: number): boolean {
    if (!sequence || sequence.length === 0) return false;
    for (let i = 0; i <= sequence.length - 1; i++) {
      let letter = sequence.substr(i, 1).toUpperCase();
      if (this.symbols.indexOf(letter) === -1) return false;
    }
    return true;
  }

}






export class DnaAlphabet extends Alphabet {

  ambiguousSyToBasicSymbolsMap: object;

  basicSymbolsToAmbiguousSymbolMap: object;

  friendlyNameMap: object;

  name = 'Dna';

  nucleotides: string[];

  nucleotideValueMap: object;

  symbolToComplementSymbolMap: object;


  constructor() {
    super();

    this.ambiguousSyToBasicSymbolsMap = {};
    this.basicSymbolsToAmbiguousSymbolMap = {};
    this.friendlyNameMap = {};
    this.symbolToComplementSymbolMap = {};
    this.nucleotideValueMap = {};

    this.symbols.push('A');
    this.symbols.push('T');
    this.symbols.push('G');
    this.symbols.push('C');
    this.symbols.push('-');

    this.addNucleotide('A', 'Adenosine', ['a']);
    this.addNucleotide('C', 'Cytosine', ['c']);
    this.addNucleotide('G', 'Guanine', ['g']);
    this.addNucleotide('T', 'Thymine', ['t']);
    this.addNucleotide('-', 'Adenosine', ['Gap']);

    this.mapComplementNucleotide('A', 'T');
    this.mapComplementNucleotide('T', 'A');
    this.mapComplementNucleotide('C', 'G');
    this.mapComplementNucleotide('G', 'C');
    this.mapComplementNucleotide('-', '-');
  }


  addNucleotide(nucleotideValue: string, friendlyName: string, otherPossibleValues: string[]) {
    this.nucleotideValueMap[nucleotideValue] = nucleotideValue;
    for (let value of otherPossibleValues)
      this.nucleotideValueMap[value] = nucleotideValue;
    this.friendlyNameMap[nucleotideValue] = friendlyName;
  }

  getAmbiguousSymbols(): string[] {
    return Object.keys(this.ambiguousSyToBasicSymbolsMap);
  }

  /// <summary>
  /// Find the consensus nucleotide for a set of nucleotides.
  /// </summary>
  /// <param name="symbols">Set of sequence items.</param>
  /// <returns>Consensus nucleotide.</returns>
  getConsensusSymbol(symbols: string[]): string {
    if (!symbols || symbols.length === 0) throw new Error('symbols must be defined and contain elements');

    let symbolsInUpperCase: string[] = [];

    // Validate that all are valid DNA symbols
    let validValues: string[] = this.getValidSymbols();

    for (let symbol of symbols) {
      if (validValues.indexOf(symbol) === -1) throw new Error('Invalid symbol: ' + symbol);
      symbolsInUpperCase.push(symbol.toUpperCase());
    }

    // Remove all gap symbols
    let gapItems: string[] = this.tryGetGapSymbols();
    let defaultGap: string = this.tryGetDefaultGapSymbol();

    symbolsInUpperCase = symbolsInUpperCase.filter(s => s !== '-');

    if (symbolsInUpperCase.length === 0) {
      // All are gap characters, return default 'Gap'
      return defaultGap;
    }
    else if (symbolsInUpperCase.length === 1) {
      return symbolsInUpperCase[0];
    }
    else {
      let baseSet: string[] = [];

      for (let n of symbolsInUpperCase) {
        let ambiguousSymbols: string[] = this.tryGetBasicSymbols(n);
        if (ambiguousSymbols) {
          for (let s in ambiguousSymbols)
            if (baseSet.indexOf(s) === -1) baseSet.push(s);
        }
        else {
          // If not found in ambiguous map, it has to be base / unambiguous character
          baseSet.push(n);
        }
      }

      return this.tryGetAmbiguousSymbol(baseSet);
    }
  }

  /// <summary>
  ///     Get the valid symbols in the alphabet.
  /// </summary>
  /// <returns>True if gets else false.</returns>
  getValidSymbols(): string[] {
    return Object.keys(this.nucleotideValueMap);
  }

  mapAmbiguousNucleotide(ambiguousNucleotide: string, nucleotidesToMap: string[]) {
    let ambiguousSymbol: string = this.nucleotideValueMap[ambiguousNucleotide];

    //Verify whether the nucleotides to map are valid nucleotides.
    if (!ambiguousSymbol) {
      throw new Error('Could not recognize symbol: ' + 'ambiguousNucleotide');
    }

    let mappingValues = new Array<string>(nucleotidesToMap.length);
    let i: number = 0;


    for (let valueToMap of nucleotidesToMap) {
      let validatedValueToMap: string = this.nucleotideValueMap[valueToMap];
      if (!validatedValueToMap) throw new Error('Could not recognize symbol: ' + 'nucleotidesToMap');
      mappingValues[i++] = validatedValueToMap;
    }

    this.ambiguousSyToBasicSymbolsMap[ambiguousSymbol] = mappingValues;
    this.basicSymbolsToAmbiguousSymbolMap[mappingValues.join('_')] = ambiguousSymbol;
  }

  mapComplementNucleotide(nucleotide: string, complementNucleotide: string) {
    //Verify whether the nucleotides exist or not
    let symbol: string = this.nucleotideValueMap[nucleotide]; //Validated nucleotides
    if (symbol) {
      let complementSymbol: string = this.nucleotideValueMap[complementNucleotide];
      if (complementSymbol) {
        this.symbolToComplementSymbolMap[symbol] = complementSymbol;
        return;
      }
    }

    throw new Error('Could not recognize symbol: ' + 'nucleotide');
  }

  /// <summary>
  ///     Get the ambiguous symbols if present in the alphabet.
  /// </summary>
  /// <param name="symbols">The symbols.</param>
  /// <param name="ambiguousSymbol">Ambiguous Symbol. </param>
  /// <returns>True if gets else false.</returns>
  tryGetAmbiguousSymbol(symbols: string[]): string {
    console.log('oh yeah!!!')
    console.log(this.basicSymbolsToAmbiguousSymbolMap)
    return this.basicSymbolsToAmbiguousSymbolMap[symbols.join('_')];
  }

}





export class AmbiguousDnaAlphabet extends DnaAlphabet {
  hasAmbiguity = true;

  name = 'AmbiguousDna';

  constructor() {
    super();

    this.addNucleotide('M', 'Adenine or Cytosine', ['m']);
    this.addNucleotide('R', 'Guanine or Adenine', ['r']);
    this.addNucleotide('S', 'Guanine or Cytosine', ['s']);
    this.addNucleotide('W', 'Adenine or Thymine', ['w']);
    this.addNucleotide('Y', 'Thymine or Cytosine', ['y']);
    this.addNucleotide('K', 'Guanine or Thymine', ['k']);
    this.addNucleotide('V', 'Guanine or Cytosine or Adenine', ['v']);
    this.addNucleotide('H', 'Adenine or Cytosine or Thymine', ['h']);
    this.addNucleotide('D', 'Guanine or Adenine or Thymine', ['d']);
    this.addNucleotide('B', 'Guanine or Thymine or Cytosine', ['b']);
    this.addNucleotide('N', 'Any', ['n']);

    this.mapComplementNucleotide('N', 'N');
    this.mapComplementNucleotide('M', 'K');
    this.mapComplementNucleotide('W', 'W');
    this.mapComplementNucleotide('H', 'D');
    this.mapComplementNucleotide('R', 'Y');
    this.mapComplementNucleotide('S', 'S');
    this.mapComplementNucleotide('K', 'M');
    this.mapComplementNucleotide('D', 'H');
    this.mapComplementNucleotide('V', 'B');
    this.mapComplementNucleotide('B', 'V');
    this.mapComplementNucleotide('Y', 'R');

    this.mapAmbiguousNucleotide('N', ['A', 'C', 'G', 'T']);
    this.mapAmbiguousNucleotide('M', ['A', 'C']);
    this.mapAmbiguousNucleotide('R', ['G', 'A']);
    this.mapAmbiguousNucleotide('S', ['G', 'C']);
    this.mapAmbiguousNucleotide('W', ['A', 'T']);
    this.mapAmbiguousNucleotide('Y', ['T', 'C']);
    this.mapAmbiguousNucleotide('K', ['G', 'T']);
    this.mapAmbiguousNucleotide('V', ['G', 'C', 'A']);
    this.mapAmbiguousNucleotide('H', ['A', 'C', 'T']);
    this.mapAmbiguousNucleotide('D', ['G', 'A', 'T']);
    this.mapAmbiguousNucleotide('B', ['G', 'T', 'C']);
  }
}





export class RnaAlphabet extends Alphabet {
  name = 'RnaAlphabet';

  constructor() {
    super();
    this.symbols.push('A');
    this.symbols.push('U');
    this.symbols.push('G');
    this.symbols.push('C');
    this.symbols.push(' ');
  }

}




export class ProteinAlphabet extends Alphabet {
  name = 'ProteinAlphabet';

  constructor() {
    super();
    this.symbols.push('A');
    this.symbols.push('C');
    this.symbols.push('D');
    this.symbols.push('E');
    this.symbols.push('F');
    this.symbols.push('G');
    this.symbols.push('H');
    this.symbols.push('I');
    this.symbols.push('K');
    this.symbols.push('L');
    this.symbols.push('M');
    this.symbols.push('N');
    this.symbols.push('P');
    this.symbols.push('Q');
    this.symbols.push('R');
    this.symbols.push('S');
    this.symbols.push('T');
    this.symbols.push('V');
    this.symbols.push('W');
    this.symbols.push('Y');
    this.symbols.push(' ');
  }

}







export class AmbiguousRnaAlphabet extends Alphabet {
  name = 'AmbiguousRnaAlphabet';
}


export class AmbiguousProteinAlphabet extends Alphabet {
  name = 'AmbiguousProteinAlphabet';
}

