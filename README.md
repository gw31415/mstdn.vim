# mstdn.vim

Mastodon client for Vim/Neovim.

![out](https://github.com/gw31415/mstdn.vim/assets/24710985/fd1b5df0-44cb-4b32-b83a-f756d493d7f7)

## Installation & Config Example

- Deno and [denops](https://github.com/vim-denops/denops.vim) is required.

```vim
call dein#add("vim-denops/denops.vim") " Required
call dein#add("gw31415/mstdn.vim")

" For Neovim users:
call dein#add("MeanderingProgrammer/render-markdown.nvim") " Recommended: Better visibility of hashtags and other links
lua << EOF
require 'render-markdown'.setup {
  file_types = { 'markdown', 'mstdn' }, -- Add mstdn filetype to render
}
EOF

" Optional: Post editor window
call dein#add("gw31415/mstdn-editor.vim")

" Optional: Image preview by sixel
  " Dependency of mstdn-imgview.vim
  call dein#add("gw31415/denops-sixel-view.vim")
call dein#add("gw31415/mstdn-imgview.vim")


autocmd FileType mstdn call s:mstdn_config()
function s:mstdn_config() abort
  " Some preferences
  setl nonu so=0 scl=yes

  " Key mappings
  nn <buffer> <enter> <cmd>call mstdn#timeline#load_more()<cr>
  nn <buffer> <expr> G getcurpos()[1] == line('$') ? "\<cmd>call mstdn#timeline#load_more()\<cr>" : "\<cmd>norm! G\<cr>"
  nn <buffer><nowait> > <cmd>call mstdn#timeline#favourite()<cr>
  nn <buffer><nowait> < <cmd>call mstdn#timeline#unfavourite()<cr>
  nn <buffer><nowait> <C-r> <cmd>call mstdn#timeline#reconnect()<cr>

  " Configuration for mstdn-editor.vim
  nn <buffer> i <Plug>(mstdn-editor-open)

  " Configuration for mstdn-imgview.vim
  nn <buffer> <ESC> <ESC><cmd>call mstdn#imgview#clear()<cr>
  nn <buffer> <C-k> <cmd>call mstdn#imgview#view(-1)<cr>
  nn <buffer> <C-j> <cmd>call mstdn#imgview#view(+1)<cr>

  " auto reconnect
  call timer_start(1500, {-> mstdn#timeline#reconnect_all()}, #{repeat: -1})
endfunction
```

## How to use

### Login

First, you have to log in to the server by calling the function
`mstdn#user#login()`.

```vim
:call mstdn#user#login("mstdn.jp", "uve5PPpXih64o_hdOvFOEWqTP90m4QY0QokrHt3L9uar0_Ww")
```

(Confidential information is stored in plain text in the
[cache directory](https://deno.land/x/dir@1.5.2/cache_dir/mod.ts). Caution.)

### Timeline

All you need to do is `:edit` the URL listed below after logging in:

| URL                                                   | Timeline                |
| ----------------------------------------------------- | ----------------------- |
| `mstdn://[username]@[serveraddr]/home`                | home timeline           |
| `mstdn://[username]@[serveraddr]/public`              | global timeline         |
| `mstdn://[username]@[serveraddr]/public/media`        | global media timeline   |
| `mstdn://[username]@[serveraddr]/public/tag/:hashtag` | global hashtag timeline |
| `mstdn://[username]@[serveraddr]/local`               | local timeline          |
| `mstdn://[username]@[serveraddr]/local/media`         | local media timeline    |
| `mstdn://[username]@[serveraddr]/local/tag/:hashtag`  | local hashtag timeline  |
| `mstdn://[username]@[serveraddr]/remote`              | remote timeline         |
| `mstdn://[username]@[serveraddr]/remote/media`        | remote media timeline   |

### Post

I recommend to use
[mstdn-editor.vim](https://github.com/gw31415/mstdn-editor.vim). Or you can
create posting system using API.

For example, you can post `Hello, world!` in this way:

```vim
:call mstdn#request#post("alice@mstdn.jp", #{status: "Hello, world!"})
```

The second argument is the dictionary of the
[Form Data Parameters](https://docs.joinmastodon.org/methods/statuses/#form-data-parameters).

## API

Read the [doc](./doc/mstdn.txt).
