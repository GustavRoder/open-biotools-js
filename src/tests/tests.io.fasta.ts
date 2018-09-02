import 'mocha';
import { expect } from 'chai';

import { Fasta } from '../open-biotools/io/fasta';
import { DnaAlphabet } from '../open-biotools/sequence/alphabet';


let loadTwoDnaSeqs = function(fasta: Fasta) {
  let input = 
`>HSBGPG Human gene for bone gla protein (BGP)
GGCAGATTCCCCCTAGACCCGCCCGCACCATGGTCAGGCATGCCCCTCCTCATCGCTGGGCACAGCCCAGAGGGT
ATAAACAGTGCTGGAGGCTGGCGGGGCAGGCCAGCTGAGTCCTGAGCAGCAGCCCAGCGCAGCCACCGAGACA
>HSGLTH1 Human theta 1-globin gene
CCACTGCACTCACCGCACCCGGCCAATTTTTGTGTTTTTAGTAGAGACTAAATACCATATAGTGAACACCTAAGA
CGGGGGGCCTTGGATCCAGGGCGATTCAGAGGGCCCCGGTCGGAGCTGTCGGAGATTGAGCGCGCGCGGTC
`;
  fasta.parse(input, new DnaAlphabet());
};


describe('Fasta', () => {
  let fasta = new Fasta();

  describe('parse()', () => {

    it('should throw error with null input', () => {
      expect(() => fasta.parse(null)).to.throw('No text input');
    });

    it('should parse a normal format', () => {
      loadTwoDnaSeqs(fasta);
      expect(fasta.sequences.length).to.equal(2);
      expect(fasta.sequences[0].name).to.equal('HSBGPG Human gene for bone gla protein (BGP)');
      expect(fasta.sequences[0].sequence).to.equal('GGCAGATTCCCCCTAGACCCGCCCGCACCATGGTCAGGCATGCCCCTCCTCATCGCTGGGCACAGCCCAGAGGGTATAAACAGTGCTGGAGGCTGGCGGGGCAGGCCAGCTGAGTCCTGAGCAGCAGCCCAGCGCAGCCACCGAGACA');
      expect(fasta.sequences[1].name).to.equal('HSGLTH1 Human theta 1-globin gene');
      expect(fasta.sequences[1].sequence).to.equal('CCACTGCACTCACCGCACCCGGCCAATTTTTGTGTTTTTAGTAGAGACTAAATACCATATAGTGAACACCTAAGACGGGGGGCCTTGGATCCAGGGCGATTCAGAGGGCCCCGGTCGGAGCTGTCGGAGATTGAGCGCGCGCGGTC');
    });

  });

  describe('print()', () => {
    
    it('should print empty if no sequences', () => {
      fasta.sequences = [];
      expect(fasta.print()).to.equal('');
    });

    it('should print the sequences names + residues correct', () => {
      loadTwoDnaSeqs(fasta);
      let lines = fasta.print().split('\n');
      expect(lines.length).to.equal(7);
      expect(lines[0]).to.equal('>HSBGPG Human gene for bone gla protein (BGP)');
      expect(lines[1]).to.equal('GGCAGATTCCCCCTAGACCCGCCCGCACCATGGTCAGGCATGCCCCTCCTCATCGCTGGGCACAGCCCAGAGGGT');
      expect(lines[2]).to.equal('ATAAACAGTGCTGGAGGCTGGCGGGGCAGGCCAGCTGAGTCCTGAGCAGCAGCCCAGCGCAGCCACCGAGACA');
      expect(lines[3]).to.equal('>HSGLTH1 Human theta 1-globin gene');
      expect(lines[4]).to.equal('CCACTGCACTCACCGCACCCGGCCAATTTTTGTGTTTTTAGTAGAGACTAAATACCATATAGTGAACACCTAAGA');
      expect(lines[5]).to.equal('CGGGGGGCCTTGGATCCAGGGCGATTCAGAGGGCCCCGGTCGGAGCTGTCGGAGATTGAGCGCGCGCGGTC');
    });

    it('should be able to parse its own output', () => {
      loadTwoDnaSeqs(fasta);
      let oldSeqs = JSON.parse(JSON.stringify(fasta.sequences));
      expect(() => fasta.parse(fasta.print())).to.not.throw();
      expect(oldSeqs[0].name).to.equal(fasta.sequences[0].name);
      expect(oldSeqs[0].sequence).to.equal(fasta.sequences[0].sequence);
      expect(oldSeqs[1].name).to.equal(fasta.sequences[1].name);
      expect(oldSeqs[1].sequence).to.equal(fasta.sequences[1].sequence);
    });

  });

});

