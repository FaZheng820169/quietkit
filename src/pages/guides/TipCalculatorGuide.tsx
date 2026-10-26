import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Should I tip on the pre-tax or post-tax amount?',
    a: 'Pre-tax. A tip is a thank-you for the service, not a percentage of the tax the government charges. Most American receipts print the subtotal before tax for exactly this reason — tip on that number. If you only have the grand total, it is fine to tip on it; the difference is usually small, and over-tipping by a dollar or two is the kind of mistake that never hurts anyone.',
  },
  {
    q: 'What is a normal tip percentage?',
    a: 'In the United States, 15% is the old baseline for adequate service, 18–20% is the common range for good service, and 25% or more is for excellent service or for staff who depend on tips as their main income. Outside the US, tipping customs vary widely — in many countries it is a small round-up or not expected at all — so check the local norm before you travel.',
  },
  {
    q: 'How does splitting the bill work?',
    a: 'Enter the bill, pick a tip rate and type the number of people. The calculator divides both the tip and the total by the headcount and rounds to the cent. If the per-person total does not divide evenly (it rarely does), the last person pays the extra cent or two so the group total is exact — nobody is short-changed and nobody collects a mysterious surplus.',
  },
  {
    q: 'What does the rounding option do?',
    a: '"No rounding" shows the mathematically exact per-person amount to the cent. "Round up per person" makes each person pay the next whole dollar, so the group always covers the total and the loose change is a small bonus. "Nearest dollar" rounds each share to the nearest dollar for a quick cash split — handy when you do not want to fish for change.',
  },
  {
    q: 'Does the calculator store what I enter?',
    a: 'No. The bill amount, the tip rate and the number of people live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

export function TipCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/tip-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Calculate tips and split the bill without a server"
      lede="A tip is a percentage of the service, not of the tax. Here is what the rate really means, why pre-tax tipping is the honest default, how rounding splits a bill cleanly, and why the right tool for a receipt is one that never leaves your device."
      updated="26 October 2026"
      toolTo="/tools/tip-calculator"
      toolLabel="Open the tip calculator"
    >
      <h2>Tip on the subtotal, not the tax</h2>
      <p>
        The single most common tip mistake is multiplying the grand total by the percentage.
        The grand total includes sales tax, and tax is not service — it is money that goes to
        the government, not to the person who brought your food. Tipping on the post-tax amount
        over-tips by the tax rate, which in a high-tax city can be an extra 8–10% on top of
        what you meant to give.
      </p>
      <p>
        Most American receipts print a subtotal line above the tax for exactly this reason.
        That is the number to tip on. If the receipt only shows a grand total, tipping on it is
        still fine — the over-tip is small, and a dollar or two extra is the kind of error that
        never hurts the person receiving it. The point is not to be precise to the cent; it is
        to know which number the percentage is really of.
      </p>

      <h2>What the percentage actually means</h2>
      <p>
        A tip rate is a fraction of the bill. Eighteen percent means 0.18 times the subtotal.
        On a $50 meal that is $9, on a $100 meal it is $18. The math is the easy part; the
        judgment is what rate to pick. Fifteen percent was the baseline a generation ago;
        eighteen to twenty is the common range now for good sit-down service in the United
        States. Below fifteen usually signals poor service; above twenty-five usually signals
        exceptional service or a situation where the staff depend on tips as their main income.
      </p>
      <p>
        The norms change sharply once you leave the US. In much of Western Europe a small
        round-up is expected and a large tip can confuse the staff. In Japan tipping can be
        considered rude. In many other countries a service charge is already added to the bill
        and an extra tip is unnecessary. Look up the local custom before you travel; getting
        the rate wrong is a small faux pas, but getting it wrong by a lot can be embarrassing
        on either side.
      </p>

      <h2>Splitting the bill without the stray cent</h2>
      <p>
        Dividing a bill among three or more people almost never comes out to whole cents. A
        $115 total split three ways is $38.333… each, and real money does not have thirds of a
        cent. The usual approaches are all slightly wrong in different ways: round each person
        down and the group comes up short; round each up and someone pockets a few cents; have
        one person pay the exact total and collect rounded shares and that person absorbs or
        keeps the difference without anyone noticing.
      </p>
      <p>
        The honest way is to round each share to the nearest cent and make the last person
        absorb the rounding difference so the group total is exactly the bill plus tip. "Round
        up per person" is a stricter mode: each person pays the next whole dollar, which
        guarantees the total is covered and usually leaves a small over-payment as a bonus.
        "Nearest dollar" rounds each share to the nearest dollar for a cash split where nobody
        wants to fish for change. The calculator does the arithmetic and shows the adjustment
        explicitly, so the loose change is visible rather than silently vanishing into
        someone's pocket.
      </p>

      <h2>Why a receipt should not go through a server</h2>
      <p>
        A restaurant receipt is a small document but it carries real information: where you
        ate, when, roughly how much you spent, and sometimes the last four digits of the card
        you paid with. That is exactly the kind of data that is harmless on its own and useful
        in aggregate — the basis of purchase-history profiles, location tracking and ad
        targeting. An online tip calculator that sends the bill to a server gets to log every
        one of those data points, and most of them do.
      </p>
      <p>
        The local alternative needs none of it. Tip arithmetic is a few multiplications and a
        division — nothing to look up, nothing to verify against a database, nothing that
        benefits from running on someone else's machine. A server-side calculator would add a
        network round-trip and a log of every receipt to a calculation that finishes before
        your finger lifts off the key. The calculator on this site runs entirely in the tab:
        load it once, switch off the Wi-Fi, and it still splits the bill correctly without
        noticing anything changed.
      </p>

      <h2>The quick mental version</h2>
      <p>
        If you do not have a calculator handy, the ten-percent trick gets you close fast. Move
        the decimal point one place left on the subtotal — $47.50 becomes $4.75 — and that is
        ten percent. Double it for twenty, add half for fifteen, take three-quarters for
        eighteen (four dollars plus a quarter of four is five, roughly). It is not exact, but
        it is within a dollar of the right number, which is close enough for a tip. The point
        of doing it in your head is not precision; it is not having to reach for your phone at
        the table.
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
