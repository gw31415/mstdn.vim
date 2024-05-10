# mstdn.vim

Mastodon client for Vim/Neovim.

![out](https://github.com/gw31415/mstdn.vim/assets/24710985/fd1b5df0-44cb-4b32-b83a-f756d493d7f7)

## Installation & Config Example

- Deno and [denops](https://github.com/vim-denops/denops.vim) is required.

```vim
call dein#add("vim-denops/denops.vim") " Required
call dein#add("gw31415/mstdn.vim")

" For Neovim users:
call dein#add("MeanderingProgrammer/markdown.nvim") " Recommended: Better visibility of hashtags and other links

" Optional: Post editor window
call dein#add("gw31415/mstdn-editor.vim")

autocmd BufReadCmd mstdn://* call s:mstdn_config()
function s:mstdn_config() abort
    " Some preferences
    setl nonu so=0 scl=yes

    " Key mappings
    nn <buffer> <enter> <cmd>call mstdn#timeline#load_more()<cr>
    nn <buffer> <expr> G getcurpos()[1] == line('$') ? "\<cmd>call mstdn#timeline#load_more()\<cr>" : "\<cmd>norm! G\<cr>"
    nn <buffer><nowait> > <cmd>call mstdn#timeline#favourite()<cr>
    nn <buffer><nowait> < <cmd>call mstdn#timeline#unfavourite()<cr>

    " Configuration for mstdn-editor.vim
    nn <buffer> i <Plug>(mstdn-editor-open)
endfunction
" auto reconnect
autocmd BufReadCmd mstdn://* call timer_start(1500, {-> mstdn#timeline#reconnect_all()}, #{repeat: -1})
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

### Image preview

If you want to preview an image, you can get the image data formatted in SIXEL.
You can display the image by outputting the SIXEL string with echoraw, etc. on a SIXEL compatible terminal (iTerm 2, Wezterm, etc.).

```vim
const s:FONTHEIGHT = 14
const s:FONTWIDTH = s:FONTHEIGHT / 2
const s:RETINA_SCALE = 2

autocmd BufReadCmd mstdn://* call s:mstdn_config()

let s:echoraw = has('nvim')
			\ ? {str->chansend(v:stderr, str)}
			\ : {str->echoraw(str)}

function s:refresh() abort
	if exists('b:img_index')
		unlet b:img_index
	endif
	exec "norm! \<ESC>\<C-l>"
endfunction

function s:display_sixel(sixel, lnum, cnum) abort
	call s:echoraw("\x1b[s")
	call s:echoraw("\x1b[" . a:lnum . ";" . a:cnum . "H" . a:sixel)
	call s:echoraw("\x1b[u")
endfunction

function s:preview_cur_img(next) abort
	if !exists('b:img_index')
		let b:img_index = 0
	else
		let b:img_index = b:img_index + a:next
	endif
	let ww = winwidth('.')
	let wh = winheight('.')
	let maxWidth = ww * s:FONTWIDTH / 2 * s:RETINA_SCALE
	let maxHeight = wh * s:FONTHEIGHT / 2 * s:RETINA_SCALE
	let source = mstdn#timeline#img_sixel(b:img_index, v:true, #{maxWidth: maxWidth, maxHeight: maxHeight})
	if type(source) == type(v:null)
		let b:img_index = b:img_index - a:next
		lua vim.notify("No image found", vim.log.levels.ERROR)
		return
	endif

	cal s:display_sixel(source['data'], 0, 0)
	au CursorMoved,CursorMovedI,BufLeave <buffer> ++once call s:refresh()
endfunction
```

Then, you can map the keybinds.

```vim
nn <buffer> <C-k> <cmd>call <SID>preview_cur_img(-1)<cr>
nn <buffer> <C-j> <cmd>call <SID>preview_cur_img(+1)<cr>
```

## API

Read the [doc](./doc/mstdn.txt).
