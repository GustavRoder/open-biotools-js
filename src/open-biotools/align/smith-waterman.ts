import { PairwiseSequenceAligner } from './pairwise-sequence-aligner';
import { OptScoreMatrixCell } from './opt-score-matrix-cell';
import { SourceDirection } from './source-direction';



/// <summary>
/// Implements the SmithWaterman algorithm for partial alignment.
/// See Chapter 2 in Biological Sequence Analysis; Durbin, Eddy, Krogh and Mitchison; 
/// Cambridge Press; 1998.
/// </summary>
export class SmithWatermanAligner extends PairwiseSequenceAligner {
    /// <summary>
    /// Gets the name of the current Alignment algorithm used.
    /// This is a overridden property from the abstract parent.
    /// This property returns the Name of our algorithm i.e 
    /// Smith-Waterman algorithm.
    /// </summary>
    name: string = 'Smith-Waterman';

    /// <summary>
    /// Gets the Description of the current Alignment algorithm used.
    /// This is a overridden property from the abstract parent.
    /// This property returns a simple description of what 
    /// SmithWatermanAligner class implements.
    /// </summary>
    description: string = 'Pairwise local alignment';


    /// <summary>
    /// This is step (2) in the dynamic programming model - to fill in the scoring matrix
    /// and calculate the traceback entries.  In the Smith-Waterman algorithm, we track the
    /// highest scoring cell during the algorithm - this is often NOT the bottom/right cell as
    /// it would be in a global alignment.
    /// </summary>
    createTracebackTable(): OptScoreMatrixCell[] {
        if (this.usingAffineGapModel) return this.createAffineTracebackTable();

        let matrix: number[][] = this.similarityMatrix.matrix;
        let scoreLastRow: number[] = new Array<number>(this.cols);
        let scoreRow: number[] = new Array<number>(this.cols);

        // Initialize the high score cell to an invalid value
        let firstCell = new OptScoreMatrixCell(); firstCell.score = Number.MIN_VALUE;
        let highScoreCells: OptScoreMatrixCell[] = [firstCell];

        // Walk the sequences and generate the scores.
        for (let i = 1; i < this.rows; i++) {
            let traceback: number[] = new Array<number>(this.cols); // Initialized to STOP

            if (i > 1) {
                // Move current row to last row
                scoreLastRow = scoreRow;
                scoreRow = new Array<number>(this.cols);
            }

            for (let j = 1; j < this.cols; j++) {
                // Gap in reference sequence
                let scoreAbove: number = scoreLastRow[j] + this.gapOpenCost;

                // Gap in query sequence
                let scoreLeft: number = scoreRow[j - 1] + this.gapOpenCost;

                // Match/mismatch score
                let mScore: number = (matrix != null) ? matrix[this.querySequence[i - 1]][this.referenceSequence[j - 1]] : this.similarityMatrix[this.querySequence[i - 1], this.referenceSequence[j - 1]];
                let scoreDiag: number = scoreLastRow[j - 1] + mScore;

                // Calculate the current cell score and trackback
                // M[i,j] = MAX(M[i-1,j-1] + S[i,j], M[i,j-1] + gapCost, M[i-1,j] + gapCost)
                let score: number;
                if ((scoreDiag > scoreAbove) && (scoreDiag > scoreLeft)) {
                    score = scoreDiag;
                    traceback[j] = SourceDirection.diagonal;
                } else if (scoreLeft > scoreAbove) {
                    score = scoreLeft;
                    traceback[j] = SourceDirection.left;
                } else { //if (scoreAbove > scoreLeft) 
                    score = scoreAbove;
                    traceback[j] = SourceDirection.up;
                }

                // Do not allow for negative scores in the local alignment.
                if (score <= 0) {
                    score = 0;
                    traceback[j] = SourceDirection.stop;
                }

                // Keep track of the highest scoring cell for our final score.
                if (score >= highScoreCells[0].score) {
                    if (score > highScoreCells[0].score) highScoreCells = [];
                    let cell = new OptScoreMatrixCell();
                    cell.row = i; cell.col = j; cell.score = score;
                    highScoreCells.push(cell);
                }

                scoreRow[j] = score;
            }

            // Save off the traceback row
            this.traceback[i] = traceback;

            if (this.includeScoreTable) {
                this.scoreTable.splice(0, 0, ...scoreRow); //Array.Copy(scoreRow, 0, ScoreTable, i * Cols, Cols);
            }
        }

        return highScoreCells;
    }


    /// <summary>
    /// This method is used to create the traceback/scoring table when an affine gap model 
    /// is being used - this is where the open cost is different than the extension cost for a gap
    /// and generally will produce a better alignment.
    /// </summary>
    createAffineTracebackTable(): OptScoreMatrixCell[] {
        // Initialize the high score cell to an invalid value
        let firstCell = new OptScoreMatrixCell(); firstCell.score = Number.MIN_VALUE;
        let highScoreCells: OptScoreMatrixCell[] = [firstCell];

        // Score matrix - we just track the current row and prior row for better memory utilization
        let scoreLastRow: number[] = new Array<number>(this.cols);
        let scoreRow: number[] = new Array<number>(this.cols);
        let matrix: number[][] = this.similarityMatrix.matrix;

        // Horizontal and vertical gap counts.
        let gapStride: number = this.cols + 1;
        let matrixSize = (this.rows + 1) * gapStride;
        let hgapCost: number[] = new Array<number>(matrixSize), vgapCost: number[] = new Array<number>(matrixSize);
        this.h_Gap_Length = new Array<number>(matrixSize);
        this.v_Gap_Length = new Array<number>(matrixSize);

        // Initialize the gap extension cost matrices.
        for (let i = 1; i < this.rows; i++) {
            this.h_Gap_Length[i * gapStride] = i;
            this.v_Gap_Length[i * gapStride] = 1;
            hgapCost[i * gapStride] = this.gapExtensionCost * (i - 1) + this.gapOpenCost;
        }
        for (let j = 1; j < this.cols; j++) {
            this.h_Gap_Length[j] = 1;
            this.v_Gap_Length[j] = j;
            vgapCost[j] = this.gapExtensionCost * (j - 1) + this.gapOpenCost;
        }

        // Walk the sequences and generate the scoring/traceback matrix
        for (let i = 1; i < this.rows; i++) {
            let traceback: number[] = new Array<number>(this.cols); 
            // Initialized to STOP
            for (let m = 0; m < traceback.length; m++)
                traceback[m] = SourceDirection.stop;

            if (i > 1) {
                // Move current row to last row
                scoreLastRow = scoreRow;
                scoreRow = new Array<number>(this.cols);
            }

            for (let j = 1; j < this.cols; j++) {
                // Gap in sequence #1 (reference)
                let scoreAbove: number;
                let scoreAboveOpen: number = scoreLastRow[j] + this.gapOpenCost;
                let scoreAboveExtend: number = vgapCost[(i - 1) * gapStride + j] + this.gapExtensionCost;
                if (scoreAboveOpen > scoreAboveExtend) {
                    scoreAbove = scoreAboveOpen;
                    this.v_Gap_Length[i * gapStride + j] = 1;
                } else {
                    scoreAbove = scoreAboveExtend;
                    this.v_Gap_Length[i * gapStride + j] = this.v_Gap_Length[(i - 1) * gapStride + j] + 1;
                }

                // Gap in sequence #2 (query)
                let scoreLeft: number;
                let scoreLeftOpen: number = scoreRow[j - 1] + this.gapOpenCost;
                let scoreLeftExtend: number = hgapCost[i * gapStride + (j - 1)] + this.gapExtensionCost;
                if (scoreLeftOpen > scoreLeftExtend) {
                    scoreLeft = scoreLeftOpen;
                    this.h_Gap_Length[i * gapStride + j] = 1;
                } else {
                    scoreLeft = scoreLeftExtend;
                    this.h_Gap_Length[i * gapStride + j] = this.h_Gap_Length[i * gapStride + (j - 1)] + 1;
                }

                // Store off the gaps costs for this cell
                hgapCost[i * gapStride + j] = scoreLeft;
                vgapCost[i * gapStride + j] = scoreAbove;

                // Match score (diagonal)
                console.log(matrix[0])
                let mScore: number = this.similarityMatrix.dataMatrix.getValue(this.querySequence[i - 1], this.referenceSequence[j - 1]);
                //let mScore = matrix ? matrix.
                //let mScore: number = (matrix != null) ? matrix[this.querySequence[i - 1]][this.referenceSequence[j - 1]] : this.similarityMatrix[this.querySequence[i - 1], this.referenceSequence[j - 1]];
                let scoreDiag: number = scoreLastRow[j - 1] + mScore;

                // Calculate the current cell score and trackback
                // M[i,j] = MAX(M[i-1,j-1] + S[i,j], M[i,j-1] + gapCost, M[i-1,j] + gapCost)
                let score: number;
                if ((scoreDiag > scoreAbove) && (scoreDiag > scoreLeft)) {
                    score = scoreDiag;
                    traceback[j] = SourceDirection.diagonal;
                } else if (scoreLeft > scoreAbove) {
                    score = scoreLeft;
                    traceback[j] = SourceDirection.left;
                } else { //if (scoreAbove > scoreLeft)
                    score = scoreAbove;
                    traceback[j] = SourceDirection.up;
                }

                // Do not allow for negative scores in the local alignment.
                if (score <= 0) {
                    score = 0;
                    traceback[j] = SourceDirection.stop;
                }

                // Keep track of the highest scoring cell for our final score.
                if (score >= highScoreCells[0].score) {
                    if (score > highScoreCells[0].score) highScoreCells = [];
                    let cell = new OptScoreMatrixCell(); cell.row = i; cell.col = j; cell.score = score;
                    highScoreCells.push(cell);
                }

                scoreRow[j] = score;
            }

            // Save off the traceback row
            this.traceback[i] = traceback;

            if (this.includeScoreTable) {
                this.scoreTable.splice(0, 0, ...scoreRow);
                //Array.Copy(scoreRow, 0, ScoreTable, i * Cols, Cols);
            }
        }
        return highScoreCells;
    }
}
