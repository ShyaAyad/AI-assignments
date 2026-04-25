def evaluate_fitness(board):
    score = 0

    for r in range(9):
        score += len(set(board[r]))

    for c in range(9):
        score += len({board[r][c] for r in range(9)})

    for r in (0, 3, 6):
        for c in (0, 3, 6):
            score += len({board[r + i][c + j]
                         for i in range(3) for j in range(3)})

    return score
