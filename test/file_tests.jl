# TODO: Test the file property extraction 

@testset "Testset 1" begin
    @test 2 == 1+1
    @test 3.5 == 1+2.5
    @test_throws MethodError 1 + "A"
end

@testset "Testset 2" begin
    #@test_throws MethodError type_multiply(1, 2.5)
end