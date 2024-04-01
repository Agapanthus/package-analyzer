using analyzer
using Test
using TestReports

@testset "Extraction tests" begin
    @testset "File tests" begin
        include("file_tests.jl")
    end

    @testset "Type tests" begin
        include("type_tests.jl")
    end
end
