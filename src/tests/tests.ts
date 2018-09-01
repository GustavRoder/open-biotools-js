import 'mocha';
import { expect } from 'chai';

import '../open-biotools/sequence/alphabet';
import { Alphabet, DnaAlphabet } from '../open-biotools/sequence/alphabet';



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

    it('should have the 4 nucleotides', () => {
      expect(alphabet.symbols.length).to.equal(4);
      expect(alphabet.symbols).to.contain('A');
      expect(alphabet.symbols).to.contain('T');
      expect(alphabet.symbols).to.contain('G');
      expect(alphabet.symbols).to.contain('C');
    });
  });

  describe('validateSequence', () => {

    it('should return false for empty sequences', () => {
      expect(alphabet.validateSequence(null)).to.equal(false);
      expect(alphabet.validateSequence('')).to.equal(false);
    });

    it('should validate correct sequences', () => {
      expect(alphabet.validateSequence('A')).to.equal(true);
      expect(alphabet.validateSequence('ATGTTGATC')).to.equal(true);
    });

    it('should invalidate wrong sequences', () => {
      expect(alphabet.validateSequence('ATGHCCT')).to.equal(false);
      expect(alphabet.validateSequence(' TTG')).to.equal(false);
    });

  });
});
