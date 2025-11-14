import pandas as pd
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

print("🔄 Loading dataset...")
df = pd.read_csv("data/weatherAUS.csv")

# Drop rows with missing target
df = df.dropna(subset=['RainTomorrow'])

# Fill missing values
df = df.fillna(df.median(numeric_only=True))
df = df.fillna("Unknown")

# Convert target
df['RainTomorrow'] = df['RainTomorrow'].map({'Yes':1, 'No':0})

# Identify features
y = df['RainTomorrow']
X = df.drop(columns=['RainTomorrow'])

# Convert object columns to category
for col in X.select_dtypes(include=['object']).columns:
    X[col] = X[col].astype('category')

print("�� Splitting...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("🔄 Training CatBoost...")
model = CatBoostClassifier(
    iterations=500,
    depth=6,
    learning_rate=0.1,
    loss_function='Logloss',
    verbose=50
)

model.fit(X_train, y_train)

print("🔍 Evaluating...")
preds = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))

print("💾 Saving model...")
model.save_model("models/models/catboost_model.cbm")

print("✅ Training complete! New model saved at: models/models/catboost_model.cbm")

