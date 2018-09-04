import 'mocha';
import { expect } from 'chai';

import { DnaStatistics } from '../open-biotools/dna/dna-statistics';

let loadDnaSeq = function(dnaStat: DnaStatistics) {
  let input = 'ATGGTAGTCGATCGTCGATCTGACTAGCTACGTAGCTAGTCATCATCAGCTAGCATGCATGCATGCATCGATCG';
  dnaStat.sequence = input;
};


describe('DnaStatistics', () => {
  let input = 'ATGGTAGTCGATCGTCGATCTGACTAGCTACGTAGCTAGTCATCATCAGCTAGCATGCATGCATGCATCGATCG';
  let dnaStat = new DnaStatistics(input);

  describe('noG()', () => {
    it('should get correct number of G bases', () => {
      expect(dnaStat.noG).to.equal(2);
    });
  });
});

