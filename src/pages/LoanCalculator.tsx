import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import { computeLoan, formatCurrency } from '../lib/loan'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'How is the monthly payment calculated?',
    a: 'The monthly payment for an amortizing loan uses the formula M = P × r(1+r)ⁿ / ((1+r)ⁿ − 1), where P is the principal, r is the monthly interest rate (annual rate divided by 12 and by 100), and n is the total number of monthly payments (years × 12). For a $250,000 loan at 6% over 30 years this gives a monthly payment of $1,498.88. If the interest rate is zero the formula simplifies to the principal divided by the number of months.',
  },
  {
    q: 'What is the difference between total payment and total interest?',
    a: 'Total payment is the monthly payment multiplied by the number of months — everything you pay over the life of the loan. Total interest is total payment minus the principal, so it is the cost of borrowing. For that same $250,000 loan at 6% over 30 years, total payment is $539,596.80 and total interest is $289,596.80, meaning you pay back more than double what you borrowed.',
  },
  {
    q: 'What is an amortization schedule?',
    a: 'An amortization schedule breaks each monthly payment into the part that goes toward interest and the part that goes toward reducing the principal (the balance you still owe). At the start of a loan most of your payment is interest and only a small amount reduces the balance; over time the interest portion shrinks and the principal portion grows. The calculator shows the first 12 months of the schedule so you can see this happening.',
  },
  {
    q: 'Does this calculator handle extra payments or different payment frequencies?',
    a: 'No. It calculates the standard monthly payment for a fixed-rate, fixed-term amortizing loan with no extra payments. Bi-weekly payments, lump-sum extra payments and adjustable rates all change the math and are not included. The result is a baseline that lets you compare loan offers; your actual lender will provide the exact schedule for your specific terms.',
  },
  {
    q: 'Does the calculator store my loan details?',
    a: 'No. The principal, interest rate and term you enter live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

export function LoanCalculator() {
  useSeo({
    ...routeMeta('/tools/loan-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Loan Calculator',
          'Calculate the monthly payment, total payment and total interest for a loan or mortgage from the principal, annual interest rate and term. See the first months of the amortization schedule. Runs locally — nothing is uploaded.',
          '/tools/loan-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [principal, setPrincipal] = useState('250000')
  const [rate, setRate] = useState('6')
  const [years, setYears] = useState('30')

  const result = useMemo(
    () => computeLoan(Number(principal), Number(rate), Number(years), 12),
    [principal, rate, years],
  )

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Finance</span>
          <h1>Loan payments, before you sign.</h1>
          <p>
            Calculate the monthly payment, total cost and total interest for a loan or mortgage
            from the principal, rate and term. See how each payment splits between interest
            and principal. No account, no upload — your details stay in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Loan amount</span>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Interest rate (APR %)</span>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    step="0.01"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <span className="field-label">Term (years)</span>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {result && (
                <div style={{ marginTop: 22 }}>
                  <div
                    data-testid="loan-output"
                    style={{
                      padding: '20px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                    }}
                  >
                    <div className="muted" style={{ fontSize: 13 }}>Monthly payment</div>
                    <div className="mono" style={{ fontSize: 40, fontWeight: 600, marginTop: 4 }}>
                      {formatCurrency(result.monthlyPayment)}
                    </div>
                  </div>

                  <div
                    className="stat-grid"
                    style={{
                      marginTop: 16,
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    }}
                  >
                    <div className="stat">
                      <span className="stat-label">Total payment</span>
                      <span className="stat-value mono" data-testid="total-payment">
                        {formatCurrency(result.totalPayment)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total interest</span>
                      <span className="stat-value mono" data-testid="total-interest">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <span className="panel-title" style={{ fontSize: 14 }}>
                      Amortization schedule (first 12 months)
                    </span>
                    <div style={{ overflowX: 'auto', marginTop: 10 }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: 14,
                        }}
                      >
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--line)' }}>
                            <th style={thStyle}>Month</th>
                            <th style={thStyle}>Payment</th>
                            <th style={thStyle}>Principal</th>
                            <th style={thStyle}>Interest</th>
                            <th style={thStyle}>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.schedule.map((row) => (
                            <tr key={row.month} style={{ borderBottom: '1px solid var(--line)' }}>
                              <td style={tdStyle}>{row.month}</td>
                              <td style={tdStyle}>{formatCurrency(row.payment)}</td>
                              <td style={tdStyle}>{formatCurrency(row.principal)}</td>
                              <td style={tdStyle}>{formatCurrency(row.interest)}</td>
                              <td style={tdStyle}>{formatCurrency(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {!result && (
                <div
                  style={{
                    marginTop: 22,
                    padding: '20px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    color: 'var(--muted)',
                  }}
                >
                  Enter a positive loan amount, interest rate and term above zero to see the
                  payment.
                </div>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <AdSlot />
            </div>
          </div>

          <aside className="stack-md">
            <div className="panel">
              <span className="panel-title">What you get</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                {[
                  'Monthly payment for any principal, rate and term',
                  'Total payment and total interest over the life of the loan',
                  'First 12 months of the amortization schedule',
                  'Interest-only and principal split per payment',
                  'Works offline — nothing leaves your device',
                ].map((item) => (
                  <li key={item} className="row" style={{ gap: 8 }}>
                    <CheckIcon size={15} /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <span className="panel-title">Private by design</span>
              <p style={{ fontSize: 14, margin: 0 }}>
                <LockIcon size={14} /> Your loan amount, rate and term never leave this tab.
                There is no server to log them, no request to inspect — the Network panel stays
                empty. <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/loan-calculator-without-upload">
                    Guide: loan payments without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
                </li>
                <li>
                  <Link to="/tools/date-calculator">Date calculator</Link>
                </li>
                <li>
                  <Link to="/tools/bmi-calculator">BMI calculator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>The monthly payment formula</h2>
          <p>
            The monthly payment for an amortizing loan is calculated with the formula
            M = P × r(1+r)ⁿ / ((1+r)ⁿ − 1), where P is the principal (the amount you borrow),
            r is the monthly interest rate (the annual rate divided by 12 and by 100 to turn
            it into a decimal), and n is the total number of monthly payments (the term in
            years multiplied by 12). The numerator grows the principal by the compounded
            interest; the denominator normalises it so the result is the equal monthly payment
            that pays off the loan exactly on schedule.
          </p>

          <h2>Why early payments are mostly interest</h2>
          <p>
            At the start of a loan the balance is high, so the interest charged each month is a
            large fraction of the payment. Only what is left after paying interest goes toward
            reducing the principal. As the balance shrinks, the interest portion shrinks with
            it, and more of each payment reduces what you owe. The amortization schedule shows
            this shift clearly: in month one of a $250,000 loan at 6%, the payment of $1,498.88
            breaks into $1,250 of interest and $248.88 of principal; by the final month the
            split is almost entirely principal.
          </p>

          <h2>Total interest is the real cost</h2>
          <p>
            The number people focus on is usually the monthly payment, because that is what
            they pay every month, but the total interest is the price of borrowing. For a
            $250,000 mortgage at 6% over 30 years the total interest is $289,596.80 — more than
            the amount originally borrowed. Shortening the term from 30 to 15 years raises the
            monthly payment but cuts the total interest dramatically, which is why the choice
            of term matters as much as the rate.
          </p>

          <h2>Why your loan details should stay local</h2>
          <p>
            Loan amount, rate and term are not secrets on their own, but combined with a time
            and location they can reveal a lot — whether you are house-hunting, refinancing, or
            taking on debt. Server-side loan calculators log every set of numbers that passes
            through them, and that data is valuable to lenders, advertisers and insurers. The
            local alternative needs none of that: the amortization formula is a few
            multiplications, and the whole calculation finishes inside the tab without a
            single network request.
          </p>

          <h2>FAQ</h2>
          <div className="faq">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <div className="faq-body">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: 13,
  color: 'var(--muted)',
  fontWeight: 500,
}

const tdStyle: React.CSSProperties = {
  padding: '7px 10px',
  whiteSpace: 'nowrap',
}
