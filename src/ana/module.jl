
function get_exports(mod::Module, recursive::Bool)::Vector{Any}
	local res = []
	for name in names(mod; all = false, imported = true)
		#if !hasproperty(mod, name) && !hasfield(mod, name)
		try
			getfield(mod, name)
		catch e
			println("name: ", name, " not found in module: ", mod)
			continue
		end
		local thing = getfield(mod, name)
		#println(getproperty(mod, name))

		if isa(thing, Function)
			push!(res, get_function(thing))
		elseif isa(thing, DataType)
			# TODO
		elseif isa(thing, UnionAll)
			# TODO
		elseif isa(thing, Module)
			if recursive
				push!(res, get_module(thing))
			end
		else
			# TODO

			# probably a global variable

			if isconst(mod, name)
				# probably an ordinary constant
				# TODO
			else

			end
		end

	end

	res
end

ALL_MODULES = Dict{String, Any}()


function module_file(mod::Module)::String
	# https://stackoverflow.com/a/63883681/6144727
	String(first(methods(getfield(mod, :eval))).file)
end

function module_id(mod::Module)::String
	"MODULE: " * string(mod) * " | " * sani_path(module_file(mod))
end


function get_module(mod::Module, recursive = true)::String

	global ALL_MODULES
	local id = module_id(mod)
	if haskey(ALL_MODULES, id)
		return id
	end

	ALL_MODULES[id] = true

	# Return the path of the m.jl file that was used to import module m, or nothing if m was not imported from a package.
	local importedIn = pathof(mod)

	println(id)

	local definedIn = module_file(mod)

	local pkgid = Base.identify_package(string(mod))
	local uuid = nothing
	if pkgid === nothing
		#pkgid = Base.identify_package(string(mod.parent))
	else
		uuid = pkgid.uuid.value
	end

	ALL_MODULES[id] = (
		mod_name = string(mod),
		defined_in = sani_path(get_file(definedIn)),
		imported_in = isnothing(importedIn) ? nothing : sani_path(get_file(importedIn)),
		package_uuid = uuid,
		exports = get_exports(mod, recursive),
	)

	id
end
