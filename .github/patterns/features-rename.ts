// @ts-nocheck
export class RenameProvider {
	constructor(private readonly _documents: DocumentStore, private readonly _trees: Trees, private readonly _symbols: SymbolIndex) { }

	register(connection: lsp.Connection) {
        // connection.client.register(lsp.RenameRequest.type);
		connection.onRequest(lsp.RenameRequest.type, this.performRename.bind(this));
	}

	async performRename(params: lsp.RenameParams): Promise<lsp.WorkspaceEdit | null> {
        let tree = await this._trees.getParseTree(params.textDocument.uri);
        let oldIdentifier = tree!.rootNode.descendantForPosition(asParserPoint(params.position));

        // try to find declaration
        let locals = findLocals(tree!.rootNode, oldIdentifier.endPosition);
        let localDeclaration = locals.find(a => a.text === oldIdentifier.text);
        if (localDeclaration) {
            // rename to the end of block
            let parentBlock = findParentBlock(localDeclaration.node)!;
            let identifiers = findChildrenWithType(parentBlock, 'identifier', localDeclaration.node.startPosition, parentBlock.endPosition);
            let needToRename = identifiers.filter(a => a.text === oldIdentifier.text);
            return {
                changes: {
                    [params.textDocument.uri]: needToRename.map(a => ({
                        range: asLspRange(a),
                        newText: params.newName
                    }))
                }
            }
        } else {
            return null;
        }
	}
}
