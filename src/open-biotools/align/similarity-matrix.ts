import { ISequence } from '../sequence/sequence';
import { DataMatrix, DataMatrix_BLOSUM45, DataMatrix_BLOSUM50, DataMatrix_BLOSUM62, DataMatrix_BLOSUM80, DataMatrix_BLOSUM90, DataMatrix_PAM250, DataMatrix_PAM30, DataMatrix_PAM70, DataMatrix_AmbigiousDNA, DataMatrix_AmbigiousRNA, DataMatrix_DiagonalScore, DataMatrix_EDNAFull } from './data-matrices';



/// <summary>
/// List of available standard similarity matrices.
/// </summary>
/// <remarks>
/// BLOSUM matrices reference:
/// S Henikoff and J G Henikoff,
/// 'Amino acid substitution matrices from protein blocks.'
/// Proc Natl Acad Sci U S A. 1992 November 15; 89(22): 10915–10919.  PMCID: PMC50453
/// <para>
/// Available at:
/// <![CDATA[http://www.pubmedcentral.nih.gov/articlerender.fcgi?tool=EBI&pubmedid=1438297]]>
/// </para>
/// <para>
/// PAM matrices reference:
/// Dayhoff, M.O., Schwartz, R. and Orcutt, B.C. (1978), 
/// 'A model of Evolutionary Change in Proteins', 
/// Atlas of protein sequence and structure (volume 5, supplement 3 ed.), 
/// Nat. Biomed. Res. Found., p. 345-358, ISBN 0912466073.
/// </para>
/// </remarks>
export enum StandardSimilarityMatrix {
  /// <summary>
  /// BLOSUM45 Similarity Matrix.
  /// </summary>
  Blosum45,

  /// <summary>
  /// BLOSUM50 Similarity Matrix.
  /// </summary>
  Blosum50,

  /// <summary>
  /// BLOSUM62 Similarity Matrix.
  /// </summary>
  Blosum62,

  /// <summary>
  /// BLOSUM80 Similarity Matrix.
  /// </summary>
  Blosum80,

  /// <summary>
  /// BLOSUM90 Similarity Matrix.
  /// </summary>
  Blosum90,

  /// <summary>
  /// PAM250 Similarity Matrix.
  /// </summary>
  Pam250,

  /// <summary>
  /// PAM30 Similarity Matrix.
  /// </summary>
  Pam30,

  /// <summary>
  /// PAM70 Similarity Matrix.
  /// </summary>
  Pam70,

  /// <summary>
  /// Simple DNA Similarity Matrix.
  /// </summary>
  AmbiguousDna,

  /// <summary>
  /// RNA with ambiguous.
  /// </summary>
  AmbiguousRna,

  /// <summary>
  /// Diagonal matrix.
  /// </summary>
  DiagonalScoreMatrix,

  /// <summary>
  /// EDNAFull Similarity Matrix.
  /// </summary>
  EDnaFull
}

/// <summary>
/// Representation of a matrix that contains similarity scores for every 
/// pair of symbols in an alphabet. BLOSUM and PAM are well-known examples.
/// </summary>
export class SimilarityMatrix {

  /// <summary>
  /// Array containing the scores for each pair of symbols.
  /// The indices of the array are byte values of alphabet symbols.
  /// </summary>
  data: number[][];

  supportedAlphabets: string[];

  /// <summary> 
  /// Gets or sets descriptive name of the particular SimilarityMatrix being used. 
  /// </summary>
  name: string;


  dataMatrix: DataMatrix;


  /// <summary>
  /// Initializes a new instance of the SimilarityMatrix class
  /// Constructs one of the standard similarity matrices.
  /// </summary>
  /// <param name='matrixId'>
  /// Matrix to load, BLOSUM and PAM currently supported.
  /// The enum StandardSimilarityMatrices contains list of available matrices.
  /// </param>
  constructor(matrixId: StandardSimilarityMatrix) {
    // MoleculeType.Protein for BLOSUM and PAM series supported matrices
    this.dataMatrix = null;

    switch (matrixId) {
      case StandardSimilarityMatrix.Blosum45: this.dataMatrix = new DataMatrix_BLOSUM45(); break;
      case StandardSimilarityMatrix.Blosum50: this.dataMatrix = new DataMatrix_BLOSUM50(); break;
      case StandardSimilarityMatrix.Blosum62: this.dataMatrix = new DataMatrix_BLOSUM62(); break;
      case StandardSimilarityMatrix.Blosum80: this.dataMatrix = new DataMatrix_BLOSUM80(); break;
      case StandardSimilarityMatrix.Blosum90: this.dataMatrix = new DataMatrix_BLOSUM90(); break;
      case StandardSimilarityMatrix.Pam250: this.dataMatrix = new DataMatrix_PAM250(); break;
      case StandardSimilarityMatrix.Pam30: this.dataMatrix = new DataMatrix_PAM30(); break;
      case StandardSimilarityMatrix.Pam70: this.dataMatrix = new DataMatrix_PAM70(); break;
      case StandardSimilarityMatrix.DiagonalScoreMatrix: this.dataMatrix = new DataMatrix_DiagonalScore(); break;
      case StandardSimilarityMatrix.AmbiguousDna: this.dataMatrix = new DataMatrix_AmbigiousDNA(); break;
      case StandardSimilarityMatrix.AmbiguousRna: this.dataMatrix = new DataMatrix_AmbigiousRNA(); break;
      case StandardSimilarityMatrix.EDnaFull: this.dataMatrix = new DataMatrix_EDNAFull(); break;
    }

    this.supportedAlphabets = this.dataMatrix.letters;

    this.data = this.dataMatrix.values;    
  }





  /// <summary>
  /// Gets or sets similarity matrix values in a 2-D integer array.
  /// </summary>
  public get matrix(): number[][] {
    return this.data;
  }
  public set matrix(value: number[][]) {
    this.data = value;
  }


  /// <summary>
  /// Confirms that there is a symbol in the similarity matrix for every
  /// symbol in the sequence.
  /// </summary>
  /// <param name='sequence'>Sequence to validate.</param>
  /// <returns>true if sequence is valid.</returns>
  public validateSequence(sequence: ISequence): boolean {
    for (let symbol of sequence.symbols)
      if (this.supportedAlphabets.indexOf(symbol) === -1) return false;
    return true;
  }

}
