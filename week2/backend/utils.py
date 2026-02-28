# - Print the initial board and all the steps and the over all cost to a file names solution.txt
# - Feel free to use any library or code to save the solution.txt file ( nicer is better )

def write_solution(result):

    # get steps, cost, and duration from result
    steps = result["solution"]
    cost = result["cost"]
    duration = result.get("duration", None) # return none if there is not duration

    # open file and write into it
    with open("solution.txt", "w") as f:

        f.write("=" * 30 + "\n")
        f.write("        8-PUZZLE SOLUTION\n")
        f.write("=" * 30 + "\n\n")

        f.write("Initial Board:\n")
        f.write("-" * 13 + "\n")

        initial = steps[0] # initial board
        
        # only for priting the board in a good format 
        for row in initial:
            f.write(" ".join(f"{num:2}" for num in row) + "\n")
        f.write("\n")

        # Print each step
        for step_number, board in enumerate(steps[1:], start=1):

            f.write(f"Step {step_number}\n")
            f.write("-" * 13 + "\n")

            for row in board:
                f.write(" ".join(f"{num:2}" for num in row) + "\n")

            f.write("\n")

        f.write("=" * 30 + "\n")
        f.write(f"Total Cost (Depth): {cost}\n")
        f.write(f"Total Steps: {len(steps) - 1}\n")

        if duration is not None:
            f.write(f"Execution Time: {duration:.6f} seconds\n")

        f.write("=" * 30 + "\n")