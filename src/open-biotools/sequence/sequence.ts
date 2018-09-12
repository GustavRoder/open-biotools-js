import { IAlphabet } from "./alphabet";



export interface ISequence {

  alphabet: IAlphabet;

  name: string;

  sequence: string;

  symbols: string[];


  setSequence(sequence: string);

}



export class Sequence implements ISequence {

  alphabet: IAlphabet;

  name: string;

  sequence: string;

  symbols: string[];


  constructor(alphabet: IAlphabet, sequence?: string) {
    this.alphabet = alphabet;
    if (sequence) this.setSequence(sequence);
  }


  static getSymbolsFromSequence(sequence: string): string[] {
    let symbols = [];
    for (let i = 0; i < sequence.length; i++)
      symbols.push(sequence.substr(i, 1));
    return symbols;
  }


  setSequence(sequence: string) {
    this.sequence = undefined;
    this.symbols = [];

    if (!this.alphabet) throw new Error('No alphabet is set');
    if (!this.alphabet.validateSequence(sequence, 0, sequence.length)) throw new Error('Sequence did not validate against alphabet');

    this.sequence = sequence;
    this.symbols = Sequence.getSymbolsFromSequence(sequence);
  }


}
