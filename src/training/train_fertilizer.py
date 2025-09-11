import argparse, os, yaml, pandas as pd, numpy as np
from joblib import dump
from ..pipelines.fert_pipeline import train_fert_model

def load_config():
    with open("config.yaml","r") as f:
        return yaml.safe_load(f)

def make_synthetic(n=600):
    rng = np.random.default_rng(123)
    soil_types = ["Sandy","Loamy","Clayey","Black","Red"]
    crop_types = ["rice","wheat","maize","sugarcane","cotton"]
    df = pd.DataFrame({
        "temperature": rng.normal(26,5,n).round(2),
        "humidity": rng.uniform(20,95,n).round(2),
        "moisture": rng.uniform(10,50,n).round(2),
        "soil_type": rng.choice(soil_types, n),
        "crop_type": rng.choice(crop_types, n),
        "N": rng.integers(0,140,n),
        "P": rng.integers(0,140,n),
        "K": rng.integers(0,200,n),
    })
    fert = []
    for _, r in df.iterrows():
        if r["N"] < 30: fert.append("Urea")
        elif r["P"] < 30: fert.append("DAP")
        elif r["K"] < 30: fert.append("MOP")
        else:
            fert.append("NPK 19-19-19")
    df["fertilizer"] = fert
    return df

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--synthetic", action="store_true")
    args = ap.parse_args()
    cfg = load_config()
    if args.synthetic:
        df = make_synthetic()
    else:
        csv = cfg["fertilizer"]["csv_path"]
        if not os.path.exists(csv):
            raise FileNotFoundError(f"Expected CSV at {csv}. Use --synthetic to test.")
        df = pd.read_csv(csv)
    pipe, acc = train_fert_model(df, cfg)
    os.makedirs(cfg["models_dir"], exist_ok=True)
    out = os.path.join(cfg["models_dir"], "fert_rf.joblib")
    dump(pipe, out)
    print(f"Fertilizer model saved to {out}. Test accuracy ~ {acc:.3f}")

if __name__ == "__main__":
    main()