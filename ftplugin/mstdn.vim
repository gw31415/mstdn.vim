call denops#notify("mstdn", "loadBuffer", [])
au BufDelete <buffer> call denops#notify("mstdn", "deleteBuffer", [str2nr(expand("<abuf>"))])

setl bt=nofile noswf noma nowrap

sign define fav text=▸ texthl=MstdnFavourite
autocmd ColorScheme * highlight link Author Comment
autocmd ColorScheme * highlight link MstdnLoadMore WildMenu
autocmd ColorScheme * highlight MstdnFavourite ctermfg=217 gui=bold guifg=#e86671
doautocmd ColorScheme
