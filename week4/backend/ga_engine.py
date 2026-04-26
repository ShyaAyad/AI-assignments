import random
from crossover import crossover, fill_row
from fitness import evaluate_fitness
from mutation import mutate

POP_SIZE = 100
GENERATIONS = 500
ELITE_SIZE = 5


# Initial Population
def create_individual(initial_board):
    individual = []
    for row in initial_board:
        individual.append(fill_row(row))
    return individual


def initialize_population(initial_board):
    return [create_individual(initial_board) for _ in range(POP_SIZE)]


# Selection (Tournament)
def tournament_selection(population, k=3):
    selected = random.sample(population, k)
    selected.sort(key=lambda x: evaluate_fitness(x), reverse=True)
    return selected[0]


# GA Engine
def genetic_algorithm(initial_board):
    population = initialize_population(initial_board)

    best_solutions_per_gen = []
    seen = set()

    for gen in range(GENERATIONS):
        population.sort(key=lambda x: evaluate_fitness(x), reverse=True)

        best = population[0]
        best_score = evaluate_fitness(best)

        board_key = board_to_tuple(best)

        # store only UNIQUE boards
        if board_key not in seen:
            seen.add(board_key)
            best_solutions_per_gen.append((best, best_score, gen))

        print(f"Generation {gen} | Best Fitness: {best_score}")

        if best_score == 243:
            break

        new_population = [[row[:] for row in ind]
                          for ind in population[:ELITE_SIZE]]

        while len(new_population) < POP_SIZE:
            p1 = tournament_selection(population)
            p2 = tournament_selection(population)

            child = crossover(p1, p2)
            child = mutate(child, initial_board)

            new_population.append(child)

        population = new_population

    return [
        {
            "generation": gen,
            "fitness": score,
            "board": best
        }
        for (best, score, gen) in best_solutions_per_gen
    ]


def board_to_tuple(board):
    return tuple(tuple(row) for row in board)