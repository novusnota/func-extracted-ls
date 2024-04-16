import 'zx/globals';

/**
 * List of patterns for ast-grep
 *
 * @returns {{old_pattern: string, file_to_rewrite: string, file_with_new_pattern: string}[]}
 */
function getPatterns() {
  return [
	  {
	    old_pattern: 'connection.onInitialize($FUNC);',
	    file_to_rewrite: 'extension/server/src/server.ts',
	    file_with_new_pattern: '.github/patterns/server_oninitialize.ts'
	  },
	  {
	    old_pattern: 'connection.onInitialized($FUNC);',
	    file_to_rewrite: 'extension/server/src/server.ts',
	    file_with_new_pattern: '.github/patterns/server_oninitialized.ts'
	  },
	  {
	    old_pattern: 'import { LRUMap } from \'./utils/lruMap\';',
	    file_to_rewrite: 'extension/server/src/documentStore.ts',
	    file_with_new_pattern: '.github/patterns/documentStore_import.ts',
	  },
	  {
	    old_pattern: 'export class DocumentStore $$$EXT {$$$META}',
	    file_with_new_pattern: '.github/patterns/documentStore_DocumentStore.ts',
	    file_to_rewrite: 'extension/server/src/documentStore.ts',
	  },
	  {
	    old_pattern: 'export class CodeLensProvider { $$$META }',
	    file_with_new_pattern: '.github/patterns/features-codeLens_CodeLensProvider.ts',
	    file_to_rewrite: 'extension/server/src/features/codeLens.ts',
	  },
	  {
	    old_pattern: 'export class CompletionItemProvider { $$$META }',
	    file_with_new_pattern: '.github/patterns/features-completion.ts',
	    file_to_rewrite: 'extension/server/src/features/completion.ts',
	  },
	  {
	    old_pattern: 'export class DefinitionProvider { $$$META }',
	    file_with_new_pattern: '.github/patterns/features-definitions.ts',
	    file_to_rewrite: 'extension/server/src/features/definitions.ts',
	  },
	  {
	    old_pattern: 'export class DocumentSymbols { $$$META }',
	    file_with_new_pattern: '.github/patterns/features-documentSymbols.ts',
	    file_to_rewrite: 'extension/server/src/features/documentSymbols.ts',
	  },
	  {
	    old_pattern: 'export class FormattingProvider { $$$META }',
	    file_with_new_pattern: '.github/patterns/features-formatting.ts',
	    file_to_rewrite: 'extension/server/src/features/formatting/index.ts',
	  },
	  {
	    old_pattern: 'export class RenameProvider { $$$META }',
	    file_with_new_pattern: '.github/patterns/features-rename.ts',
	    file_to_rewrite: 'extension/server/src/features/rename.ts',
	  },
	  {
	    old_pattern: '$$$META', // everything
	    file_to_rewrite: 'extension/server/src/parser.ts',
	    file_with_new_pattern: '.github/patterns/parser.ts'
	  },
	  // {
	  //   old_pattern: '$$$META',  // replace everything
	  //   file_with_new_pattern: '.github/patterns/features-symbolIndex.ts',
	  //   file_to_rewrite: 'extension/server/src/features/symbolIndex.ts',
	  // },
  ];
}

/**
 * Scans target files for patterns, re-writing them with contents of other files
 */
async function rewriteWithAstGrep() {
  const patterns = getPatterns();
  for (const pattern of patterns) {
  	await $`yarn sg run -p ${pattern.old_pattern} -r ${fs.readFileSync(pattern.file_with_new_pattern).toString()} -U ${pattern.file_to_rewrite}`;
  }
}

rewriteWithAstGrep();

