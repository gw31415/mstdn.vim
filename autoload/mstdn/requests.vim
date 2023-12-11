function mstdn#requests#favourite(lnum = line('.'), bufnr = bufnr()) abort
	let id = mstdn#status_id(a:lnum, a:bufnr)
	let endpoint = '/api/v1/statuses/' .. id .. '/favourite'
	return denops#notify('mstdn', 'requestMstdnCommitSingleStatus', [endpoint, 'POST', v:null, a:bufnr])
endfunction

function mstdn#requests#unfavourite(lnum = line('.'), bufnr = bufnr()) abort
	let id = mstdn#status_id(a:lnum, a:bufnr)
	let endpoint = '/api/v1/statuses/' .. id .. '/unfavourite'
	return denops#notify('mstdn', 'requestMstdnCommitSingleStatus', [endpoint, 'POST', v:null, a:bufnr])
endfunction

function mstdn#requests#post(dict, bufnr = bufnr()) abort
	let endpoint = '/api/v1/statuses'
	return denops#notify('mstdn', 'requestMstdnCommitSingleStatus', [endpoint, 'POST', a:dict, a:bufnr])
endfunction

function mstdn#requests#edit(dict, lnum = line('.'), bufnr = bufnr()) abort
	let id = mstdn#status_id(a:lnum, a:bufnr)
	let endpoint = '/api/v1/statuses/' .. id
	return denops#notify('mstdn', 'requestMstdnCommitSingleStatus', [endpoint, 'PUT', a:dict, a:bufnr])
endfunction
