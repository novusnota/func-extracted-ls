// @ts-nocheck
export class FormattingProvider {
	constructor(private readonly _documents: DocumentStore, private readonly _trees: Trees) { }

	register(connection: lsp.Connection) {
		// connection.client.register(lsp.DocumentFormattingRequest.type);
		connection.onRequest(lsp.DocumentFormattingRequest.type, this.provideDocumentFormattingEdits.bind(this));
	}

	async provideDocumentFormattingEdits(params: lsp.DocumentFormattingParams): Promise<lsp.TextEdit[] | null> {
		const tree = (await this._trees.getParseTree(params.textDocument.uri))!;
		const document = await this._documents.retrieve(params.textDocument.uri);
		let edits: lsp.TextEdit[] = [];
		// console.log('Formatting document');

		let indent = 0;
		let cursor = tree.rootNode.walk();
		let hasAny = cursor.gotoFirstChild();
		while (hasAny) {
			let node = cursor.currentNode();
			
			if (node.type === '}' || node.type === ')' || node.type === ']') indent--;

			edits.push(...formatNode(node, document.document!, indent, params.options));

			if (node.type === '{' || node.type === '(' || node.type === '[') indent++;

			// walk
			if (cursor.gotoFirstChild()) {
				continue;
			}
			while (!cursor.gotoNextSibling()) {
				hasAny = cursor.gotoParent();
				if (!hasAny) {
					break;
				}
			}
		}

		// TODO: process final new line and trailing whitespaces
		
		return edits;
	}
}
