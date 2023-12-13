# mstdn.vim

Mastodon client for Vim/Neovim.

## Installation

```vim
call dein#add("vim-denops/denops.vim") " Required
call dein#add("gw31415/mstdn.vim")

" Optional: Post editor window
call dein#add("gw31415/mstdn-editor.vim")
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
