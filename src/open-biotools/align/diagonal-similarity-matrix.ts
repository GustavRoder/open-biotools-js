import { SimilarityMatrix, StandardSimilarityMatrix } from './similarity-matrix';
import { Sequence } from '../sequence/sequence';



/**
 * @description Diagonal similarity matrix is a special case and needs its own class.
 * It does not have an actual matrix, instead using a test "if (col == row)" and
 * returning the diagonal value if true, and the off diagonal value if false.
 */
export class DiagonalSimilarityMatrix extends SimilarityMatrix {

  /**
   * @description Score value at diagonals. To be used when (col == row).
   */
  diagonalValue: number;

  /**
   * @description Score value off diagonals. To be used when (col != row).
   */
  offDiagonalValue: number;


  /**
   * @description Initializes a new instance of the DiagonalSimilarityMatrix class.
   * Creates a SimilarityMatrix with one value for match and one for mis-match.
   * @param {number} matchValue Diagonal score for (col == row).
   * @param {number} mismatchValue Off-diagonal score for (col != row).
   */
  constructor(matchValue: number, mismatchValue: number) {
    super(StandardSimilarityMatrix.DiagonalScoreMatrix);
    this.diagonalValue = matchValue;
    this.offDiagonalValue = mismatchValue;
    this.matrix = null; // not used

    this.name = 'Diagonal: match value ' + this.diagonalValue + ', non-match value ' + this.offDiagonalValue;

    // Set allowed symbols
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ*-abcdefghijklmnopqrstuvwxyz';
    let symbols = Sequence.getSymbolsFromSequence(str);
    for (let symbol of symbols)
      this.supportedAlphabets.push(symbol);
  }


  getValue(row: number, col: number): number {
    return col === row ? this.diagonalValue : this.offDiagonalValue;
  }

}
