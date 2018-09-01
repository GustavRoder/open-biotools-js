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
    this.symbols.push(' ');
  }

}





export class ProteinAlphabet extends Alphabet {
  
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


