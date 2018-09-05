import 'mocha';
import { expect } from 'chai';

import { DnaBase } from '../open-biotools/dna/dnabase';

let loadDnaSeq = function(dnaStat: DnaBase) {
  let input = 'ATGGTAGTCGATCGTCGATCTGACTAGCTACGTAGCTAGTCATCATCAGCTAGCATGCATGCATGCATCGATCG';
  dnaStat.sequence = input;
};


describe('DnaStatistics', () => {
  let dnaStat = new DnaBase();

  describe('noG()', () => {
    it('should get correct number of G bases', () => {
      loadDnaSeq(dnaStat);
      expect(dnaStat.noG(dnaStat.sequence)).to.equal(18);
    });
  });

  describe('noC()', () => {
    it('should get correct number of C bases', () => {
      loadDnaSeq(dnaStat);
      expect(dnaStat.noG(dnaStat.sequence)).to.equal(18);
    });
  });

  describe('noA()', () => {
    it('should get correct number of A bases', () => {
      loadDnaSeq(dnaStat);
      expect(dnaStat.noG(dnaStat.sequence)).to.equal(18);
    });
  });

  describe('noT()', () => {
    it('should get correct number of T bases', () => {
      loadDnaSeq(dnaStat);
      expect(dnaStat.noG(dnaStat.sequence)).to.equal(18);
    });
  });
});

