from models import PuzzleState, get_neighbors

def reconstruct_path(state):
    """Reconstruct solution path from goal state"""
    path = []
    while state:
        path.append(state)
        state = state.parent
    path.reverse()
    cost = len(path) - 1
    return path, cost

def dfs(initial_board, depth_limit):
    """Depth First Search algorithm"""
    start_state = PuzzleState(initial_board)
    stack = [start_state]
    visited = set()

    while stack:
        current_state = stack.pop()
        
        # If already visited, skip
        if current_state.board in visited:
            continue
        
        visited.add(current_state.board)

        # Goal check
        if current_state.is_goal():
            return reconstruct_path(current_state)

        # Explore neighbors only if within the depth limit
        if current_state.depth < depth_limit:
            neighbors = get_neighbors(current_state)
            stack.extend(neighbors)

    return None, 0