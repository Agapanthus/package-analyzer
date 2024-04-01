

@kwdef struct AnaArtifact
	filename::String
	file_extension::String
	path::String
	content::Vector{UInt8}
	bytes::Int
	readable::Bool
end

function get_artifact(path::String)::AnaArtifact
	try
		local content = Vector{UInt8}(undef, filesize(path))
		read!(path, content)
		return AnaArtifact(
			filename = basename(path),
			file_extension = splitext(path)[2],
			path = sani_path(path),
			content = [], # TODO: content,
			bytes = length(content),
			readable = true,
		)
	catch e
		return AnaArtifact(
			filename = basename(path),
			file_extension = splitext(path)[2],
			path = sani_path(path),
			content = [],
			bytes = 0,
			readable = false,
		)
	end
end

@kwdef struct AnaTextFile
	artifact::AnaArtifact
	text::String
	blanks::Int = -1
	code::Int = -1
	comments::Int = -1
	lang::String = ""
end

function get_text_file(path::String)::AnaTextFile
	try
		local text = read(path, String)
		AnaTextFile(
			artifact = get_artifact(path),
			text = text,
		)
	catch e
		@show e
		AnaTextFile(
			artifact = get_artifact(path),
			text = "",
		)
	end
end

function sani_path(path::String)::String
	path = normpath(path)
	# remove part before .julia/packages
	path = replace(path, r"^.*\.julia/packages/([^/]+)/[^/]+/" => s"\1/")
	path = replace(path, r"^.*/julia/basev\d+\.\d+/([^/]+)/[^/]+/" => s"\1/")
	path = replace(path, r"^.*/julia/base/" => s"Base/")
	path
end

ALL_FILES = Dict{String, AnaTextFile}()

using Tokei_jll
function reset_file_list(dir::String)

	global ALL_FILES
	ALL_FILES = Dict{String, AnaTextFile}()

	local json = JSON.parse(String(read(Cmd(`$(tokei()) --output json --files .`; dir))))

	for language in keys(json)
		for report in json[language]["reports"]
			local id = get_file(normpath(joinpath(dir, report["name"])))
			local comments = report["stats"]["comments"]
			local code = report["stats"]["code"]
			if language == "Markdown"
				code += comments
				comments = 0
			end
			ALL_FILES[id] = AnaTextFile(ALL_FILES[id].artifact,
				ALL_FILES[id].text,
				report["stats"]["blanks"],
				code,
				comments,
				language)
		end
	end
end


function get_file(path::String)
	path = prepare_path(path)
	id = sani_path(path)
	global ALL_FILES
	if haskey(ALL_FILES, id)
		return id
	end

	ALL_FILES[id] = get_text_file(path)

	id
end
export get_file


STD_LIB_PATH = map(filter(Base.load_path()) do path
	occursin("/julia/stdlib/", path)
end) do path
	replace(path, r"^(.*/julia/stdlib/).*" => s"\1")
end

if length(STD_LIB_PATH) == 0
	STD_LIB_PATH = normpath(joinpath(Sys.BINDIR, "..", "share", "julia", "stdlib"))
else
	STD_LIB_PATH = STD_LIB_PATH[1]
end

STD_LIB_PATH = normpath(joinpath(Sys.BINDIR, "..", "share", "julia", "base"))

"""
Prepare path for analysis by converting cache-paths to proper stdlib paths.

TODO: We also need to handle other relative paths inside modules
"""
function prepare_path(path::String)

	# remove part before .julia/packages
	path = replace(path, r"^.*/julia/stdlib/" => STD_LIB_PATH)
	path
end
export prepare_path
