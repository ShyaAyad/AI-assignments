import random


MUTATION_RATE = 0.1


def mutate(board, initial_board):
    new_board = [row[:] for row in board]

    for r in range(9):
        if random.random() < MUTATION_RATE:
            # get indices that are NOT fixed
            indices = [c for c in range(9) if initial_board[r][c] == 0]

            if len(indices) >= 2:
                c1, c2 = random.sample(indices, 2)
                new_board[r][c1], new_board[r][c2] = new_board[r][c2], new_board[r][c1]

    return new_board
