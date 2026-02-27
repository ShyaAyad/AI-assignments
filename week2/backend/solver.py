from models import PuzzleState, get_neighbors


def reconstruct_path(state):

    # Reconstruct solution path from goal state

    path = []

    # follow parent pointers backwards
    while state:
        path.append(state)
        state = state.parent

    path.reverse()

    cost = len(path) - 1
    return path, cost


def dfs(initial_board, depth_limit=30):

    # Depth First Search algorithm

    start_state = PuzzleState(initial_board)  # create first state

    stack = [start_state]
    visited = set()  # store visited boards to avoid loops

    while stack:
        current_state = stack.pop()

        if current_state.board in visited:
            continue

        visited.add(current_state.board)

        if current_state.is_goal():  # check if goal is found
            return reconstruct_path(current_state)  # buld solution and return

        if current_state.depth < depth_limit:
            neighbors = get_neighbors(current_state)  # generate next states

            # DFS → stack (LIFO)
            stack.extend(neighbors)  # add neighbors to stack

    return None, 0  # if no solution found, return failure
