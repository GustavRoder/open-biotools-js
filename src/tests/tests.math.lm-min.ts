import 'mocha';
import { expect } from 'chai';
import '../open-biotools/math/lm-min';
import { LmMin } from '../open-biotools/math/lm-min';


describe('LmMin', () => {
  let lm = new LmMin();

  it('should start', () => {
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

    //y = a*x + b
    //let t = [1, 2, 3];
    //let y = [8, 13, 18]; //a = 5, b = 3
    //let par = [1, 1];
    //let fCalc = (t, par) => par[0] * t + par[1];

    //y = K / (1 + exp(-r * (t - t0))), K = 5.0949, r = 0.1213, t0 = 45.7748
    let t = [11, 15, 18, 23, 26, 31, 39, 44, 54, 64, 74];
    let y = [0.00476, 0.0105, 0.0207, 0.0619, 0.337, 0.74, 1.7, 2.45, 3.5, 4.5, 5.09];
    let par = [1, 1, 37]; //0: K, 1: r, 2: t0
    let fCalc = (t, par) => par[0] / (1 + Math.exp(-par[1] * (t - par[2])));

    //Generics
    let data = { t: t, y: y };
    let fEval = (par, m_dat, data, fvec) => {
      for (let i = 0; i < m_dat; i++) {
        let t = data.t[i], y = data.y[i];
        fvec[i] = y - fCalc(t, par);
      }
    };

    lm.lmmin(par.length, par, data.t.length, data, fEval, control, status);

    //console.log(par);
    //console.log(status);  

    //TODO: Do something with the par & status
    //TODO: Use several different equations
  });

});