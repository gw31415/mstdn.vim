function mstdn#request#post(user, dict) abort
	let endpoint = '/api/v1/statuses'
	return denops#notify('mstdn', 'requestMstdn', [a:user, endpoint, 'POST', a:dict])
endfunction

function mstdn#request#edit(dict, lnum = line('.'), bufnr = bufnr()) abort
	let id = mstdn#status_id(a:lnum, a:bufnr)
	let endpoint = '/api/v1/statuses/' .. id
	return denops#notify('mstdn', 'requestMstdn', [a:user, endpoint, 'PUT', a:dict])
endfunction
