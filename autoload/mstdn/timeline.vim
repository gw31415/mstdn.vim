function mstdn#timeline#user(bufnr = bufnr()) abort
	return denops#request("mstdn", "user", [a:bufnr])
endfunction

function mstdn#timeline#favourite(lnum = line('.'), bufnr = bufnr()) abort
	let user = mstdn#timeline#user(a:bufnr)
	let id = mstdn#timeline#status_id(a:lnum, a:bufnr)
	let endpoint = '/api/v1/statuses/' .. id .. '/favourite'
	return denops#notify('mstdn', 'requestMstdn', [user, endpoint, 'POST', v:null])
endfunction

function mstdn#timeline#unfavourite(lnum = line('.'), bufnr = bufnr()) abort
	let user = mstdn#timeline#user(a:bufnr)
	let id = mstdn#timeline#status_id(a:lnum, a:bufnr)
	let endpoint = '/api/v1/statuses/' .. id .. '/unfavourite'
	return denops#notify('mstdn', 'requestMstdn', [user, endpoint, 'POST', v:null])
endfunction

function mstdn#timeline#status(lnum = line('.'), bufnr = bufnr()) abort
	return denops#request("mstdn", "getStatus", [a:lnum - 1, a:bufnr])
endfunction

function mstdn#timeline#status_id(lnum = line('.'), bufnr = bufnr()) abort
	return denops#request("mstdn", "getStatusId", [a:lnum - 1, a:bufnr])
endfunction

function mstdn#timeline#reconnect(bufnr = bufnr()) abort
	call denops#notify("mstdn", "reconnectBuffer", [a:bufnr])
endfunction

function mstdn#timeline#redraw(bufnr = bufnr()) abort
	call denops#notify("mstdn", "redrawBuffer", [a:bufnr])
endfunction

function mstdn#timeline#reconnect_all() abort
	call denops#notify("mstdn", "reconnectAll", [])
endfunction

function mstdn#timeline#load_more(lnum = line('.'), bufnr = bufnr()) abort
	call denops#notify("mstdn", "loadMore", [a:lnum - 1, a:bufnr])
endfunction

function mstdn#timeline#buffers() abort
	return denops#request("mstdn", "timelines", [])
endfunction

function mstdn#timeline#status_defaults(bufnr = bufnr()) abort
	return denops#request("mstdn", "getStatusDefaults", [a:bufnr])
endfunction
