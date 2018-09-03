import 'mocha';
import { expect } from 'chai';
import '../open-biotools/math/lm-min';
import { LmMin } from '../open-biotools/math/lm-min';


describe('Math.LmMin', () => {
  let lm = new LmMin();
  //Control and status parameters
  let control = {
    epsilon: lm.LM_MACHEP,
    ftol: .001,
    gtol: .001,
    n_maxpri: -1,
    patience: 1000,
    scale_diag: 0,
    stepbound: 1,
    verbosity: false,
    xtol: .001
  };    
  let status = {
    nfev: 0,
    outcome: 0
  };
  //Data structures
  let t = [];
  let y = [];
  let data = { t: t, y: y };
  let par = [];


  it('should solve linear equations', () => {
    //Equation: y = a*x + b
    let fCalc = (t, par) => par[0] * t + par[1]; 
    let fEval = (par, m_dat, data, fvec) => {
      for (let i = 0; i < m_dat; i++) {
        let t = data.t[i], y = data.y[i];
        fvec[i] = y - fCalc(t, par);
      }
    };

    //#1 Solve and assert
    par = [1, 1];
    t = [1, 2];
    y = [2, 4]; //a = 2, b = 0
    data = { t: t, y: y };
    lm.lmmin(par.length, par, data.t.length, data, fEval, control, status);
    //Assert
    let a = Math.round(par[0]);
    let b = Math.round(par[1]);
    expect(a).to.equal(2);
    expect(b).to.equal(0);

    //#2 Solve and assert
    par = [1, 1];
    t = [1, 2, 3];
    y = [8, 13, 18]; //a = 5, b = 3
    data = { t: t, y: y };
    lm.lmmin(par.length, par, data.t.length, data, fEval, control, status);
    //Assert
    a = Math.round(par[0]);
    b = Math.round(par[1]);
    expect(a).to.equal(5);
    expect(b).to.equal(3);
  });


  it('should solve non-linear equations', () => {
    //Equation: y = K / (1 + exp(-r * (t - t0)))
    let fCalc = (t, par) => par[0] / (1 + Math.exp(-par[1] * (t - par[2])));
    //Data: K = 5.0949, r = 0.1213, t0 = 45.7748
    t = [11, 15, 18, 23, 26, 31, 39, 44, 54, 64, 74];
    y = [0.00476, 0.0105, 0.0207, 0.0619, 0.337, 0.74, 1.7, 2.45, 3.5, 4.5, 5.09];
    par = [1, 1, 37]; //0: K, 1: r, 2: t0
    data = { t: t, y: y };
    //Evaluation function
    let fEval = (par, m_dat, data, fvec) => {
      for (let i = 0; i < m_dat; i++) {
        let t = data.t[i], y = data.y[i];
        fvec[i] = y - fCalc(t, par);
      }
    };

    lm.lmmin(par.length, par, data.t.length, data, fEval, control, status);
    let K = par[0] //~5.09
    let r = par[1]; //~0.12
    let t0 = par[2]; //~45.77
    expect(K).to.greaterThan(5.09 * 0.95);
    expect(K).to.lessThan(5.09 * 1.05);
    expect(r).to.greaterThan(0.12 * 0.95);
    expect(r).to.lessThan(0.12 * 1.05);
    expect(t0).to.greaterThan(45.77 * 0.95);
    expect(t0).to.lessThan(45.77 * 1.05);
  });

});