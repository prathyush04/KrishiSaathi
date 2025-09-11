import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

def train_test_split_by_config(df: pd.DataFrame, target: str, test_size: float):
    X = df.drop(columns=[target])
    y = df[target]
    return train_test_split(X, y, test_size=test_size, random_state=42, stratify=y if y.nunique() > 1 else None)