const Util = require("./util");
const Markov = require('./markov');
const RandGen = require('./random');
const Grammar = require('./grammar');
const Stemmer = require('./stemmer');
const Lexicon = require('./lexicon');
const RiScript = require('./riscript');
const Tokenizer = require('./tokenizer');
const PosTagger = require('./tagger');
const Analyzer = require('./analyzer');
const Concorder = require('./concorder');
const Conjugator = require('./conjugator');
const Pluralizer = require('./pluralizer');
const LetterToSound = require('./rita_lts');

const ONLY_PUNCT = /^[^0-9A-Za-z\s]*$/;

class RiTa {

  constructor() {
    throw Error('Invalid instantiation');
  }

  static analyze(text) {
    return RiTa._analyzer().analyze(text);
  }

  static alliterations() {
    return RiTa._lexicon().alliterations(...arguments);
  }

  static compile() {
    return RiScript.compile(...arguments);
  }

  static concordance() {
    return RiTa.concorder.concordance(...arguments);
  }

  static conjugate() {
    return RiTa.conjugator.conjugate(...arguments);
  }

  static createGrammar() {
    return new RiTa.Grammar(...arguments);
  }

  static createMarkov() {
    return new RiTa.Markov(...arguments);
  }

  static env() {
    return Util.isNode() ? RiTa.NODE : RiTa.JS;
  }

  static evaluate() { // runScript ? evalScript?
    return RiScript.evaluate(...arguments);
  }

  static hasWord(word) {
    return RiTa._lexicon().hasWord(word, true);
  }

  static isAbbreviation(input, { caseSensitive = false } = {}) {

    return RiTa.ABBREVIATIONS.includes
      (caseSensitive ? input : Util.titleCase(input));
  }

  static isAdjective(word) {
    return RiTa.tagger.isAdjective(word);
  }

  static isAdverb(word) {
    return RiTa.tagger.isAdverb(word);
  }

  static isAlliteration(word1, word2) {
    return RiTa._lexicon().isAlliteration(word1, word2);
  }

  static isNoun(word) {
    return RiTa.tagger.isNoun(word);
  }

  static isPunctuation(text) {
    return text && text.length && ONLY_PUNCT.test(text);
  }

  static isQuestion(sentence) { // remove?
    return RiTa.QUESTIONS.includes
      (RiTa.tokenize(sentence)[0].toLowerCase());
  }

  static isRhyme(word1, word2) {
    return RiTa._lexicon().isRhyme(word1, word2);
  }

  static isVerb(word) {
    return RiTa.tagger.isVerb(word);
  }

  static kwic() {
    return RiTa.concorder.kwic(...arguments);
  }

  static pastParticiple(verb) {
    return RiTa.conjugator.pastParticiple(verb);
  }

  static phonemes(text) {
    return RiTa._analyzer().analyze(text).phonemes;
  }

  static posTags(words, { simple = false, inline = false } = {}) {
    return RiTa.tagger.tag(words, simple, inline, true);
  }

  static posTagsInline(words, { simple = false } = {}) {
    return RiTa.tagger.tag(words, simple, true, true);
  }

  static pluralize() {
    return RiTa.pluralizer.pluralize(...arguments);
  }

  static presentParticiple(verb) {
    return RiTa.conjugator.presentParticiple(verb);
  }

  static random() {
    return RandGen.random(...arguments);
  }

  static randomOrdering(num) {
    return RandGen.randomOrdering(num);
  }

  static randomSeed(theSeed) {
    return RandGen.seed(theSeed);
  }

  static randomWord() {
    return RiTa._lexicon().randomWord(...arguments);
  }

  static rhymes() {
    return RiTa._lexicon().rhymes(...arguments);
  }

  static stem(word) {
    return RiTa.stem(word);
  }

  static stresses(text) {
    return RiTa._analyzer().analyze(text).stresses;
  }

  static syllables(text) {
    return RiTa._analyzer().analyze(text).syllables;
  }

  static similarBy() {
    return RiTa._lexicon().similarBy(...arguments);
  }

  static singularize() {
    return RiTa.pluralizer.singularize(...arguments);
  }

  static sentences(text) {
    return RiTa.tokenizer.sentences(text);
  }

  static stem(word) {
    return RiTa.stemmer.stem(word);
  }

  static tokenize(text) {
    return RiTa.tokenizer.tokenize(text);
  }

  static untokenize(words) {
    return RiTa.tokenizer.untokenize(words);
  }

  static words() {
    return RiTa._lexicon().words();
  }

  static hasLexicon() {
    return RiTa._lexicon().size() > 0;
  }

  /////////////////////////////////////////////////////////////////

  static _lexicon() { // lazy load
    if (typeof RiTa.lexicon === 'undefined') {
      RiTa.lts = new LetterToSound(RiTa);
      if (typeof NOLEX !== 'undefined') { // used by webpack, don't shorten
        RiTa.lexicon = new Lexicon(RiTa);
      }
      else {
        RiTa.lexicon = new Lexicon(RiTa, require('./rita_dict'));
      }
    }
    return RiTa.lexicon;
  }

  static _analyzer() { // lazy load
    if (typeof RiTa.analyzer === 'undefined') {
      RiTa._lexicon();
      RiTa.analyzer = new Analyzer(RiTa);
    }
    return RiTa.analyzer;
  }
}

// CLASSES
RiTa.Grammar = Grammar;
RiTa.Markov = Markov
RiTa.Markov.parent = RiTa;
RiTa.Grammar.parent = RiTa;

// COMPONENTS
RiTa.stemmer = new Stemmer(RiTa);
RiTa.tagger = new PosTagger(RiTa);
RiTa.concorder = new Concorder(RiTa);
RiTa.tokenizer = new Tokenizer(RiTa);
RiTa.pluralizer = new Pluralizer(RiTa);
RiTa.conjugator = new Conjugator(RiTa);

// LAZY-LOADS
RiTa.analyzer = undefined;
RiTa.lexicon = undefined;
RiTa.dict = undefined;
RiTa.lts = undefined;

// MESSAGES
RiTa.SILENT = false;
RiTa.SILENCE_LTS = false;
RiTa.DOWNLOAD_URL = 'https://rednoise.org/rita/downloads';

// CONSTANTS
RiTa.VERSION = 2;
RiTa.NODE = 'node';
RiTa.BROWSER = 'browser';
RiTa.FIRST_PERSON = 1;
RiTa.SECOND_PERSON = 2;
RiTa.THIRD_PERSON = 3;
RiTa.PAST_TENSE = 4;
RiTa.PRESENT_TENSE = 5;
RiTa.FUTURE_TENSE = 6;
RiTa.SINGULAR = 7;
RiTa.PLURAL = 8;
RiTa.NORMAL = 9;
RiTa.STRESSED = '1';
RiTa.UNSTRESSED = '0';
RiTa.PHONEME_BOUNDARY = '-';
RiTa.WORD_BOUNDARY = " ";
RiTa.SYLLABLE_BOUNDARY = "/";
RiTa.SENTENCE_BOUNDARY = "|";
RiTa.VOWELS = "aeiou";
RiTa.ABBREVIATIONS = ["Adm.", "Capt.", "Cmdr.", "Col.", "Dr.", "Gen.", "Gov.", "Lt.", "Maj.", "Messrs.", "Mr.", "Mrs.", "Ms.", "Prof.", "Rep.", "Reps.", "Rev.", "Sen.", "Sens.", "Sgt.", "Sr.", "St.", "a.k.a.", "c.f.", "i.e.", "e.g.", "vs.", "v.", "Jan.", "Feb.", "Mar.", "Apr.", "Mar.", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
RiTa.QUESTIONS = ["was", "what", "when", "where", "which", "why", "who", "will", "would", "who", "how", "if", "is", "could", "might", "does", "are", "have"];
RiTa.INFINITIVE = 1;
RiTa.GERUND = 2;
RiTa.IMPERATIVE = 3;
RiTa.BARE_INFINITIVE = 4;
RiTa.SUBJUNCTIVE = 5;

// Warn on words not found in lexicon
RiTa.LEX_WARN = false;

// For tokenization, Can't -> Can not, etc.
RiTa.SPLIT_CONTRACTIONS = false;

RiTa.FEATURES = ['tokens', 'stresses', 'phonemes', 'syllables', 'pos', 'text'].map(f => f.toUpperCase());

module && (module.exports = RiTa);
