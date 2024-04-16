// @ts-nocheck
export class DocumentSymbols {
  constructor(private readonly _documents: DocumentStore, private readonly _trees: Trees) { }

  register(connection: lsp.Connection) {
    // connection.client.register(lsp.DocumentSymbolRequest.type);
    connection.onRequest(lsp.DocumentSymbolRequest.type, this.provideDocumentSymbols.bind(this));
  }

  async provideDocumentSymbols(params: lsp.DocumentSymbolParams): Promise<lsp.DocumentSymbol[]> {
    const document = await this._documents.retrieve(params.textDocument.uri);
    let symbols = getDocumentSymbols(document.document!, this._trees);
    return symbols.map(a => a.symbol);
  }
}
