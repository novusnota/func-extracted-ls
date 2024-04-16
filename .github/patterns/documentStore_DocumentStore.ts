// @ts-nocheck
export class DocumentStore extends TextDocuments<TextDocument> {
    private readonly _onDidChangeContent2 = new lsp.Emitter<TextDocumentChange2>();
	readonly onDidChangeContent2 = this._onDidChangeContent2.event;

	private readonly _decoder = new TextDecoder();
	private readonly _fileDocuments: LRUMap<string, Promise<DocumentEntry>>;

	constructor(private readonly _connection: lsp.Connection) {
		super({
			create: TextDocument.create,
			update: (doc, changes, version) => {
				let result: TextDocument;
				let incremental = true;
				let event: TextDocumentChange2 = { document: doc, changes: [] };

				for (const change of changes) {
					if (!lsp.TextDocumentContentChangeEvent.isIncremental(change)) {
						incremental = false;
						break;
					}
					const rangeOffset = doc.offsetAt(change.range.start);
					event.changes.push({
						text: change.text,
						range: change.range,
						rangeOffset,
						rangeLength: change.rangeLength ?? doc.offsetAt(change.range.end) - rangeOffset,
					});
				}
				result = TextDocument.update(doc, changes, version);
				if (incremental) {
					this._onDidChangeContent2.fire(event);
				}
				return result;
			}
		});

		this._fileDocuments = new LRUMap<string, Promise<DocumentEntry>>({
			size: 200,
			dispose: _entries => { }
		});

		super.listen(_connection);

		_connection.onNotification('file-cache/remove', uri => this._fileDocuments.delete(uri));
	}

	async retrieve(uri: string): Promise<DocumentEntry> {
		let result = this.get(uri);
		if (result) {
			return { exists: true, document: result };
		}
		let promise = this._fileDocuments.get(uri);
		if (!promise) {
			promise = this._requestDocument(uri);
			this._fileDocuments.set(uri, promise);
		}
		return promise;
	}

	private async _requestDocument(uri: string): Promise<DocumentEntry> {
		const parsedUri = URI.parse(uri);

		if (parsedUri.scheme === 'vscode-notebook-cell') {
			// we are dealing with a notebook
			return { exists: false, document: undefined};
		}

		let data: Uint8Array;
		try {
			const file = await this._fileDocuments.get(parsedUri.fsPath);
			if (file === undefined) {
				return { exists: false, document: undefined};
			}
			return file;
		} catch (err) {
			return { exists: false, document: undefined};
		}
	}
}
