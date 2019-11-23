const RE = require("./util").RE;
const MODALS = require("./util").MODALS;

const DEFAULT_SINGULAR_RULE = RE("^.*s$", 1);

const SINGULAR_RULES = [
  RE("^(apices|cortices)$", 4, "ex"),
  RE("^(meninges|phalanges)$", 3, "x"), // x -> ges
  RE("^(octopus|pinch)es$", 2),
  RE("^(whizzes)$", 3),
  RE("^(tomatoes|kisses)$", 2),
  RE("^(toes|wheezes|oozes|uses|enterprises)$", 1),
  RE("(houses|horses|cases|dazes|hives|dives)$", 1), //End with: es -> e
  RE("(men|women)$", 2, "an"),
  RE("ves$", 3, "f"),
  RE("^(appendices|matrices)$", 3, "x"),
  RE("^(indices|apices|cortices)$", 4, "ex"),
  RE("^(gas|bus)es$", 2),
  RE("([a-z]+osis|[a-z]+itis|[a-z]+ness)$", 0),
  RE("^(stimul|alumn|termin)i$", 1, "us"),
  RE("^(media|millennia|consortia|septa|memorabilia|data)$", 1, "um"),
  RE("^(memoranda|bacteria|curricula|minima|maxima|referenda|spectra|phenomena|criteria)$", 1, "um"), // Latin stems
  RE("ora$", 3, "us"),
  RE("^[lm]ice$", 3, "ouse"),
  RE("[bcdfghjklmnpqrstvwxyz]ies$", 3, "y"),
  RE("(ces)$", 1), // accomplices
  RE("^feet$", 3, "oot"),
  RE("^teeth$", 4, "ooth"),
  RE("children$", 3),
  RE("^concerti$", 1, "o"),
  RE("people$", 4, "rson"),
  //RE("^(minuti)a$", 0, 'e'),
  RE("^(minuti)ae$", 1),
  RE("^oxen", 2),
  RE("(treatises|chemises)$", 1),
  RE("(ses)$", 2, "is"), // catharses, prognoses
  //  RE("([a-z]+osis|[a-z]+itis|[a-z]+ness)$", 0),
  DEFAULT_SINGULAR_RULE
];

const DEFAULT_PLURAL_RULE = RE("^((\\w+)(-\\w+)*)(\\s((\\w+)(-\\w+)*))*$", 0, "s");
const PLURAL_RULES = [
  RE("(human|german|roman)$", 0, "s"),
  RE("^(monarch|loch|stomach)$", 0, "s"),
  RE("^(piano|photo|solo|ego|tobacco|cargo|taxi)$", 0, "s"),
  RE("(chief|proof|ref|relief|roof|belief|spoof|golf|grief)$", 0, "s"),
  RE("^(appendix|index|matrix|apex|cortex)$", 2, "ices"),
  RE("^concerto$", 1, "i"),
  RE("prognosis", 2, "es"),
  RE("[bcdfghjklmnpqrstvwxyz]o$", 0, "es"),
  RE("[bcdfghjklmnpqrstvwxyz]y$", 1, "ies"),
  RE("^ox$", 0, "en"),
  RE("^(stimul|alumn|termin)us$", 2, "i"),
  RE("^corpus$", 2, "ora"),
  RE("(xis|sis)$", 2, "es"),
  //RE("(ness)$", 0, "es"),
  RE("whiz$", 0, "zes"),
  RE("motif$", 0, "s"),
  RE("[lraeiou]fe$", 2, "ves"),
  RE("[lraeiou]f$", 1, "ves"),
  RE("(eu|eau)$", 0, "x"),
  RE("(man|woman)$", 2, "en"),
  RE("person$", 4, "ople"),
  RE("^meninx|phalanx$", 1, "ges"),
  RE("schema$", 0, "ta"),
  RE("^(bus|gas)$", 0, "es"),
  RE("child$", 0, "ren"),
  //RE("^(vertebr|larv|minuti)ae$", 1),
  RE("^(minuti)a$", 0, 'e'),
  RE("^(maharaj|raj|myn|mull)a$", 0, "hs"),
  RE("^aide-de-camp$", 8, "s-de-camp"),
  RE("^weltanschauung$", 0, "en"),
  RE("^lied$", 0, "er"),
  RE("^tooth$", 4, "eeth"),
  RE("^[lm]ouse$", 4, "ice"),
  RE("^foot$", 3, "eet"),
  RE("femur", 2, "ora"),
  RE("goose", 4, "eese"),
  RE("^(co|no)$", 0, "'s"),
  RE("^blond$", 0, "es"),
  RE("^datum", 2, "a"),
  RE("([a-z]+osis|[a-z]+itis|[a-z]+ness)$", 0),
  RE("([zsx]|ch|sh)$", 0, "es"), // words ending in 's' hit here
  RE("^(medi|millenni|consorti|sept|memorabili)um$", 2, "a"),
  RE("^(memorandum|bacterium|curriculum|minimum|maximum|referendum|spectrum|phenomenon|criterion)$", 2, "a"), // Latin stems
  DEFAULT_PLURAL_RULE
];


let RiTa;

class Pluralizer {

  constructor(parent) {
    RiTa = parent;
  }

  adjustNumber(word, type, dbug) {

    if (!word || !word.length) return '';

    let check = word.toLowerCase();

    if (MODALS.includes(check)) {
      dbug && console.log(word + ' hit MODALS');
      return word;
    }

    let rules = type === 'singularize' ? SINGULAR_RULES : PLURAL_RULES;
    for (let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      if (rule.applies(check)) {
        dbug && console.log(word + ' hit', rule);
        return rules[i].fire(word);
      }
    }

    return word;//throw Error(type+': no rules hit for "'+word+'"');
  }

  singularize(word, opts) {
    return this.adjustNumber(word, 'singularize', (opts && opts.debug));
  }

  pluralize(word, opts) {
    return this.adjustNumber(word, 'pluralize', (opts && opts.debug));
  }

  isPlural(word, opts) {

    if (!word || !word.length) return false;

    word = word.toLowerCase();
    let dbug = opts && opts.debug;

    if (MODALS.includes(word)) return true;

    /*if (RiTa.stem(word) === word) {
      console.log(word + ' failed stem test: ' + RiTa.stem(word) + ' === ' + word);
      return false;
    }*/

    let lex = RiTa._lexicon();
    let sing = RiTa.singularize(word);
    let data = lex.dict[sing];

    // Is singularized form is in lexicon as 'nn'?
    if (data && data.length === 2) {
      let pos = data[1].split(' ');
      for (let i = 0; i < pos.length; i++) {
        if (pos[i] === 'nn') return true;
      }
    }

    // A general modal form? (for example, ends in 'ness')
    if (word.endsWith("ness") && sing === RiTa.pluralize(word)) {
      return true;
    }

    // Is word without final 's in lexicon as 'nn'?
    if (word.endsWith("s")) {
      let data = lex.dict[word.substring(0, word.length - 1)];
      if (data && data.length === 2) {
        let pos = data[1].split(' ');
        for (let i = 0; i < pos.length; i++) {
          if (pos[i] === 'nn') return true;
        }
      }
    }

    if (/(ae|ia|s)$/.test(word)) return true;

    dbug && console.log('isPlural: no rules hit for ' + word);

    return false;
  }
}

module && (module.exports = Pluralizer);
