import 'mocha';
import { expect } from 'chai';
import { DataMatrix } from '../open-biotools/align/data-matrices';



describe('Align.DataMatrices.DataMatrix', () => {
  let m = new DataMatrix();

  it('should have undefined properties', () => {
    expect(m.letters).to.undefined;
    expect(m.values).to.undefined;
  });

  it('should get injected values using getValue()', () => {
    m.letters = ['A', 'B', 'C'];
    m.values = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    expect(m.getValue('A', 'A')).to.equal(1);
    expect(m.getValue('A', 'B')).to.equal(4);
    expect(m.getValue('A', 'C')).to.equal(7);
    expect(m.getValue('B', 'A')).to.equal(2);
    expect(m.getValue('B', 'B')).to.equal(5);
    expect(m.getValue('B', 'C')).to.equal(8);
    expect(m.getValue('C', 'A')).to.equal(3);
    expect(m.getValue('C', 'B')).to.equal(6);
    expect(m.getValue('C', 'C')).to.equal(9);
  });

});