module analyzer

using JSON3, JSON, DataFrames, PackageAnalyzer, Pkg

include("./ana/file.jl")
include("./ana/type.jl")
include("./ana/function.jl")
include("./ana/module.jl")

function run_analysis_cli()
	package_to_analyze = "DataFrames"
	for x in ARGS
		global package_to_analyze = x
	end
	run_analysis(package_to_analyze)
end

function run_analysis(package_to_analyze::String)
	println("Analyzing package: $package_to_analyze")

	measured = @timed begin
		println("Installing package...")

		Pkg.add(package_to_analyze)
		package_to_analyze_sym = Symbol(package_to_analyze)

		println("Loading package...")

		package_to_analyze_mod = @eval begin
			using $package_to_analyze_sym: $package_to_analyze_sym
			$package_to_analyze_sym
		end

		println("Listing files...")

		reset_file_list(pkgdir(package_to_analyze_mod))

		println("Listing modules...")

		m = get_module(package_to_analyze_mod, false)

		println("Writing results...")

		open("res.json", "w") do f
			JSON3.write(f, Dict([
				"modules" => ALL_MODULES,
				"functions" => ALL_FUNCTIONS,
				"types" => ALL_TYPES,
				"files" => ALL_FILES,
			]))
		end
	end
	println("Analysis done!")
	println("Time: $(measured[2])")

end

export run_analysis
export run_analysis_cli

#result = analyze(pkgdir(Trixi));
#result


end
