export class LmMin {

  readonly LM_MACHEP: number = 1.2e-16;
  readonly LM_DWARF: number = 1.0e-38;
  readonly LM_SQRT_DWARF: number = 3.834e-20;
  readonly LM_SQRT_GIANT: number = 1.304e19;
  readonly LM_USER_TOL: number = 1.e-14;

  constructor() {

  }




  /*****************************************************************************/
  /*  Monitoring auxiliaries.                                                  */
  /*****************************************************************************/
  lm_print_pars(nout, par, fnorm) {
    for (let i = 0; i < nout; ++i)
      console.log('par[' + i + ']: ' + par[i]);
    console.log(` => ${fnorm}`);
  }



  /*****************************************************************************/
  /*  lmmin (main minimization routine)                                        */
  /*****************************************************************************/
  lmmin(n, x, m, data, fEval, C, S) {
    let fvec = [], diag = [], fjac = [], qtf = [], wa1 = [], wa2 = [], wa3 = [], wf = [], ipvt = [],
        actred, dirder, fnorm, fnorm1, gnorm, pnorm, prered,
        ratio, step, sum, temp, temp1, temp2, temp3, p0001 = 1.0e-4, doOuter = true;

    let terminate = () => {
      S.fnorm = this.lm_enorm(m, fvec);
      if (C.verbosity) {
        console.log(`Outcome (${S.outcome}) xnorm ${xnorm} ftol ${C.ftol} xtol ${C.xtol}`);
        console.log('lmmin final');
        this.lm_print_pars(nout, x, S.fnorm);
        doOuter = false;
      }
    };

    let maxfev = C.patience * (n + 1);

    let outer, inner;  /* loop counters, for monitoring */
    let lmpar = 0;     /* Levenberg-Marquardt parameter */
    let delta = 0;
    let xnorm = 0;
    let eps = Math.sqrt(Math.max(C.epsilon, this.LM_MACHEP)); /* for forward differences */

    let nout = C.n_maxpri === -1 ? n : Math.min(C.n_maxpri, n);

    /***  Check input parameters for errors.  ***/
    if (n <= 0) {
      S.outcome = 10; /* invalid parameter */
      throw Error(`Invalid number of parameters ${n}`);
    }
    if (m < n) {
      S.outcome = 10;
      throw Error(`Number of data points ${m} smaller than number of parameters ${n}`);
    }
    if (C.ftol < 0 || C.xtol < 0 || C.gtol < 0) {
      S.outcome = 10;
      throw Error(`Negative tolerance (at least one of ${C.ftol} ${C.xtol} ${C.gtol})`);  
    }
    if (maxfev <= 0) {
      S.outcome = 10;
      throw Error(`Non-positive function evaluations limit ${maxfev}`);
    }
    if (C.stepbound <= 0) {
      S.outcome = 10;
      throw Error(`Non-positive stepbound ${C.stepbound}`);
    }
    if (C.scale_diag !== 0 && C.scale_diag !== 1) {
      S.outcome = 10;
      throw Error(`Logical variable scale_diag=${C.scale_diag}`);
    }

    if (C.scale_diag === 0)
      for (let j = 0; j < n; j++)
        diag[j] = 1;

    /***  Evaluate function at starting point and calculate norm.  ***/
    fEval(x, m, data, fvec);
    S.nfev = 1;

    fnorm = this.lm_enorm(m, fvec);

    if (C.verbosity) {
      console.log('lmmin start');
      this.lm_print_pars(nout, x, fnorm);
    }
    
    if (fnorm <= this.LM_DWARF) {
      S.outcome = 0; /* sum of squares almost zero, nothing to do */
      return;
    }

    /***  The outer loop: compute gradient, then descend.  ***/
    for (outer = 0; doOuter && outer < 1000; ++outer) {
      /***  [outer]  Calculate the Jacobian.  ***/
      for (let j = 0; j < n && doOuter; j++) {
        temp = x[j];
        step = Math.max(eps * eps, eps * Math.abs(temp));
        x[j] += step; /* replace temporarily */
        fEval(x, m, data, wf);
        S.nfev++;
        for (let i = 0; i < m; i++)
          fjac[j * m + i] = (wf[i] - fvec[i]) / step;
        x[j] = temp; /* restore */
      }

      if (C.verbosity) {
        /* print the entire matrix */
        console.log('lmmin Jacobian');
        for (let i = 0; i < m; i++) {
          let str = '  ';
          for (let j = 0; j < n; j++)
            str += fjac[j * m + i] + ' ';
          console.log(str);
        }
      }

      /***  [outer]  Compute the QR factorization of the Jacobian.  ***/
      /*      fjac is an m by n array. The upper n by n submatrix of fjac 
      *        is made to contain an upper triangular matrix r with diagonal
      *        elements of nonincreasing magnitude such that
      *
      *              p^T*(jac^T*jac)*p = r^T*r
      *
      *              (NOTE: ^T stands for matrix transposition),
      *
      *        where p is a permutation matrix and jac is the final calculated
      *        Jacobian. Column j of p is column ipvt(j) of the identity matrix.
      *        The lower trapezoidal part of fjac contains information generated
      *        during the computation of r.
      *
      *      ipvt is an integer array of length n. It defines a permutation
      *        matrix p such that jac*p = q*r, where jac is the final calculated
      *        Jacobian, q is orthogonal (not stored), and r is upper triangular
      *        with diagonal elements of nonincreasing magnitude. Column j of p
      *        is column ipvt(j) of the identity matrix.
      */

      this.lm_qrfac(m, n, fjac, ipvt, wa1, wa2, wa3);
      /* return values are ipvt, wa1=rdiag, wa2=acnorm */

      /***  [outer]  Form q^T * fvec and store first n components in qtf.  ***/
      for (let i = 0; i < m; i++)
        wf[i] = fvec[i];

      for (let j = 0; j < n; j++) {
        temp3 = fjac[j * m + j];
        if (temp3 !== 0) {
          sum = 0;
          for (let i = j; i < m; i++)
            sum += fjac[j * m + i] * wf[i];
          temp = -sum / temp3;
          for (let i = j; i < m; i++)
            wf[i] += fjac[j * m + i] * temp;
        }
        fjac[j * m + j] = wa1[j];
        qtf[j] = wf[j];
      }

      /***  [outer]  Compute norm of scaled gradient and detect degeneracy.  ***/
      gnorm = 0;
      for (let j = 0; j < n; j++) {
        if (wa2[ipvt[j]] === 0) continue;
        sum = 0;
        for (let i = 0; i <= j; i++)
          sum += fjac[j * m + i] * qtf[i];
        gnorm = Math.max(gnorm, Math.abs(sum / wa2[ipvt[j]] / fnorm));
      }

      if (gnorm <= C.gtol) {
        S.outcome = 4;
        terminate();
        doOuter = false;
      }

      /***  [outer]  Initialize / update diag and delta. ***/
      if (outer === 0) { 
          /* first iteration only */
          if (C.scale_diag === 1) {
            /* diag := norms of the columns of the initial Jacobian */
            for (let j = 0; j < n; j++)
              diag[j] = wa2[j] ? wa2[j] : 1;
              /* xnorm := || D x || */
            for (let j = 0; j < n; j++)
              wa3[j] = diag[j] * x[j];
            xnorm = this.lm_enorm(n, wa3);
            if (C.verbosity) {
              console.log('lmmin diag');
              this.lm_print_pars(nout, x, xnorm);
            }
            /* only now print the header for the loop table */
            if (C.verbosity) {
              console.log('  o  i     lmpar    prered       ratio    dirder      delta      pnorm        fnorm');
              for (let i = 0; i < nout; ++i)
                console.log('               ${i}');
            }
          } else {
            xnorm = this.lm_enorm(n, x);
          }
          /* initialize the step bound delta. */
          if (xnorm > 0) delta = C.stepbound * xnorm;
          else delta = C.stepbound;
      } else {
        if (C.scale_diag === 1) {
          for (let j = 0; j < n; j++)
            diag[j] = Math.max(diag[j], wa2[j]);
        }
      }

      /***  The inner loop. ***/
      inner = 0;
      let inner_success = false;
      while (!inner_success && inner < 100) {

        /***  [inner]  Determine the Levenberg-Marquardt parameter.  ***/
        this.lm_lmpar(n, fjac, m, ipvt, diag, qtf, delta, lmpar, wa1, wa2, wf, wa3);
        /* used return values are fjac (partly), lmpar, wa1=x, wa3=diag*x */

        /* predict scaled reduction */
        pnorm = this.lm_enorm(n, wa3);
        temp2 = lmpar * (pnorm / fnorm) * (pnorm / fnorm);
        for (let j = 0; j < n; j++) {
          wa3[j] = 0;
          for (let i = 0; i <= j; i++)
            wa3[i] -= fjac[j * m + i] * wa1[ipvt[j]];
        }
        temp1 = (this.lm_enorm(n, wa3) / fnorm) * (this.lm_enorm(n, wa3) / fnorm);
        prered = temp1 + 2 * temp2;
        dirder = -temp1 + temp2; /* scaled directional derivative */

        /* at first call, adjust the initial step bound. */
        if (outer === 0 && pnorm < delta ) delta = pnorm;

        /***  [inner]  Evaluate the function at x + p.  ***/
        for (let j = 0; j < n; j++)
          wa2[j] = x[j] - wa1[j];

        fEval(wa2, m, data, wf);
        S.nfev++;
        fnorm1 = this.lm_enorm(m, wf);

        /***  [inner]  Evaluate the scaled reduction.  ***/

        /* actual scaled reduction */
        actred = 1 - (fnorm1 / fnorm) * (fnorm1 / fnorm);

        /* ratio of actual to predicted reduction */
        ratio = prered ? actred / prered : 0;

        if (C.verbosity) {
          console.log(`lmmin (${outer}:${inner})`);
          this.lm_print_pars(nout, wa2, fnorm1);
          console.log(`${outer} ${inner} ${lmpar} ${prered} ${ratio} ${dirder} ${delta} ${pnorm} ${fnorm1}`);
          for (let i = 0; i < nout; ++i)
            console.log(wa2[i]);
        }

        /* update the step bound */
        if (ratio <= 0.25) {
          if (actred >= 0)
            temp = 0.5;
          else if (actred > -99) /* -99 = 1-1/0.1^2 */
            temp = Math.max(dirder / (2 * dirder + actred), 0.1);
          else
            temp = 0.1;
          delta = temp * Math.min(delta, pnorm / 0.1);
          lmpar /= temp;
        } else if (ratio >= 0.75) {
          delta = 2 * pnorm;
          lmpar *= 0.5;
        } else if (!lmpar) {
          delta = 2 * pnorm;
        }

        /***  [inner]  On success, update solution, and test for convergence.  ***/

        inner_success = ratio >= p0001;
        if (inner_success) {
          /* update x, fvec, and their norms */
          if (C.scale_diag === 1) {
            for (let j = 0; j < n; j++) {
              x[j] = wa2[j];
              wa2[j] = diag[j] * x[j];
            }
          } else {
            for (let j = 0; j < n; j++)
              x[j] = wa2[j];
          }
          for (let i = 0; i < m; i++)
            fvec[i] = wf[i];
          xnorm = this.lm_enorm(n, wa2);
          fnorm = fnorm1;
        }

        /* convergence tests */ 
        S.outcome = 0;
        if (fnorm <= this.LM_DWARF) {
          terminate();  /* success: sum of squares almost zero */
          doOuter = false;
        }
        /* test two criteria (both may be fulfilled) */
        if (Math.abs(actred) <= C.ftol && prered <= C.ftol && ratio <= 2)
            S.outcome = 1;  /* success: x almost stable */
        if (delta <= C.xtol * xnorm)
            S.outcome += 2; /* success: sum of squares almost stable */
        if (S.outcome !== 0) {
          terminate();
          doOuter = false;
        }

        /***  [inner]  Tests for termination and stringent tolerances.  ***/
        if (S.nfev >= maxfev) {
          S.outcome = 5;
          terminate();
          doOuter = false;
        }
        if (Math.abs(actred) <= this.LM_MACHEP && prered <= this.LM_MACHEP && ratio <= 2 ) {
          S.outcome = 6;
          terminate();
          doOuter = false;
        }
        if (delta <= this.LM_MACHEP * xnorm) {
          S.outcome = 7;
          terminate();
          doOuter = false;
        }
        if (gnorm <= this.LM_MACHEP) {
          S.outcome = 8;
          terminate();
          doOuter = false;
        }

        ++inner;
      } /***  [inner]  End of the loop. Repeat if iteration unsuccessful.  ***/
    } /***  [outer]  End of the loop. ***/
  }






/*****************************************************************************
 *  lm_lmpar (determine Levenberg-Marquardt parameter)                       
 *     Given an m by n matrix a, an n by n nonsingular diagonal
 *     matrix d, an m-vector b, and a positive number delta,
 *     the problem is to determine a value for the parameter
 *     par such that if x solves the system
 *
 *          a*x = b  and  sqrt(par)*d*x = 0
 *
 *     in the least squares sense, and dxnorm is the euclidean
 *     norm of d*x, then either par=0 and (dxnorm-delta) < 0.1*delta,
 *     or par>0 and abs(dxnorm-delta) < 0.1*delta.
 *
 *     Using lm_qrsolv, this subroutine completes the solution of the problem
 *     if it is provided with the necessary information from the
 *     qr factorization, with column pivoting, of a. That is, if
 *     a*p = q*r, where p is a permutation matrix, q has orthogonal
 *     columns, and r is an upper triangular matrix with diagonal
 *     elements of nonincreasing magnitude, then lmpar expects
 *     the full upper triangle of r, the permutation matrix p,
 *     and the first n components of qT*b. On output
 *     lmpar also provides an upper triangular matrix s such that
 *
 *          p^T*(a^T*a + par*d*d)*p = s^T*s.
 *
 *     s is employed within lmpar and may be of separate interest.
 *
 *     Only a few iterations are generally needed for convergence
 *     of the algorithm. If, however, the limit of 10 iterations
 *     is reached, then the output par will contain the best
 *     value obtained so far.
 *
 *     parameters:
 *
 *      n is a positive integer input variable set to the order of r.
 *
 *      r is an n by n array. on input the full upper triangle
 *        must contain the full upper triangle of the matrix r.
 *        on OUTPUT the full upper triangle is unaltered, and the
 *        strict lower triangle contains the strict upper triangle
 *        (transposed) of the upper triangular matrix s.
 *
 *      ldr is a positive integer input variable not less than n
 *        which specifies the leading dimension of the array r.
 *
 *      ipvt is an integer input array of length n which defines the
 *        permutation matrix p such that a*p = q*r. column j of p
 *        is column ipvt(j) of the identity matrix.
 *
 *      diag is an input array of length n which must contain the
 *        diagonal elements of the matrix d.
 *
 *      qtb is an input array of length n which must contain the first
 *        n elements of the vector (q transpose)*b.
 *
 *      delta is a positive input variable which specifies an upper
 *        bound on the euclidean norm of d*x.
 *
 *      par is a nonnegative variable. on input par contains an
 *        initial estimate of the levenberg-marquardt parameter.
 *        on OUTPUT par contains the final estimate.
 *
 *      x is an OUTPUT array of length n which contains the least
 *        squares solution of the system a*x = b, sqrt(par)*d*x = 0,
 *        for the output par.
 *
 *      sdiag is an array of length n needed as workspace; on OUTPUT
 *        it contains the diagonal elements of the upper triangular matrix s.
 *
 *      aux is a multi-purpose work array of length n.
 *
 *      xdi is a work array of length n. On OUTPUT: diag[j] * x[j].
 *****************************************************************************/
lm_lmpar(n, r, ldr, ipvt, diag, qtb, delta, par, x, sdiag, aux, xdi) {
  let iter, nsing, dxnorm, fp, fp_old, gnorm, parc, parl, paru, sum, temp, p1 = 0.1;

  /*** lmpar: compute and store in x the gauss-newton direction. if the
     jacobian is rank-deficient, obtain a least squares solution. ***/
  nsing = n;
  for (let j = 0; j < n; j++) {
    aux[j] = qtb[j];
    if (r[j * ldr + j] === 0 && nsing === n) nsing = j;
    if (nsing < n) aux[j] = 0;
  }
  for (let j = nsing - 1; j >= 0; j--) {
    aux[j] = aux[j] / r[j + ldr * j];
    temp = aux[j];
    for (let i = 0; i < j; i++)
      aux[i] -= r[j * ldr + i] * temp;
  }
  for (let j = 0; j < n; j++)
    x[ipvt[j]] = aux[j];

  /*** lmpar: initialize the iteration counter, evaluate the function at the
     origin, and test for acceptance of the gauss-newton direction. ***/
  for (let j = 0; j < n; j++)
      xdi[j] = diag[j] * x[j];
  dxnorm = this.lm_enorm(n, xdi);
  fp = dxnorm - delta;
  if (fp <= p1 * delta) {
    par = 0;
    return;
  }

  /*** lmpar: if the jacobian is not rank deficient, the newton
     step provides a lower bound, parl, for the 0. of
     the function. otherwise set this bound to 0.. ***/
  parl = 0;
  if (nsing >= n) {
    for (let j = 0; j < n; j++)
      aux[j] = diag[ipvt[j]] * xdi[ipvt[j]] / dxnorm;

    for (let j = 0; j < n; j++) {
      sum = 0.;
      for (let i = 0; i < j; i++)
        sum += r[j * ldr + i] * aux[i];
      aux[j] = (aux[j] - sum) / r[j + ldr * j];
    }
    temp = this.lm_enorm(n, aux);
    parl = fp / delta / temp / temp;
  }

  /*** lmpar: calculate an upper bound, paru, for the 0. of the function. ***/
  for (let j = 0; j < n; j++) {
    sum = 0;
    for (let i = 0; i <= j; i++)
      sum += r[j * ldr + i] * qtb[i];
    aux[j] = sum / diag[ipvt[j]];
  }
  gnorm = this.lm_enorm(n, aux);
  paru = gnorm / delta;
  if (paru == 0) paru = this.LM_DWARF / Math.min(delta, p1);

  /*** lmpar: if the input par lies outside of the interval (parl,paru),
     set par to the closer endpoint. ***/
  par = Math.max(par, parl);
  par = Math.min(par, paru);
  if (par === 0) par = gnorm / dxnorm;

  /*** lmpar: iterate. ***/
  for (iter = 0; true; iter++) {

    /** evaluate the function at the current value of par. **/
    if (par === 0) par = Math.max(this.LM_DWARF, 0.001 * paru);
    temp = Math.sqrt(par);
    for (let j = 0; j < n; j++)
      aux[j] = temp * diag[j];

    this.lm_qrsolv(n, r, ldr, ipvt, aux, qtb, x, sdiag, xdi);
    /* return values are r, x, sdiag */

    for (let j = 0; j < n; j++)
      xdi[j] = diag[j] * x[j]; /* used as output */
    dxnorm = this.lm_enorm(n, xdi);
    fp_old = fp;
    fp = dxnorm - delta;
        
    /** if the function is small enough, accept the current value
        of par. Also test for the exceptional cases where parl
        is zero or the number of iterations has reached 10. **/
    if (Math.abs(fp) <= p1 * delta || (parl === 0 && fp <= fp_old && fp_old < 0) || iter === 10) {
      break; /* the only exit from the iteration. */
    }
    
    /** compute the Newton correction. **/
    for (let j = 0; j < n; j++)
      aux[j] = diag[ipvt[j]] * xdi[ipvt[j]] / dxnorm;

    for (let j = 0; j < n; j++) {
      aux[j] = aux[j] / sdiag[j];
      for (let i = j + 1; i < n; i++)
        aux[i] -= r[j * ldr + i] * aux[j];
    }
    temp = this.lm_enorm(n, aux);
    parc = fp / delta / temp / temp;

    /** depending on the sign of the function, update parl or paru. **/
    if (fp > 0) parl = Math.max(parl, par);
    else if (fp < 0) paru = Math.min(paru, par);
    /* the case fp==0 is precluded by the break condition  */
    
    /** compute an improved estimate for par. **/
    par = Math.max(parl, par + parc);
  }
}



  

  /*****************************************************************************
  *  lm_qrfac (QR factorization, from lapack)                                 
  *
  *     This subroutine uses Householder transformations with column
  *     pivoting (optional) to compute a qr factorization of the
  *     m by n matrix a. That is, qrfac determines an orthogonal
  *     matrix q, a permutation matrix p, and an upper trapezoidal
  *     matrix r with diagonal elements of nonincreasing magnitude,
  *     such that a*p = q*r. The Householder transformation for
  *     column k, k = 1,2,...,min(m,n), is of the form
  *
  *          i - (1/u(k))*u*uT
  *
  *     where u has zeroes in the first k-1 positions. The form of
  *     this transformation and the method of pivoting first
  *     appeared in the corresponding linpack subroutine.
  *
  *     Parameters:
  *
  *      m is a positive integer input variable set to the number
  *        of rows of a.
  *
  *      n is a positive integer input variable set to the number
  *        of columns of a.
  *
  *      a is an m by n array. On input a contains the matrix for
  *        which the qr factorization is to be computed. On OUTPUT
  *        the strict upper trapezoidal part of a contains the strict
  *        upper trapezoidal part of r, and the lower trapezoidal
  *        part of a contains a factored form of q (the non-trivial
  *        elements of the u vectors described above).
  *
  *      ipvt is an integer OUTPUT array of length lipvt. This array
  *        defines the permutation matrix p such that a*p = q*r.
  *        Column j of p is column ipvt(j) of the identity matrix.
  *
  *      rdiag is an OUTPUT array of length n which contains the
  *        diagonal elements of r.
  *
  *      acnorm is an OUTPUT array of length n which contains the
  *        norms of the corresponding columns of the input matrix a.
  *        If this information is not needed, then acnorm can coincide
  *        with rdiag.
  *
  *      wa is a work array of length n.
  *****************************************************************************/
  lm_qrfac(m, n, a, ipvt, rdiag, acnorm, wa) {
    let kmax, minmn, ajnorm, sum, temp;

    /*** qrfac: compute initial column norms and initialize several arrays. ***/
    for (let j = 0; j < n; j++) {
      let as = a.slice(j * m, j * m + 3);
      acnorm[j] = this.lm_enorm(m, as);
      rdiag[j] = acnorm[j];
      wa[j] = rdiag[j];
      ipvt[j] = j;
    }

    /*** qrfac: reduce a to r with Householder transformations. ***/
    minmn = Math.min(m, n);
    for (let j = 0; j < minmn; j++) {
      /** bring the column of largest norm into the pivot position. **/
      kmax = j;
      for (let k = j + 1; k < n; k++)
          if (rdiag[k] > rdiag[kmax]) kmax = k;
      if (kmax !== j) {
        for (let i = 0; i < m; i++) {
          temp = a[j * m + i];
          a[j * m + i] = a[kmax * m + i];
          a[kmax * m + i] = temp;
        }
        rdiag[kmax] = rdiag[j];
        wa[kmax] = wa[j];
        let k = ipvt[j];
        ipvt[j] = ipvt[kmax];
        ipvt[kmax] = k;
      }

      /** compute the Householder transformation to reduce the
          j-th column of a to a multiple of the j-th unit vector. **/
      let as = a.slice(j * m + j, j * m + j + (m - j));
      ajnorm = this.lm_enorm(m - j, as);
      if (ajnorm === 0) {
        rdiag[j] = 0;
        continue;
      }

      if (a[j * m + j] < 0)
        ajnorm = -ajnorm;
      for (let i = j; i < m; i++)
        a[j * m + i] /= ajnorm;
      a[j * m + j] += 1;

      /** apply the transformation to the remaining columns
          and update the norms. **/
      for (let k = j + 1; k < n; k++) {
          sum = 0;
          for (let i = j; i < m; i++)
            sum += a[j * m + i] * a[k * m + i];

          temp = sum / a[j + m * j];
          for (let i = j; i < m; i++)
            a[k * m + i] -= temp * a[j * m + i];

          if (rdiag[k] !== 0) {
              temp = a[m * k + j] / rdiag[k];
              temp = Math.max(0, 1 - temp * temp);
              rdiag[k] *= Math.sqrt(temp);
              temp = rdiag[k] / wa[k];
              if (0.05 * (temp * temp) <= this.LM_MACHEP) {
                let as = a.slice(m * k + j + 1, m * k + j + 1 + (m - j - 1));
                rdiag[k] = this.lm_enorm(m - j - 1, as);
                wa[k] = rdiag[k];
              }
          }
      }

      rdiag[j] = -ajnorm;
    }
  }




  /*****************************************************************************
  *  lm_qrsolv (linear least-squares)                                         
  *     Given an m by n matrix a, an n by n diagonal matrix d,
  *     and an m-vector b, the problem is to determine an x which
  *     solves the system
  *
  *          a*x = b  and  d*x = 0
  *
  *     in the least squares sense.
  *
  *     This subroutine completes the solution of the problem
  *     if it is provided with the necessary information from the
  *     qr factorization, with column pivoting, of a. That is, if
  *     a*p = q*r, where p is a permutation matrix, q has orthogonal
  *     columns, and r is an upper triangular matrix with diagonal
  *     elements of nonincreasing magnitude, then qrsolv expects
  *     the full upper triangle of r, the permutation matrix p,
  *     and the first n components of (q transpose)*b. The system
  *     a*x = b, d*x = 0, is then equivalent to
  *
  *          r*z = q^T*b,  p^T*d*p*z = 0,
  *
  *     where x = p*z. If this system does not have full rank,
  *     then a least squares solution is obtained. On output qrsolv
  *     also provides an upper triangular matrix s such that
  *
  *          p^T *(a^T *a + d*d)*p = s^T *s.
  *
  *     s is computed within qrsolv and may be of separate interest.
  *
  *     Parameters
  *
  *      n is a positive integer input variable set to the order of r.
  *
  *      r is an n by n array. On input the full upper triangle
  *        must contain the full upper triangle of the matrix r.
  *        On OUTPUT the full upper triangle is unaltered, and the
  *        strict lower triangle contains the strict upper triangle
  *        (transposed) of the upper triangular matrix s.
  *
  *      ldr is a positive integer input variable not less than n
  *        which specifies the leading dimension of the array r.
  *
  *      ipvt is an integer input array of length n which defines the
  *        permutation matrix p such that a*p = q*r. Column j of p
  *        is column ipvt(j) of the identity matrix.
  *
  *      diag is an input array of length n which must contain the
  *        diagonal elements of the matrix d.
  *
  *      qtb is an input array of length n which must contain the first
  *        n elements of the vector (q transpose)*b.
  *
  *      x is an OUTPUT array of length n which contains the least
  *        squares solution of the system a*x = b, d*x = 0.
  *
  *      sdiag is an OUTPUT array of length n which contains the
  *        diagonal elements of the upper triangular matrix s.
  *
  *      wa is a work array of length n.
  ******************************************************************************/
  lm_qrsolv(n, r, ldr, ipvt, diag, qtb, x, sdiag, wa) {
    let kk, nsing, qtbpj, sum, temp;
    let _sin, _cos, _tan, _cot; /* local variables, not functions */

    /*** qrsolv: copy r and q^T*b to preserve input and initialize s.
       in particular, save the diagonal elements of r in x. ***/
    for (let j = 0; j < n; j++) {
      for (let i = j; i < n; i++)
        r[j * ldr + i] = r[i * ldr + j];
      x[j] = r[j * ldr + j];
      wa[j] = qtb[j];
    }

    /*** qrsolv: eliminate the diagonal matrix d using a Givens rotation. ***/
    for (let j = 0; j < n; j++) {

      /*** qrsolv: prepare the row of d to be eliminated, locating the
       diagonal element using p from the qr factorization. ***/
      if (diag[ipvt[j]] !== 0) {
        for (let k = j; k < n; k++)
          sdiag[k] = 0.;
        sdiag[j] = diag[ipvt[j]];

        /*** qrsolv: the transformations to eliminate the row of d modify only 
             a single element of qT*b beyond the first n, which is initially 0. ***/
        qtbpj = 0.;
        for (let k = j; k < n; k++) {

          /** determine a Givens rotation which eliminates the
              appropriate element in the current row of d. **/
          if (sdiag[k] === 0)
            continue;
          kk = k + ldr * k;
          if (Math.abs(r[kk]) < Math.abs(sdiag[k])) {
            _cot = r[kk] / sdiag[k];
            _sin = 1 / Math.sqrt(1 + _cot * _cot);
            _cos = _sin * _cot;
          } else {
            _tan = sdiag[k] / r[kk];
            _cos = 1 / Math.sqrt(1 + _tan * _tan);
            _sin = _cos * _tan;
          }

          /** compute the modified diagonal element of r and
              the modified element of ((q^T)*b,0). **/
          r[kk] = _cos * r[kk] + _sin * sdiag[k];
          temp = _cos * wa[k] + _sin * qtbpj;
          qtbpj = -_sin * wa[k] + _cos * qtbpj;
          wa[k] = temp;

          /** accumulate the tranformation in the row of s. **/
          for (let i = k + 1; i < n; i++) {
            temp = _cos * r[k * ldr + i] + _sin * sdiag[i];
            sdiag[i] = -_sin * r[k * ldr + i] + _cos * sdiag[i];
            r[k * ldr + i] = temp;
          }
        }
      }

      /** store the diagonal element of s and restore
          the corresponding diagonal element of r. **/
      sdiag[j] = r[j * ldr + j];
      r[j * ldr + j] = x[j];
    }

    /*** qrsolv: solve the triangular system for z. if the system is
       singular, then obtain a least squares solution. ***/
      nsing = n;
      for (let j = 0; j < n; j++) {
        if (sdiag[j] === 0 && nsing === n) nsing = j;
        if (nsing < n) wa[j] = 0;
      }

      for (let j = nsing - 1; j >= 0; j--) {
        sum = 0;
        for (let i = j + 1; i < nsing; i++)
          sum += r[j * ldr + i] * wa[i];
        wa[j] = (wa[j] - sum) / sdiag[j];
      }

    /*** qrsolv: permute the components of z back to components of x. ***/
    for (let j = 0; j < n; j++)
      x[ipvt[j]] = wa[j];
  }  



  

  /*****************************************************************************
  *  lm_enorm (Euclidean norm)                                                
  *     Given an n-vector x, this function calculates the
  *     euclidean norm of x.
  *
  *     The euclidean norm is computed by accumulating the sum of
  *     squares in three different sums. The sums of squares for the
  *     small and large components are scaled so that no overflows
  *     occur. Non-destructive underflows are permitted. Underflows
  *     and overflows do not occur in the computation of the unscaled
  *     sum of squares for the intermediate components.
  *     The definitions of small, intermediate and large components
  *     depend on two constants, LM_SQRT_DWARF and LM_SQRT_GIANT. The main
  *     restrictions on these constants are that LM_SQRT_DWARF**2 not
  *     underflow and LM_SQRT_GIANT**2 not overflow.
  *
  *     Parameters
  *      n is a positive integer input variable.
  *      x is an input array of length n.
  *****************************************************************************/
  lm_enorm(n, x) {
    let agiant = this.LM_SQRT_GIANT / n, s1 = 0, s2 = 0, s3 = 0, xabs, x1max = 0, x3max = 0, temp;
    /** sum squares. **/
    for (let i = 0; i < n; i++) {
      xabs = Math.abs(x[i]);
      if (xabs > this.LM_SQRT_DWARF) {
        if ( xabs < agiant ) {
          s2 += xabs * xabs;
        } else if ( xabs > x1max ) {
          temp = x1max / xabs;
          s1 = 1 + s1 * temp * temp;
          x1max = xabs;
        } else {
          temp = xabs / x1max;
          s1 += temp * temp;
        }
      } else if ( xabs > x3max ) {
        temp = x3max / xabs;
        s3 = 1 + s3 * temp * temp;
        x3max = xabs;
      } else if (xabs !== 0) {
        temp = xabs / x3max;
        s3 += temp * temp;
      }
    }

    /** calculation of norm. **/
    let norm = null;
    if (s1 !== 0)
      norm = x1max * Math.sqrt(s1 + (s2 / x1max) / x1max);
    else if (s2 !== 0)
      if (s2 >= x3max)
        norm = Math.sqrt(s2 * (1 + (x3max / s2) * (x3max * s3)));
      else
        norm = Math.sqrt(x3max * ((s2 / x3max) + (x3max * s3)));
    else
      norm = x3max * Math.sqrt(s3);

    return norm;
  }


}