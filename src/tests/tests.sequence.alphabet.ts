import 'mocha';
import { expect } from 'chai';

import '../open-biotools/sequence/alphabet';
import { Alphabet, DnaAlphabet, ProteinAlphabet } from '../open-biotools/sequence/alphabet';



describe('Alphabet', () => {
  let alphabet = new Alphabet();

  describe('symbols', () => {
    it('should be empty', () => {
      expect(alphabet.symbols.length).to.equal(0);
    });
  });

  describe('validateSequence', () => {
    it('should return false for empty sequences', () => {
      expect(alphabet.validateSequence(null)).to.equal(false);
      expect(alphabet.validateSequence('')).to.equal(false);
    });

    it('should validate correct sequences', () => {
      alphabet.symbols.push('A');
      alphabet.symbols.push('T');
      alphabet.symbols.push('G');
      alphabet.symbols.push('C');
      expect(alphabet.validateSequence('A')).to.equal(true);
      expect(alphabet.validateSequence('ATGTTGATC')).to.equal(true);
      alphabet.symbols = [];
    });

    it('should invalidate wrong sequences', () => {
      alphabet.symbols.push('A');
      alphabet.symbols.push('T');
      alphabet.symbols.push('G');
      alphabet.symbols.push('C');
      expect(alphabet.validateSequence('ATGHCCT')).to.equal(false);
      expect(alphabet.validateSequence(' TTG')).to.equal(false);
    });
  });

});




describe('DnaAlpabet', () => {
  let alphabet = new DnaAlphabet();
  
  describe('symbols', () => {

    it('should have the 4 nucleotides and a gap', () => {
      expect(alphabet.symbols.length).to.equal(5);
      expect(alphabet.symbols).to.contain('A');
      expect(alphabet.symbols).to.contain('T');
      expect(alphabet.symbols).to.contain('G');
      expect(alphabet.symbols).to.contain('C');
      expect(alphabet.symbols).to.contain(' ');
    });
  });

  describe('validateSequence()', () => {

    it('should return false for empty sequences', () => {
      expect(alphabet.validateSequence(null)).to.equal(false);
      expect(alphabet.validateSequence('')).to.equal(false);
    });

    it('should validate correct sequences', () => {
      expect(alphabet.validateSequence('A')).to.equal(true);
      expect(alphabet.validateSequence('ATGTTGATC')).to.equal(true);
      expect(alphabet.validateSequence('A TGTTGATC')).to.equal(true);
    });

    it('should invalidate wrong sequences', () => {
      expect(alphabet.validateSequence('ATGHCCT')).to.equal(false);
      expect(alphabet.validateSequence('X TTG')).to.equal(false);
    });

  });
});




describe('ProteinAlpabet', () => {
  let alphabet = new ProteinAlphabet();
  
  describe('symbols', () => {

    it('should have the 20 amino acids and a gap', () => {
      expect(alphabet.symbols.length).to.equal(21);
      expect(alphabet.symbols).to.contain('A');
      expect(alphabet.symbols).to.contain('C');
      expect(alphabet.symbols).to.contain('D');
      expect(alphabet.symbols).to.contain('E');
      expect(alphabet.symbols).to.contain('F');
      expect(alphabet.symbols).to.contain('G');
      expect(alphabet.symbols).to.contain('H');
      expect(alphabet.symbols).to.contain('I');
      expect(alphabet.symbols).to.contain('K');
      expect(alphabet.symbols).to.contain('L');
      expect(alphabet.symbols).to.contain('M');
      expect(alphabet.symbols).to.contain('N');
      expect(alphabet.symbols).to.contain('P');
      expect(alphabet.symbols).to.contain('Q');
      expect(alphabet.symbols).to.contain('R');
      expect(alphabet.symbols).to.contain('S');
      expect(alphabet.symbols).to.contain('T');
      expect(alphabet.symbols).to.contain('V');
      expect(alphabet.symbols).to.contain('W');
      expect(alphabet.symbols).to.contain('Y');
      expect(alphabet.symbols).to.contain(' ');
    });
  });

  describe('validateSequence()', () => {

    it('should return false for empty sequences', () => {
      expect(alphabet.validateSequence(null)).to.equal(false);
      expect(alphabet.validateSequence('')).to.equal(false);
    });

    it('should validate correct sequences', () => {
      expect(alphabet.validateSequence('A')).to.equal(true);
      expect(alphabet.validateSequence('ATYPRLG')).to.equal(true);
      expect(alphabet.validateSequence('A AAAAHHHHYYYGRT')).to.equal(true);
    });

    it('should invalidate wrong sequences', () => {
      expect(alphabet.validateSequence('UUUY')).to.equal(false);
      expect(alphabet.validateSequence('X TTG')).to.equal(false);
    });

  });
});