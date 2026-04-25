import random

def crossover(p1, p2, rate=0.8):
    if random.random() > rate:
        return [row[:] for row in p1]
        
    cp = random.randint(1, 8)
    child = p1[:cp] + p2[cp:]
    return [row[:] for row in child]

def fill_row(row):
    missing = [n for n in range(1, 10) if n not in row]
    random.shuffle(missing)
    
    m_iter = iter(missing)
    return [n if n != 0 else next(m_iter) for n in row]