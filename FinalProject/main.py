import os
import subprocess
import sys

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # The steps to run in order:
    steps = [
        ("Data Preprocessing", "preprocessing", "data_cleaning.py"),
        ("Model Training: Linear Regression", "models", "linear_regression.py"),
        ("Model Training: SVM Regression", "models", "svm.py"),
        ("Model Training: Neural Network", "models", "neural_network.py"),
        ("Evaluation & Comparison", "evaluation", "comparison.py")
    ]
    
    print("="*60)
    print("Starting Final Project Execution Pipeline")
    print("="*60)

    for step_name, folder, script in steps:
        print(f"\n[>>>] Running Step: {step_name}")
        script_dir = os.path.join(base_dir, folder)
        script_path = os.path.join(script_dir, script)
        
        if not os.path.exists(script_path):
            print(f"[!] Error: Could not find script at {script_path}")
            sys.exit(1)
            
        try:
            subprocess.run([sys.executable, script], cwd=script_dir, check=True)
            print(f"[OK] {step_name} completed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"[!] Error: Step '{step_name}' failed with return code {e.returncode}.")
            sys.exit(e.returncode)
            
    print("\n" + "="*60)
    print("Pipeline Finished Successfully!")
    print("Results and plots have been generated in the 'data' and 'evaluation/plots' folders.")
    print("="*60)

if __name__ == "__main__":
    main()
