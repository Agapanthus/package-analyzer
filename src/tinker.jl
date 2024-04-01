using JSON3, JSON, DataFrames
using PackageAnalyzer
using Pkg
Pkg.update()

package_to_analyze = "DataFrames"
package_to_analyze_sym = Symbol(package_to_analyze)
package_to_analyze_mod = @eval begin
	using $package_to_analyze_sym: $package_to_analyze_sym
	$package_to_analyze_sym
end

begin
	include("./ana/file.jl")
	include("./ana/type.jl")
	include("./ana/function.jl")
	include("./ana/module.jl")

	reset_file_list(pkgdir(package_to_analyze_mod))
	m = get_module(package_to_analyze_mod, false)

	open("res.json", "w") do f
		JSON3.write(f, Dict([
			"modules" => ALL_MODULES,
			"functions" => ALL_FUNCTIONS,
			"types" => ALL_TYPES,
			"files" => ALL_FILES,
		]))
	end
end
