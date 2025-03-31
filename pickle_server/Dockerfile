# Stage 1 - Build
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies into a wheel cache
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip wheel --wheel-dir=/wheels -r requirements.txt

# Stage 2 - Runtime
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# Copy built wheels and install
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/*

# Copy app files
COPY server.py encoder.pkl model.pkl ./

# Run as non-root user
RUN useradd -m appuser
USER appuser

EXPOSE 9080/tcp

ENV FLASK_APP=server.py
CMD ["python", "server.py"]
