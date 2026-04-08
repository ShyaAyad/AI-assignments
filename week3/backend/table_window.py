import tkinter as tk


def show_dp_table(data):
    # data coming from backend
    table = data["table"]
    n = data["n"]
    r = data["r"]

    # create new window
    window = tk.Toplevel()
    window.title("DP Permutation Table")

    # loop through table and show values
    for i in range(len(table)):
        for j in range(len(table[0])):

            value = table[i][j]

            label = tk.Label(
                window,
                text=str(value),
                width=6,
                height=2,
                borderwidth=1,
                relief="solid"
            )

            # 🔥 highlight final answer
            if i == n and j == r:
                label.config(bg="yellow")

            label.grid(row=i, column=j)