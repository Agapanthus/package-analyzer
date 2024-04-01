
function get_union_all(t)
	(
		#name = string(t.name),
		#params = get_type(t.parameters[1]),
		s = string(t),
		what = "UnionAll",
		name = t.var.name,
		ub = get_type(t.var.ub),
		lb = get_type(t.var.lb),
		body = get_type(t.body),
	)
end

function get_tuple(t)
	#@show t, typeof(t)
	(
		what = "tuple",
		params = map(get_type, collect(t.parameters)), #t == Tuple ? [] : map(get_type, collect(fieldtypes(t)))
	)
end

union_types(x::Union) = (x.a, union_types(x.b)...)
union_types(x::Type) = (x,)
union_types(x::TypeVar) = (x,) # TODO: what?

function get_union(t)
	(
		what = "Union",
		types = map(get_type, union_types(t)),
	)
end

function get_data_type(t)
	function inner(t)
		if t isa Union
			return get_union(t)
		elseif t isa TypeVar
			return "TypeVar"
		elseif t isa Core.TypeofVararg #|| t <: Core.TypeofVararg
			return "Vararg"
		elseif t isa Core.TypeofBottom
			return "Bottom"
		elseif t == Any
			return "Any"
		elseif isprimitivetype(t)
			return (what = "primitive",
				name = string(t),
				bits = sizeof(t) * 8,
				supertype = get_type(supertype(t)))
		elseif isabstracttype(t)
			return (what = "abstract",
				name = string(t),
				parameters = map(get_type, collect(t.parameters)),
				supertype = get_type(supertype(t)))
		elseif typeof(t) == DataType && t <: Tuple
			return get_tuple(t)
		else
			# TODO
			#println("????" * string(t))
		end
	end

	inner(t)
end

function get_type_i(t)
	if t isa UnionAll
		return get_union_all(t)
	end

	get_data_type(t)
end

ALL_TYPES = Dict{String, Any}()
#=
function get_type(t)
	local ts = string(t)
	global ALL_TYPES
	if haskey(ALL_TYPES, ts)
		return ALL_TYPES[ts]
	end
	ALL_TYPES[ts] = true
	local x = get_type_i(t)
	ALL_TYPES[ts] = x
	x
end=#


function get_type(t)
	get_type_i(t)
end
