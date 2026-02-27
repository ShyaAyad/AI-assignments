def write_solution(result):

    with open("solution.txt", "w") as f:

        f.write("Solution Steps\n\n")

        for i, step in enumerate(result["steps"]):
            f.write(f"Step {i}:\n")

            board = step

            for row in range(0, 9, 3):
                f.write(f"{board[row:row+3]}\n")

            f.write("\n")

        f.write(f"Total Cost: {result['cost']}\n")