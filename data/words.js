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
    id: "2026-v49",
    title: "Vecka 49 – Food & school lunch",
    due: "2026-11-30",
    note: "Förhör mån 30/11 – tänk på att du ska kunna skriva in orden i meningar.",
    words: [
      { sv: "förmodligen", en: "probably", sentences: [
        "It will [probably] rain tomorrow.",
        "We will [probably] have pizza for dinner.",
      ]},
      { sv: "måltid", en: "meal", sentences: [
        "Breakfast is my favourite [meal].",
        "We eat a warm [meal] at school every day.",
      ]},
      { sv: "nyttig", en: "healthy", sentences: [
        "Fruit is [healthy] food.",
        "It is [healthy] to drink a lot of water.",
      ]},
      { sv: "ris", en: "rice", sentences: [
        "We eat [rice] with chicken.",
        "[Rice] is popular in many countries.",
      ]},
      { sv: "tunnbröd", en: "flatbread", sentences: [
        "I like [flatbread] with butter and cheese.",
        "Dad makes a hot dog roll with [flatbread].",
      ]},
      { sv: "vete", en: "wheat", sentences: [
        "Bread is made from [wheat].",
        "The farmer grows [wheat] on the big field.",
      ]},
      { sv: "majs", en: "corn", sentences: [
        "We eat [corn] with butter.",
        "[Corn] is yellow and sweet.",
      ]},
      { sv: "onyttig", en: "unhealthy", sentences: [
        "Too much candy is [unhealthy].",
        "Chips are [unhealthy] but very tasty.",
      ]},
      { sv: "ändra", en: "change", sentences: [
        "The school wants to [change] the lunch menu.",
        "Can we [change] places, please?",
      ]},
      { sv: "för dyrt", en: "too expensive", sentences: [
        "This jacket is [too expensive] for me.",
        "We can't buy the game, it is [too expensive].",
      ]},
      { sv: "mattor", en: "mats", sentences: [
        "Wipe your shoes on the [mats].",
        "We put [mats] on the floor in the gym.",
      ]},
      { sv: "golv", en: "floor", sentences: [
        "Don't drop food on the [floor].",
        "The [floor] in the hall is wet.",
      ]},
      { sv: "skolmatsal", en: "school cafeteria", sentences: [
        "We eat lunch in the [school cafeteria].",
        "The [school cafeteria] is very noisy today.",
      ]},
      { sv: "grönsaker", en: "vegetables", sentences: [
        "Eat your [vegetables], please!",
        "Carrots and peas are [vegetables].",
      ]},
      { sv: "köpa", en: "buy", sentences: [
        "I want to [buy] new shoes.",
        "Mum goes to the shop to [buy] milk.",
      ]},
    ],
  },
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
