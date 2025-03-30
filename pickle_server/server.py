from flask import Flask, request, jsonify
import pickle
import joblib

app = Flask(__name__)

# Load the encoders (a dict of LabelEncoders)
encoders = joblib.load("encoder.pkl")
model = joblib.load("model.pkl")


# List of expected features
features_required = [
    'NormType', 'EventType', 'host', 'SourceName',
    'SourceIp', 'SourceImage', 'TargetImage', 'Application'
]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    input_features = []

    for feature in features_required:
        # Use the provided value as a string; if missing, use empty string.
        value = str(data.get(feature, ""))
        encoder = encoders.get(feature)
        if encoder is None:
            return jsonify({'error': f'No encoder found for feature: {feature}'}), 400
        try:
            # LabelEncoder expects a list and returns an array; grab the first element.
            encoded_value = encoder.transform([value])[0]
        except Exception as e:
            return jsonify({'error': f'Error encoding feature {feature}: {str(e)}'}), 400
        input_features.append(encoded_value)

    # Build a 2D array for the model's predict method.
    features_array = [input_features]
    prediction = model.predict(features_array)
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
