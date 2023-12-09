function mstdn#login(token, server) abort
	call denops#notify("mstdn", "login", [a:token, a:server])
endfunction

function mstdn#login_users() abort
	return denops#request("mstdn", "loginUsers", [])
endfunction

function mstdn#reconnect(bufnr = bufnr()) abort
	call denops#notify("mstdn", "reconnectBuffer", [a:bufnr])
endfunction

function mstdn#reconnect_all() abort
	call denops#notify("mstdn", "reconnectAll", [])
endfunction

function mstdn#fetch_more(bufnr = bufnr()) abort
	call denops#notify("mstdn", "fetchMore", [a:bufnr])
endfunction
