# func-extracted-ls

💎 FunC language server (of LSP specification), extracted and re-packaged from its official [VSCode extension](...).

⚙ Automatically builds upon updates in the upstream VSCode extension through Github Actions.

## Known issues

* Diagnostics for `#import` statements say "Dependency not found" until you open imported files at least once during your editing session.

That's because the FunC's VSCode extension and inner language server were designed very tightly coupled to VSCode, expecting it to provide all the files. Unfortunately, that non-standard communication doesn't work in this extracted LS form.

As a temporary solution (because permanent may require full rewrite of the LS), just open all the imported files in your editing session at least once, then invoke any LSP action (code completion, for example) and all those files would be sourced during your editing session.

## Installation

The only requirement is having a Node.js version 16 or higher installed. Then, run the following command to install the extracted FunC language server:

```bash
npm i -g func-extracted-ls
```

<details>
  <summary>Alternatives</summary>
  <p></p>

  Using `yarn`:

  ```bash
  yarn global add func-extracted-ls
  ```

  Using `pnpm`:

  ```bash
  pnpm add -g func-extracted-ls
  ```

  Using `bun`:

  ```bash
  bun add -g func-extracted-ls
  ```

</details>

<p></p>

## Clients

The following editors and IDEs have available clients:

<!--
  TODO: plugins or PRs to support default configuration
  (or at least submit a PR for default configuration)

- [Helix](https://helix-editor.com/) (built-in support)
- Sublime Text (plugin is in the making)
- Emacs        (plugin is in the making)
- Neovim: nvim-lspconfig, mason-lsp
-->

* [Visual Studio Code][func-vscode]
* Sublime Text ([see below](#sublime-text))
* Vim ([see below](#vim))
* Neovim ([see below](#neovim))
* Helix ([see below](#helix))
* Oni ([see below](#oni))
* IntelliJ IDEA and related IDEs from JetBrains ([see below](#jetbrains))

### Sublime Text

First, install the [**LSP** package](https://packagecontrol.io/packages/LSP) if it's not installed already.

Then, open its settings (**Preferences: LSP Settings** in the command palette, <kbd>Ctrl/Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>), then add this config:

```json
{
  "clients": {
    "FunC": {
      "enabled": true,
      "command": ["func-extracted-ls", "--stdio"],
      "selector": "source.fc, source.func"
    }
  }
}
```

### Vim

For Vim 8 or later install the plugin [prabirshrestha/vim-lsp](https://github.com/prabirshrestha/vim-lsp) and add the following to `.vimrc`:

```vim
if executable('func-extracted-ls')
  au User lsp_setup call lsp#register_server({
        \ 'name': 'func',
        \ 'cmd': {server_info->['func-extracted-ls', '--stdio']},
        \ 'allowlist': ['fc', 'func'],
        \ })
endif
```

For Vim 8 or Neovim using [YouCompleteMe](https://github.com/ycm-core/YouCompleteMe), add the following to `.vimrc`:

```vim
let g:ycm_language_server =
    \ [
    \   {
    \     'name': 'func',
    \     'cmdline': [ 'func-extracted-ls', '--stdio' ],
    \     'filetypes': [ 'fc', 'func' ],
    \   }
    \ ]
```

For Vim 8 or Neovim using [neoclide/coc.nvim](https://github.com/neoclide/coc.nvim), according to [it's Wiki article](https://github.com/neoclide/coc.nvim/wiki/Language-servers#bash), add the following to your `coc-settings.json`:

```jsonc
  "languageserver": {
    "func": {
      "command": "func-extracted-ls",
      "args": ["--stdio"],
      "filetypes": ["fc", "func"],
      "ignoredRootPaths": ["~"]
    }
  }
```

### Neovim

For Neovim 0.8 and later:

```lua
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'fc', 'func' },
  callback = function()
    vim.lsp.start({
      name = 'func-extracted-ls',
      cmd = { 'func-extracted-ls', '--stdio' },
    })
  end,
})
```

For Neovim prior to 0.8 and using [autozimu/LanguageClient-neovim](https://github.com/autozimu/LanguageClient-neovim), add the following to `init.vim`:

```vim
let g:LanguageClient_serverCommands = {
    \ 'func': ['func-extracted-ls', '--stdio']
    \ }
```

### Helix

Create or open `~/.config/helix/languages.toml` (Use `~\AppData\Roaming\helix\languages.toml` on Windows) and add the following:

```toml
[[language]]
name = "func"
scope = "source.func"
injection-regex = "^(fc|func)$"
file-types = ["fc", "func"]
language-servers = [ "func-extracted-ls" ]
comment-token = ";;"
indent = { tab-width = 4, unit = "    " }

[language.auto-pairs]
'"' = '"'
'{' = '}'
'(' = ')'
'[' = ']'

[language-server.func-extracted-ls]
command = "func-extracted-ls"
args = [ "--stdio" ]
```

### Oni

On the config file (**File → Preferences → Edit Oni config**) add the following configuration:

```javascript
"language.func.languageServer.command": "func-extracted-ls",
"language.func.languageServer.arguments": ["--stdio"],
```

### JetBrains

As of now, Language Server Protocol support is unofficial and only available in IntelliJ IDEA and related IDEs from JetBrains through 3rd-party plugins. Instead, please use the official extension for all things TON in IntelliJ IDEs: [intellij-ton](https://plugins.jetbrains.com/plugin/23382-ton).

### The rest

Didn't find your editor on the list? Try searching for tips in the respective documentation or related community resources.

Note, that some editors may not support the Language Server Protocol (LSP), in which case you're out of luck until such support is added by editor maintainers or external contributors, such as yourself.

If you did manage to set up and use the FunC language server in your editor, then please file an issue or submit a PR to this repository and explain how you did it 🤗

## Contributing

If you have any issues which arise ONLY in the case of using provided language servers outside of VSCode, please, file an issue to [the present repository](https://github.com/novusnota/func-extracted-ls/issues).

In any other case, please, file issues to the upstream extension repository: [FunC VSCode extension][func-vscode].

## Credits

Based on [The Open Network](https://ton.org).

Packaged with 🤍 by [Novus Nota](https://github.com/novusnota).

## License

TODO:

* Packaging: [MIT](https://github.com/novusnota/func-extracted-ls/blob/main/LICENSE) © [Novus Nota](https://github.com/novusnota)
* [VSCode extension][func-vscode]: [GNU General Public License v3.0 (GPL-3.0)](https://github.com/ton-community/vscode-func/blob/main/LICENSE)

[func-vscode]: https://github.com/ton-community/vscode-func
