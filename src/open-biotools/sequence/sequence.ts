import { IAlphabet } from "./alphabet";

export interface ISequence {

  alphabet: IAlphabet;

  name: string;

  sequence: string; 

  setSequence(sequence: string);


}



export class Sequence implements ISequence {

  alphabet: IAlphabet;

  name: string;

  sequence: string;

  constructor(alphabet: IAlphabet, sequence?: string) {
    this.alphabet = alphabet;
    if (sequence) this.setSequence(sequence);
  }

  setSequence(sequence: string) {
    this.sequence = undefined;
    if (!this.alphabet) 
      throw new Error('No alphabet is set');
    if (!this.alphabet.validateSequence(sequence)) 
      throw new Error('Sequence did not validate against alphabet');
    this.sequence = sequence;
  }


}


