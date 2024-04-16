// @ts-nocheck
import { URI } from 'vscode-uri';
connection.onInitialize(async (params: InitializeParams) => {
	await initParser(
		params.initializationOptions?.treeSitterWasmUri ?? URI.file(__dirname + '/../lib/tree-sitter.wasm').fsPath,
		params.initializationOptions?.langUri ?? URI.file(__dirname + '/../lib/tree-sitter-func.wasm').fsPath,
	);

	const documents = new DocumentStore(connection);
	const trees = new Trees(documents);

	const symbolIndex = new SymbolIndex(trees, documents);
	const depsIndex = new DepsIndex(trees, documents);

	const diagnosticsProvider = new DiagnosticsProvider(depsIndex, symbolIndex);
	diagnosticsProvider.register(connection);

	const docSymb = new DocumentSymbols(documents, trees);
	docSymb.register(connection);

	const compProv = new CompletionItemProvider(documents, trees, symbolIndex, depsIndex);
	compProv.register(connection);

	const defProv = new DefinitionProvider(documents, trees, symbolIndex, depsIndex);
	defProv.register(connection);

	const fmtProv = new FormattingProvider(documents, trees);
	fmtProv.register(connection);

	const rnProv = new RenameProvider(documents, trees, symbolIndex);
	rnProv.register(connection);

	const codeLensProv = new CodeLensProvider(documents, trees);
	codeLensProv.register(connection);

	// manage configuration
	connection.onNotification('configuration/change', (config) => {
		mutateConfig(config);
	});
	connection.onDidChangeConfiguration(event => {
		mutateConfig(event.settings);
	});

	// manage symbol index. add/remove files as they are discovered and edited
	documents.all().forEach(doc => symbolIndex.addFile(doc.uri));
	documents.onDidOpen(event => symbolIndex.addFile(event.document.uri));
	documents.onDidChangeContent(event => symbolIndex.addFile(event.document.uri));

	// badly handled
	connection.onNotification('queue/remove', uri => symbolIndex.removeFile(uri));
	connection.onNotification('queue/add', uri => symbolIndex.addFile(uri));
	connection.onRequest('queue/init', uris => {
		return symbolIndex.initFiles(uris);
	});

	// add new files
	connection.onDidChangeWatchedFiles(event => {
		for (const change of event.changes) {
			switch (change.type) {
				case FileChangeType.Created:
					symbolIndex.addFile(change.uri);
					break;
				case FileChangeType.Changed:
					symbolIndex.addFile(change.uri);
					break;
				case FileChangeType.Deleted:
					symbolIndex.removeFile(change.uri);
					break;
			}
		}
	});

	// on parse done
	trees.onParseDone(async (event) => {
		await depsIndex.update(event.document, event.tree);
		diagnosticsProvider.provideDiagnostics(event.document, event.tree);
	});

	// return the list of capabilities
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// diagnostics are only in the push mode, so they're not listed here
			// diagnosticProvider: {
			// 	// documentSelector: null,
			// 	interFileDependencies: true,
			// 	workspaceDiagnostics: false,
			// },
			documentSymbolProvider: true,
			completionProvider: {
				resolveProvider: true,
				documentSelector: [{ language: 'func' }],
				triggerCharacters: ['.', '~']
			},
			definitionProvider: true,
			documentFormattingProvider: true,
			renameProvider: true,
			codeLensProvider: {
				resolveProvider: true,
			}
		},
	};
});
