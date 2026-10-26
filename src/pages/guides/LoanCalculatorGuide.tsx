import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function LoanCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/loan-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Finance"
      title="Calculate loan payments without a server"
      lede="How the amortization formula turns a principal, rate and term into a monthly payment, where the interest goes each month, and why your loan details should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/loan-calculator"
      toolLabel="Open the loan calculator"
    >
      <h2>The monthly payment formula</h2>
      <p>
        The monthly payment for an amortizing loan is calculated with the formula
        M = P × r(1+r)ⁿ / ((1+r)ⁿ − 1), where P is the principal — the amount you borrow —
        r is the monthly interest rate (the annual rate divided by 12 and by 100 to turn it
        into a decimal), and n is the total number of monthly payments (the term in years
        multiplied by 12). The numerator grows the principal by the compounded interest over
        the full term; the denominator normalises it so the result is the equal monthly
        payment that pays off the loan exactly on schedule.
      </p>
      <p>
        For a concrete example, a $250,000 loan at 6% annual interest over 30 years gives
        r = 0.005 and n = 360. Working through the formula, (1.005)³⁶⁰ is about 6.02, and
        the monthly payment comes out to $1,498.88. If the interest rate is zero, the formula
        collapses to the principal divided by the number of months — $250,000 over 360 months
        is $694.44 — because there is no interest to compound.
      </p>

      <h2>Why early payments are mostly interest</h2>
      <p>
        At the start of a loan the balance is high, so the interest charged each month is a
        large fraction of the payment. Only what is left after paying interest goes toward
        reducing the principal. As the balance shrinks, the interest portion shrinks with it,
        and more of each payment reduces what you owe. This is why the early years of a
        mortgage feel like you are getting nowhere — you are, mostly: in month one of that
        $250,000 loan, $1,250 of the $1,498.88 payment is interest and only $248.88 reduces
        the balance.
      </p>
      <p>
        The amortization schedule makes this visible. Each row shows the payment, the interest
        portion, the principal portion and the remaining balance. As you scroll down the
        schedule the interest number gets smaller and the principal number gets larger, until
        in the final month almost the entire payment goes to principal and the balance reaches
        zero. The calculator shows the first 12 months; the same pattern continues for the
        rest of the term.
      </p>

      <h2>Total interest is the real cost of borrowing</h2>
      <p>
        The number people focus on is usually the monthly payment, because that is what they
        pay every month and it determines whether the loan is affordable. But the total
        interest is the actual price of borrowing. For a $250,000 mortgage at 6% over 30
        years, the total payment is $539,596.80 and the total interest is $289,596.80 — you
        pay back more than double what you borrowed. A higher rate or a longer term both push
        that number up; a lower rate or a shorter term bring it down.
      </p>
      <p>
        This is why the term matters as much as the rate. The same $250,000 at 6% over 15
        years has a higher monthly payment — about $2,109 — but the total interest drops to
        roughly $129,700, less than half the 30-year total. You pay more each month but you
        finish sooner and pay far less interest overall. Comparing only the monthly payment
        hides this trade-off, which is why looking at total interest alongside the monthly
        payment gives a much clearer picture.
      </p>

      <h2>What this calculator does not do</h2>
      <p>
        The calculator handles the standard case: a fixed-rate, fixed-term amortizing loan with
        level monthly payments and no extra payments. It does not handle bi-weekly payments
        (which make 26 half-payments a year instead of 12 full ones, shortening the term),
        lump-sum extra payments (which reduce the principal ahead of schedule and save
        interest), or adjustable-rate mortgages (where the rate and payment can change). It
        also does not include taxes, insurance, closing costs or fees.
      </p>
      <p>
        That is intentional. The point is a fast, comparable baseline: enter the principal,
        rate and term of two different loan offers and see immediately which one costs more
        each month and over the life of the loan. For the exact numbers on your specific loan,
        including any fees or special features, your lender will provide a full amortization
        schedule and a truth-in-lending disclosure.
      </p>

      <h2>Why your loan details should stay local</h2>
      <p>
        Loan amount, rate and term are not secrets on their own, but combined with a time and
        a location they can reveal a lot — whether you are house-hunting, refinancing,
        consolidating debt or taking on a new loan. Server-side loan calculators log every set
        of numbers that passes through them, and that data is valuable to lenders, advertisers
        and insurers who would pay a lot to know who is shopping for credit and how much they
        want to borrow.
      </p>
      <p>
        The local alternative needs none of that. The amortization formula is a few
        multiplications and divisions, and the whole calculation finishes inside the tab
        without a single network request. Load the calculator once, switch off the Wi-Fi, and
        it still gives you the correct monthly payment — because the answer was always going
        to come from your own machine. Nothing is sent, nothing is stored, and the Network
        panel stays empty the whole time.
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
    </Article>
  )
}
