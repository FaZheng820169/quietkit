import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What is the difference between BMR and TDEE?',
    a: 'BMR (Basal Metabolic Rate) is the number of calories your body burns at complete rest, just to keep vital functions going — breathing, circulation, brain activity, organ maintenance. TDEE (Total Daily Energy Expenditure) is BMR multiplied by an activity factor that accounts for everything else you do during the day, from walking to the kitchen to a full gym session. TDEE is the number you actually use as your maintenance calorie target, because it reflects your real daily burn, not a resting one.',
  },
  {
    q: 'Which BMR equation does this calculator use?',
    a: 'The Mifflin-St Jeor equation. It is the most accurate of the widely used equations and is recommended by the Academy of Nutrition and Dietetics. For men it is 10 × weight in kg + 6.25 × height in cm − 5 × age + 5. For women it is the same but with − 161 instead of + 5. The result is BMR, which is then multiplied by your activity factor to give TDEE.',
  },
  {
    q: 'How accurate is the calorie estimate?',
    a: 'It is a good starting point, not a precise measurement. Mifflin-St Jeor estimates BMR within about 5–10% for most people, and the activity factor is a rough classification — "moderately active" can mean very different things to different people. Your real daily burn depends on muscle mass, genetics, hormone levels, sleep, stress and the thermic effect of food, none of which the equation captures. Use the number as a baseline and adjust based on how your weight actually changes over a few weeks.',
  },
  {
    q: 'Are the weight-goal calories safe?',
    a: 'The targets assume a deficit or surplus of 500 kcal per day for 0.5 kg per week, or 1000 kcal per day for 1 kg per week. A deficit of 1000 kcal can be aggressive and is not suitable for everyone — if it drops your intake below about 1200 kcal (women) or 1500 kcal (men), the result may show a very low number and you should eat more and lose weight more slowly instead. The calculator shows the targets; whether they are right for you depends on your starting weight, body composition and health.',
  },
  {
    q: 'Does the calculator store the details I enter?',
    a: 'No. Your age, gender, height, weight and activity level live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

export function CalorieCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/calorie-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Health"
      title="Calculate calories without a server"
      lede="How the Mifflin-St Jeor equation estimates BMR, what an activity factor does to your TDEE, which calorie targets match common weight goals, and why your details should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/calorie-calculator"
      toolLabel="Open the calorie calculator"
    >
      <h2>BMR is what you burn lying still</h2>
      <p>
        Your Basal Metabolic Rate is the number of calories your body burns at complete rest,
        just to keep vital functions going — breathing, circulating blood, keeping the brain
        active, maintaining organs and body temperature. It is the floor of your daily energy
        use, and for most adults it accounts for 60–75% of the calories they burn in a day.
        Even people who exercise hard burn more calories through basic metabolism than through
        the workout itself, which is why BMR is the foundation of any calorie estimate.
      </p>
      <p>
        The calculator estimates BMR with the Mifflin-St Jeor equation, which is the most
        accurate of the widely used formulas and is recommended by the Academy of Nutrition and
        Dietetics. For men it is 10 times weight in kilograms plus 6.25 times height in
        centimetres minus 5 times age plus 5. For women it is the same but with minus 161
        instead of plus 5. The difference — 166 calories — reflects the slightly lower average
        muscle mass and body size of women, though the equation is an average and individual
        variation is real.
      </p>

      <h2>TDEE adds your activity on top</h2>
      <p>
        TDEE (Total Daily Energy Expenditure) is your BMR multiplied by an activity factor that
        accounts for everything you do beyond lying still. A sedentary person — desk job,
        little structured exercise — uses a factor of 1.2, while someone with a physical job
        or twice-daily training can use 1.9. The five levels in the calculator cover the common
        range, and picking the right one matters: a person with a 1650 kcal BMR gets a TDEE of
        1980 at sedentary and 3135 at extra active, a difference of more than 1100 calories a
        day.
      </p>
      <p>
        Most people underestimate their activity level, partly because a single gym session
        does not move the needle as much as people think. If you sit at a desk all day and
        exercise three times a week, you are probably "lightly active" rather than "moderately
        active", and the difference is about 300 calories. When in doubt, pick the lower level,
        track your weight for a couple of weeks, and adjust from there.
      </p>

      <h2>Weight goals are just a deficit or surplus</h2>
      <p>
        A kilogram of body fat is roughly 7700 kcal, so a daily deficit of 500 kcal should lose
        about 0.5 kg per week and a deficit of 1000 kcal about 1 kg per week. The calculator
        shows targets for maintaining, losing 0.5 or 1 kg per week, and gaining the same
        amounts, by adding or subtracting 500 or 1000 kcal from your TDEE. These are estimates
        — real weight change is not perfectly linear because metabolism adapts, activity
        changes and water weight fluctuates — but they are a reasonable starting point.
      </p>
      <p>
        The more aggressive the goal, the harder it is to sustain. A 1000 kcal daily deficit is
        difficult for most people and can drop intake below healthy minimums — roughly 1200
        kcal for women and 1500 kcal for men. If one of the loss targets shows a number below
        that, the better choice is usually the slower rate, or a rate between the two, rather
        than pushing intake dangerously low. The calculator shows the math; sustainability is
        the real constraint.
      </p>

      <h2>What the equation gets right and wrong</h2>
      <p>
        Mifflin-St Jeor estimates BMR within about 5–10% for most people, which is good for a
        formula that uses only age, sex, height and weight. But it cannot see how much muscle
        you carry, how well you sleep, how stressed you are or how efficiently your body
        processes food. A 30-year-old man who weighs 80 kg and is 15% body fat has a different
        real BMR from a 30-year-old man who weighs 80 kg and is 30% body fat, even though the
        equation gives them the same number.
      </p>
      <p>
        The honest way to use the result is as a baseline. Eat at the calculated maintenance
        for two weeks, weigh yourself under consistent conditions, and if you are losing weight
        you were underestimating your TDEE; if you are gaining, you were overestimating. Adjust
        by 100–200 kcal and repeat. The calculator gives you a starting point; your own body
        gives you the truth.
      </p>

      <h2>Why your details should stay local</h2>
      <p>
        Age, gender, height and weight are not secrets on their own, but together they are
        quite identifying. A server-side calorie calculator logs every set of details that
        passes through it, and that log can be matched to an IP address, a time of day and
        other data later. Health data is also some of the most sensitive data there is —
        insurers, employers and others would pay a lot for it, and once it has left your device
        you have no control over where it goes.
      </p>
      <p>
        The local alternative needs none of that. The Mifflin-St Jeor equation is a few
        multiplications and additions, and the whole calculation finishes inside the tab
        without a single network request. Load the calculator once, switch off the Wi-Fi, and
        it still tells you your TDEE correctly — because the answer was always going to come
        from your own machine. Nothing is sent, nothing is stored, and the Network panel stays
        empty the whole time.
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
