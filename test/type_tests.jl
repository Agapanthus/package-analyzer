# TODO: Test the type property extraction 

@testset "Testset 1" begin
    @test 2 == 1+1
    @test 3.5 == 1+2.5
    @test_throws MethodError 1 + "A"
end
