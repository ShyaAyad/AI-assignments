def build_dp_table(n: int, r: int) -> list:
    table = [[0] * (r + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        for j in range(r + 1):
            if j == 0:
                table[i][j] = 1 # base case there's one way to arrange 0 books so we do nothing
            elif i == 0:
                table[i][j] = 0 # base case cannot arrange anything if we have no books
            else:
                table[i][j] = i * table[i - 1][j - 1]

    return table


def compute_permutation(n: int, r: int) -> dict:
    table = build_dp_table(n, r)

    # sending back the result and the table for frontend to display
    return {
        "n"     : n,
        "r"     : r,
        "result": table[n][r],
        "table" : table,
    }
