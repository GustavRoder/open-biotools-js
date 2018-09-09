export class DnaBase {

    sequence: string;
 
    /**
     * @description Count number of G bases
     * @param {string} seq DNA sequence
     */
    noG(seq: string) : number {
        return (seq.toUpperCase().match(new RegExp("G", "g")) || []).length;
    }

    /**
     * @description Count number of C bases
     * @param {string} seq DNA sequence
     */
    noC(seq: string) : number {
        return (seq.toUpperCase().match(new RegExp("C", "g")) || []).length;
    }

    /**
     * @description Count number of A bases
     * @param {string} seq DNA sequence
     */
    noA(seq: string) : number {
        return (seq.toUpperCase().match(new RegExp("A", "g")) || []).length;
    }

    /**
     * @description Count number of T bases
     * @param {string} seq DNA sequence
     */
    noT(seq: string) : number {
        return (seq.toUpperCase().match(new RegExp("T", "g")) || []).length;
    }
}

