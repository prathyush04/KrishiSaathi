import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from .helpers import train_test_split_by_config
from ..features.preprocess import build_tabular_preprocessor

def train_crop_model(df: pd.DataFrame, config: dict):
    target = config["crop"]["target"]
    preproc, feats, num_cols, cat_cols = build_tabular_preprocessor(df, target)
    rf = RandomForestClassifier(**config["crop"]["rf_params"])
    pipe = Pipeline(steps=[("prep", preproc), ("clf", rf)])
    X_train, X_test, y_train, y_test = train_test_split_by_config(df, target, config["crop"]["test_size"])
    pipe.fit(X_train, y_train)
    acc = pipe.score(X_test, y_test)
    return pipe, acc