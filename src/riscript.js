const antlr4 = require('antlr4');
const colors = require('colors');

const LexerErrors = require('./errors').LexerErrors;
const ParserErrors = require('./errors').ParserErrors;
const Visitor = require('./visitor');
const Lexer = require('../lib/RiScriptLexer');
const Parser = require('../lib/RiScriptParser');

class RiScript {

  constructor() {
    //this.parseTree = undefined;
    this.symbolTable = undefined;
    this.scripting = new Scripting();
  }

  static compile(input, context, showParse, silent) {
    let rs = new RiScript();
    rs.symbolTable = rs.scripting.lexParseCompile(input, context, showParse, silent);
    return rs;
    //
    // rs.parseTree = rs.scripting.lexParse(input, showParse, silent);
    // rs.visitor = rs.scripting.createVisitor(context, showParse, silent);
    // let symbolTable = rs.visitor.compile(context, 1);
    // console.log(rs.symbolTable);
    // return rs;
  }

  expand(rule, context) {
    let dbug = 0;
    let result = rule;
    let tries = 0, maxIterations = 100;
    //while (result.includes('$')) {
    while (++tries < maxIterations) {
      let next = this.expandRule(result, dbug);
      if (next && next.length && next !== result) { // matched a rule
        result = this.scripting.lexParseExpand(next, context);
        dbug && console.log('got: '+result);
        continue;
      }
      dbug && console.log('return: '+result+'\n---------------');
      return result;
    }
    dbug && console.log('return nil');
  }

  expandRule(prod, dbug) {
    for (let name in this.symbolTable) {
      let idx = prod.indexOf(name);
      if (idx >= 0) { // got a match, split into 3 parts
        dbug && console.log('matched: ' + name);
        let pre = prod.substring(0, idx) || '';
        let expanded = this.symbolTable[name] || '';
        let post = prod.substring(idx + name.length) || '';
        return pre + expanded + post;
      }
    }  // no rules matched
  }

  expandOrig(rule) {

    rule = rule || '$start';

    //console.log('rule: '+rule);
    if (!this.symbolTable) throw Error('Call compile() before run()');
    if (!this.symbolTable[rule]) throw Error('No rule called: ' + rule);

    let rules = Object.keys(this.symbolTable);
    let tries = 0, maxIterations = 1000;

    while (++tries < maxIterations) {
      console.log('rule: ' + rule);

      let next = this.expandRule(rule, rules);

      if (next && next.length) { // matched a rule

        rule = next;
        continue;
      }
      console.log('\n-------------------------------------------------');

      return rule;
    }

    throw Error('Failed to expand grammar from '
      + rule + ', after ' + tries + ' tries');
  }

  static evaluate(input, context, showParse, silent) {
    Object.assign((context = context || {}), silent ? { _silent: silent } : {});
    return new Scripting().lexParseVisit(input, context, showParse, silent);
  }

  /*
    run(context, showParse, silent) {
      let vis = this.scripting.createVisitor(context, showParse, silent);
      let result = vis.start(this.parseTree);
      //console.log('RESULT: '+result+'==============Symbols===============\n', vis.context);
      return result;
    }

    static evaluate(input, context, showParse, silent) {
      let rs = RiScript.compile(input, showParse, silent);
      Object.assign((context = context || {}), silent ? { _silent: silent } : {});
      return rs.run(context, showParse, silent);
    }

    static compile(input, showParse, silent) {
      let rs = new RiScript();
      rs.parseTree = rs.scripting.lexParse(input, showParse, silent);
      return rs;
    }
  */
}

class Scripting {

  constructor() {
    this.lexer = undefined;
    this.parser = undefined;
    this.visitor = undefined;
  }

  lex(input, showTokens, silent) {

    // create the lexer
    let stream = new antlr4.InputStream(input);
    this.lexer = new Lexer.RiScriptLexer(stream);
    this.lexer.removeErrorListeners();
    this.lexer.addErrorListener(new LexerErrors());
    //this.lexer.strictMode = false;

    // try the lexing
    let tokens;
    try {
      tokens = new antlr4.CommonTokenStream(this.lexer);
      if (showTokens) {
        tokens.fill();
        tokens.tokens.forEach(t => console.log(this.tokenToString(t)));
        console.log();
      }
    } catch (e) {
      if (!silent) {
        console.error(colors.red("LEXER: " + input + '\n' + e.message + "\n"));
      }
      throw e;
    }
    return tokens;
  }

  tokenToString(t) {
    let txt = "<no text>";
    if (t.text && t.text.length) {
      txt = t.text.replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r").replace(/\t/g, "\\t");
    }
    let type = (t.type > -1 ? this.lexer.symbolicNames[t.type] : 'EOF');
    return "[" + t.line + "." + t.column + ": '" + txt + "' -> " + type + "]";
  }

  parse(tokens, input, showParse, silent) {

    // create the parser
    this.parser = new Parser.RiScriptParser(tokens);
    //this.parser.buildParseTrees = false;
    this.parser.removeErrorListeners();
    this.parser.addErrorListener(new ParserErrors());
    //this.parser.addErrorListener(new ConsoleErrorListener());

    // try the parsing
    let tree;
    try {
      tree = this.parser.script();
    } catch (e) {
      if (!silent) {
        console.error(colors.red("PARSER: " + input + '\n' + e.message + '\n'));
      }
      throw e;
    }
    if (showParse) console.log(tree.toStringTree(this.parser.ruleNames), '\n');

    return tree;
  }

  lexParse(input, showParse, silent) {
    let tokens = this.lex(input, showParse, silent);
    return this.parse(tokens, input, showParse, silent);
  }

  lexParseVisit(input, context, showParse, silent) {
    let tree = this.lexParse(input, showParse, silent);
    return this.createVisitor(context, showParse).start(tree);
  }

  createVisitor(context, showParse, silent) {
    Object.assign((context = context || {}), silent ? { _silent: silent } : {});
    return new Visitor(context, this.lexer.symbolicNames, this.parser.ruleNames, showParse);
  }

  ////////////// NEW //////////////
  lexParseCompile(input, context, showParse, silent) { // not used...
    let tree = this.lexParse(input, showParse, silent);
    let visitor = this.createVisitor(context, showParse);
    visitor.symbolTable = {};
    visitor.start(tree);
    return visitor.symbolTable;
  }

  lexParseExpand(input, context, showParse, silent) { // not used...
    let tree = this.lexParse(input, showParse, silent);
    let visitor = this.createVisitor(context, showParse);
    return visitor.start(tree);
  }

}

module && (module.exports = RiScript);
