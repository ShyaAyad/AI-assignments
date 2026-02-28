class PuzzleState:
    def __init__(self, board, parent=None, move=None, depth=0):

        self.board = board  # tuple of length 9 (the puzzle)
        self.parent = parent
        self.move = move  # move that led to this state (up, down, left, right)
        self.depth = depth  # stores how deep we are in search tree

    def is_goal(self):
        # Check if current state is goal state
        return self.board == (1, 2, 3,
                              4, 5, 6,
                              7, 8, 0)


def get_neighbors(state):

    # Generate all possible next moves from a state

    neighbors = []

    index = state.board.index(0)  # position of blank tile
    row = index // 3
    col = index % 3

    moves = {  # define movement directions
        "Up": (-1, 0),
        "Down": (1, 0),
        "Left": (0, -1),
        "Right": (0, 1)
    }

    # loop through all possible moves
    for move_name, (dr, dc) in moves.items():
        # calculate new position after move
        new_row = row + dr
        new_col = col + dc

        # check if move stay inside the board
        if 0 <= new_row < 3 and 0 <= new_col < 3:
            new_index = new_row * 3 + new_col

            # convert tuple to list so we can modify it
            new_board = list(state.board)
            # swap blank with neighbor
            new_board[index], new_board[new_index] = new_board[new_index], new_board[index]

            # create a new PuzzleState
            new_state = PuzzleState(
                board=tuple(new_board),
                parent=state,
                move=move_name,
                depth=state.depth + 1
            )

            # add state to neighbors list
            neighbors.append(new_state)

    return neighbors
