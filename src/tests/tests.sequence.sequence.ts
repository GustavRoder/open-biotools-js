import 'mocha';
import { expect } from 'chai';

import { Sequence } from '../open-biotools/sequence/sequence';
import { ProteinAlphabet, DnaAlphabet } from '../open-biotools/sequence/alphabet';



describe('Sequence', () => {
  let pAlphabet = new ProteinAlphabet();
  let dAlphabet = new DnaAlphabet();
  let sequence = undefined;

  describe('Alphabet', () => {
    it('should be set through ctor', () => {
      sequence = new Sequence(pAlphabet);
      expect(sequence.alphabet).to.equal(pAlphabet);
    });
  });

  describe('setSequence()', () => {
    it('should throw error, if no alphabet is set', () => {
      sequence.alphabet = undefined;
      expect(() => sequence.setSequence()).to.throw('No alphabet is set');
    });

    it('should validate these sequences against alphabets', () => {
      //Protein
      sequence.alphabet = pAlphabet;
      expect(() => sequence.setSequence('YTGHHWWINV')).to.not.throw();
      //DNA
      sequence.alphabet = dAlphabet;
      expect(() => sequence.setSequence('ATGCCA')).to.not.throw();
    });

    it('should not validate these sequences against alphabets', () => {
      //Protein
      sequence.alphabet = pAlphabet;
      expect(() => sequence.setSequence('XXXYTGHHWWINV')).to.throw('Sequence did not validate against alphabet');
      //DNA
      sequence.alphabet = dAlphabet;
      expect(() => sequence.setSequence('YRATGCCA')).to.throw('Sequence did not validate against alphabet');
    });

    it('should leave an undefined sequence when throwing errors', () => {
      //Check, that sequence is set
      sequence.alphabet = pAlphabet;
      sequence.setSequence('YRT');
      expect(sequence.sequence).to.equal('YRT');
      //Throw error
      expect(() => sequence.setSequence('X')).to.throw();
      //Check sequence for undefined
      expect(sequence.sequence).to.equal(undefined);
    });

  });

});