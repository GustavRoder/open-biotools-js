import { Sequence } from "../sequence/sequence";
import { ProteinAlphabet, IAlphabet } from "../sequence/alphabet";


/**
 * @description Parses FASTA format
 */
export class Fasta {

  sequences: Sequence[];


  /**
   * @description Parse FASTA formatted content
   * @param {string} text FASTA formatted content
   * @param {IAlphabet} alphabet The alphabet used to sequence validate
   */
  parse(text: string, alphabet?: IAlphabet) {
    this.sequences = [];
    if (!text) throw new Error('No text input');
    
    text = text.replace(/\r/g, '');
    let lines = text.split('\n');
    
    let entry: Sequence = undefined;
    for (let line of lines) {
      if (line.length === 0) continue;
      if (line.charAt(0) == '>') {
        //New entry
        entry = new Sequence(alphabet);
        entry.name = line.substr(1);
        entry.sequence = '';
        this.sequences.push(entry);
      } else {
        //Retrieve sequence
        entry.sequence += line;
      }
    }
  }


  /**
   * @description Prints the containing sequences to FASTA format
   * @param {number} width The width of the print as single sequence characters
   */
  print(width: number = 75): string {
    let out = '';
    for (let entry of this.sequences) {
      out += '>' + entry.name + '\n';
      let c = entry.sequence.length / width;
      for (let i = 0; i < c; i++) {
        out += entry.sequence.substr(i * width, width) + '\n';
      }
    }
    return out;
  }

}