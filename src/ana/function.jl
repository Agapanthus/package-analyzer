
function get_methods(f)
	local res = []
	for m::Method in methods(f)

		local file_path = string(m.file)
		if !isabspath(file_path)
			if m.module == Base
				file_path = joinpath(STD_LIB_PATH, file_path)
			else 
				println("WARNING: $file_path is not an absolute path")
			end
		end

		push!(res, (
			type = "method",
			#fn = m.sig.parameters[1],
			params = get_type(m.sig),
			file = get_file(file_path),
			line = m.line,
		))
	end
	res
end

ALL_FUNCTIONS = Dict{String, Any}()

function function_id(f)::String
	"FUNCTION: " * string(f)
end

function get_function(f)
	global ALL_FUNCTIONS
	local id = function_id(f)
	if haskey(ALL_FUNCTIONS, id)
		return id
	end
	ALL_FUNCTIONS[id] = true
	ALL_FUNCTIONS[id] = (
		type = "function",
		id = id,
		name = string(f),
		methods = get_methods(f),
	)
	id
end
