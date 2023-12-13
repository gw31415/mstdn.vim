function mstdn#user#login(server, token) abort
	call denops#notify("mstdn", "login", [a:server, a:token])
endfunction

function mstdn#user#login_users() abort
	return denops#request("mstdn", "loginUsers", [])
endfunction

function mstdn#user#logout(user) abort
	let tokens = split(a:user, "@")
	if len(tokens) != 2
		throw "parse error"
	endif
	return denops#request("mstdn", "logout", tokens)
endfunction
