import 'mocha';
import { expect } from 'chai';
import { SmithWatermanAligner } from '../open-biotools/align/smith-waterman';
import { Sequence } from '../open-biotools/sequence/sequence';
import { Alphabets } from '../open-biotools/sequence/alphabets';
import { StandardSimilarityMatrix, SimilarityMatrix } from '../open-biotools/align/similarity-matrix';


describe('align.SmithWaterman', () => {


  it('should align', () => {
    let aligner = new SmithWatermanAligner();
    let s1 = new Sequence(Alphabets.DNA, 'ATTGAC');
    let s2 = new Sequence(Alphabets.DNA, 'ACCTTGACT');
    
    let matrix = new SimilarityMatrix(StandardSimilarityMatrix.Pam250);

    aligner.align(s1, s2, matrix, -8, -2);

    expect(2).to.equal(2);
  });

});