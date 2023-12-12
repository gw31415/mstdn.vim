function mstdn#login(token, server) abort
	call denops#notify("mstdn", "login", [a:token, a:server])
endfunction

function mstdn#login_users() abort
	return denops#request("mstdn", "loginUsers", [])
endfunction

function mstdn#logout(user) abort
	let tokens = split(a:user, "@")
	if len(tokens) != 2
		throw "parse error"
	endif
	return denops#request("mstdn", "logout", tokens)
endfunction

function mstdn#reconnect(bufnr = bufnr()) abort
	call denops#notify("mstdn", "reconnectBuffer", [a:bufnr])
endfunction

function mstdn#redraw(bufnr = bufnr()) abort
	call denops#notify("mstdn", "redrawBuffer", [a:bufnr])
endfunction

function mstdn#reconnect_all() abort
	call denops#notify("mstdn", "reconnectAll", [])
endfunction

function mstdn#load_more(lnum = line('.'), bufnr = bufnr()) abort
	call denops#notify("mstdn", "loadMore", [a:lnum - 1, a:bufnr])
endfunction

function mstdn#timelines() abort
	return denops#request("mstdn", "timelines", [])
endfunction

function mstdn#status_id(lnum = line('.'), bufnr = bufnr()) abort
	return denops#request("mstdn", "getStatusId", [a:lnum - 1, a:bufnr])
endfunction
