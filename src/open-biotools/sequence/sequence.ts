import { IAlphabet } from "./alphabet";

export interface ISequence {

  alphabet: IAlphabet;

  sequence: string; 

  setSequence(sequence: string);


}



export class Sequence implements ISequence {

  alphabet: IAlphabet;

  sequence: string;

  constructor(alphabet: IAlphabet) {
    this.alphabet = alphabet;
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


