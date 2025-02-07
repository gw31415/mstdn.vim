au BufReadCmd mstdn://* setf mstdn
if has('nvim')
	lua vim.treesitter.language.register('markdown', { 'mstdn' })
endif
