/*
 * ============================================================
 *  VECKANS GLOSOR – här lägger du till nya veckor
 * ============================================================
 *
 *  Lägg till en ny vecka ÖVERST i listan (kopiera ett block och ändra).
 *  Enklast: öppna add.html på sajten, klistra in glosorna och kopiera koden
 *  den skapar hit.
 *
 *  - id:     unikt namn, t.ex. "2026-v49"
 *  - title:  rubriken som visas
 *  - due:    datum för förhöret (ÅÅÅÅ-MM-DD)
 *  - note:   valfri text från läraren
 *  - words:  sv = svenska, en = engelska,
 *            sentences = exempelmeningar. Sätt [hakparenteser] runt
 *            ordet i meningen, så används det i lucktext-övningen.
 *            Meningar är valfria – utan dem hoppar sajten över
 *            mening-övningarna för det ordet.
 */
const WEEKS = [
  {
    id: "2026-v48",
    title: "Vecka 48 – Let's bake!",
    due: "2026-11-23",
    note: "Veckans glosor – tänk på att ni ska kunna skriva meningar med orden.",
    words: [
      { sv: "läcker", en: "delicious", sentences: [
        "This chocolate cake is [delicious].",
        "Mum makes [delicious] pancakes on Sundays.",
      ]},
      { sv: "bjud", en: "treat", sentences: [
        "Cookies are my favourite [treat].",
        "We bake a sweet [treat] for the party.",
      ]},
      { sv: "socker", en: "sugar", sentences: [
        "Add two cups of [sugar] to the bowl.",
        "Too much [sugar] is bad for your teeth.",
      ]},
      { sv: "mjöl", en: "flour", sentences: [
        "Mix the [flour] with the eggs.",
        "There is [flour] all over the kitchen table!",
      ]},
      { sv: "tesked", en: "teaspoon", sentences: [
        "Add one [teaspoon] of salt.",
        "I stir my tea with a [teaspoon].",
      ]},
      { sv: "kanel", en: "cinnamon", sentences: [
        "[Cinnamon] buns are very popular in Sweden.",
        "Sprinkle some [cinnamon] on the apples.",
      ]},
      { sv: "värm", en: "heat", sentences: [
        "[Heat] the milk in a small pan.",
        "Please [heat] the butter until it melts.",
      ]},
      { sv: "ugn", en: "oven", sentences: [
        "Put the cake in the [oven].",
        "The [oven] is very hot, so be careful!",
      ]},
      { sv: "grader", en: "degrees", sentences: [
        "Bake the cookies at 200 [degrees].",
        "It is 25 [degrees] outside today.",
      ]},
      { sv: "vispa", en: "whisk", sentences: [
        "[Whisk] the eggs and the sugar together.",
        "I [whisk] the cream until it is thick.",
      ]},
      { sv: "smet", en: "batter", sentences: [
        "Mix the [batter] until it is smooth.",
        "The pancake [batter] needs more milk.",
      ]},
      { sv: "skala", en: "peel", sentences: [
        "[Peel] the apples before you cut them.",
        "Can you help me [peel] the potatoes?",
      ]},
      { sv: "häll", en: "pour", sentences: [
        "[Pour] the milk into a big bowl.",
        "Please [pour] me a glass of juice.",
      ]},
      { sv: "bakform", en: "baking tin", sentences: [
        "Put some butter in the [baking tin] first.",
        "The cake is stuck in the [baking tin]!",
      ]},
    ],
  },
];
