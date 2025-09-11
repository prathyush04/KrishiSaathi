import argparse, os, yaml, pandas as pd, numpy as np
from joblib import dump
from ..pipelines.crop_pipeline import train_crop_model

def load_config():
    with open("config.yaml","r") as f:
        return yaml.safe_load(f)

def make_synthetic(n=500):
    rng = np.random.default_rng(42)
    df = pd.DataFrame({
        "N": rng.integers(0,140,n),
        "P": rng.integers(0,140,n),
        "K": rng.integers(0,200,n),
        "temperature": rng.normal(25,6,n).round(2),
        "humidity": rng.uniform(20,95,n).round(2),
        "ph": rng.uniform(4.0,8.5,n).round(2),
        "rainfall": rng.uniform(10,300,n).round(2),
    })
    # simple rule: high NPK + good moisture -> 'rice' else 'wheat'/'maize'
    labels = np.where((df["N"]>80)&(df["P"]>60)&(df["K"]>60)&(df["rainfall"]>150), "rice",
             np.where(df["temperature"]<22, "wheat", "maize"))
    df["label"] = labels
    return df

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--synthetic", action="store_true", help="use synthetic data")
    args = ap.parse_args()
    cfg = load_config()
    if args.synthetic:
        df = make_synthetic()
    else:
        csv = cfg["crop"]["csv_path"]
        if not os.path.exists(csv):
            raise FileNotFoundError(f"Expected CSV at {csv}. Use --synthetic to test.")
        df = pd.read_csv(csv)
    pipe, acc = train_crop_model(df, cfg)
    os.makedirs(cfg["models_dir"], exist_ok=True)
    out = os.path.join(cfg["models_dir"], "crop_rf.joblib")
    dump(pipe, out)
    print(f"Crop model saved to {out}. Test accuracy ~ {acc:.3f}")

if __name__ == "__main__":
    main()