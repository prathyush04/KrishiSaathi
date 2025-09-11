import os, yaml, argparse
import tensorflow as tf
from ..pipelines.disease_pipeline import build_model

def load_config():
    with open("config.yaml","r") as f:
        return yaml.safe_load(f)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=None)
    args = ap.parse_args()

    cfg = load_config()
    base_dir = cfg["disease"]["data_dir"]   # should be "data/raw/plant_disease"
    train_dir = os.path.join(base_dir, "Train")
    val_dir = os.path.join(base_dir, "Validation")

    if not (os.path.exists(train_dir) and os.path.exists(val_dir)):
        raise FileNotFoundError(f"Expected Train/ and Validation/ folders under {base_dir}")

    img_size = tuple(cfg["disease"]["img_size"])
    batch_size = cfg["disease"]["batch_size"]
    seed = cfg["seed"]

    # Load datasets
    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        image_size=img_size,
        batch_size=batch_size,
        seed=seed
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        image_size=img_size,
        batch_size=batch_size,
        seed=seed
    )

    class_names = train_ds.class_names
    print(f"Detected classes: {class_names}")

    # Build and train model
    model = build_model(img_size, num_classes=len(class_names),
                        base_trainable_layers=cfg["disease"]["base_trainable_layers"])

    epochs = args.epochs or cfg["disease"]["epochs"]
    model.fit(train_ds, validation_data=val_ds, epochs=epochs)

    # Save model + labels
    os.makedirs(cfg["models_dir"], exist_ok=True)
    out = os.path.join(cfg["models_dir"], "disease_mobilenetv2.keras")
    model.save(out)

    with open(os.path.join(cfg["models_dir"], "disease_labels.txt"), "w") as f:
        f.write("\n".join(class_names))

    print(f"✅ Saved model to {out}. Classes: {class_names}")

if __name__ == "__main__":
    main()
