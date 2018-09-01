export interface IAlphabet {

  //Properties

  name: string;

  symbols: string[];

  //Methods

  validateSequence(sequence: string): boolean;

}




export class Alphabet implements IAlphabet {
  
  public symbols: string[];
  public name: string;
  
  constructor() {
    this.symbols = [];
  }

  public validateSequence(sequence: string): boolean {
    if (!sequence || sequence.length === 0) return false;
    for (let i = 0; i <= sequence.length - 1; i++) {
      let letter = sequence.substr(i, 1).toUpperCase();
      if (this.symbols.indexOf(letter) === -1) return false;
    }
    return true;
  }

}



export class DnaAlphabet extends Alphabet {
  
  constructor() {
    super();
    this.symbols.push('A');
    this.symbols.push('T');
    this.symbols.push('G');
    this.symbols.push('C');
  }


}
