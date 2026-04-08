import tkinter as tk
from table_window import show_dp_table

# import backend functions
def build_dp_table(n: int, r: int) -> list:
    table = [[0] * (r + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        for j in range(r + 1):
            if j == 0:
                table[i][j] = 1
            elif i == 0:
                table[i][j] = 0
            else:
                table[i][j] = i * table[i - 1][j - 1]

    return table


def compute_permutation(n: int, r: int) -> dict:
    table = build_dp_table(n, r)

    return {
        "n": n,
        "r": r,
        "result": table[n][r],
        "table": table,
    }


# GUI
root = tk.Tk()
root.title("Test")

def open_table():
    data = compute_permutation(10, 4)
    show_dp_table(data)

btn = tk.Button(root, text="Show Table", command=open_table)
btn.pack(pady=20)

root.mainloop()