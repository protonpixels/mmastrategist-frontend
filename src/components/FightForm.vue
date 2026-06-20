<template>
  <div class="fight-form">
    <div class="header">
      <h1>🥊 MMA Strategy Builder</h1>
      <h3>What chance do you have to win your fight?</h3>
    </div>

    <!-- Input Form -->
    <form @submit.prevent="predictWinProbability" class="predictor-form">
      <div class="form-grid">
        <!-- Physical Attributes -->
        <div class="form-section">
          <h3>📏 Physical Attributes</h3>
          <div class="form-group">
            <label>Height (cm)</label>
            <input
              type="number"
              v-model="form.height_cm"
              required
              step="0.1"
              min="140"
              max="220"
            />
          </div>
          <div class="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              v-model="form.weight_in_kg"
              required
              step="0.1"
              min="50"
              max="150"
            />
          </div>
          <div class="form-group">
            <label>Stance</label>
            <select v-model="form.stance" required>
              <option value="Orthodox">Orthodox</option>
              <option value="Southpaw">Southpaw</option>
              <option value="Switch">Switch</option>
              <option value="Switch">Sideways</option>
            </select>
          </div>
        </div>

        <!-- Striking Metrics -->
        <div class="form-section">
          <h3>💥 Striking</h3>
          <div class="form-group">
            <label>Strikes Landed / Minute</label>
            <input
              type="number"
              v-model="form.significant_strikes_landed_per_minute"
              required
              step="0.1"
              min="0"
              max="15"
            />
          </div>
          <div class="form-group">
            <label>Striking Accuracy (%)</label>
            <input
              type="number"
              v-model="form.significant_striking_accuracy"
              required
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div class="form-group">
            <label>Strikes Absorbed / Minute</label>
            <input
              type="number"
              v-model="form.significant_strikes_absorbed_per_minute"
              required
              step="0.1"
              min="0"
              max="10"
            />
          </div>
          <div class="form-group">
            <label>Strike Defence (%)</label>
            <input
              type="number"
              v-model="form.significant_strike_defence"
              required
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>

        <!-- Wrestling & Grappling -->
        <div class="form-section">
          <h3>🤼 Wrestling &amp; Grappling</h3>
          <div class="form-group">
            <label>Takedowns / 15 Minutes</label>
            <input
              type="number"
              v-model="form.average_takedowns_landed_per_15_minutes"
              required
              step="0.1"
              min="0"
              max="10"
            />
          </div>
          <div class="form-group">
            <label>Takedown Accuracy (%)</label>
            <input
              type="number"
              v-model="form.takedown_accuracy"
              required
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div class="form-group">
            <label>Takedown Defense (%)</label>
            <input
              type="number"
              v-model="form.takedown_defense"
              required
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div class="form-group">
            <label>Submissions Attempted / 15 Min</label>
            <input
              type="number"
              v-model="form.average_submissions_attempted_per_15_minutes"
              required
              step="0.1"
              min="0"
              max="10"
            />
          </div>
        </div>
      </div>

      <button type="submit" :disabled="loading" class="predict-button">
        {{ loading ? "🔮 Analyzing..." : "🎯 Analyze Fight" }}
      </button>
    </form>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Analyzing your fighting profile...</p>
    </div>

    <!-- Results -->
    <div
      v-if="result"
      class="results-card"
      :style="{ borderLeftColor: result.color }"
    >
      <h2>📊 Your Predicted Losing Probability</h2>

      <!-- Win Probability Gauge -->
      <div class="probability-gauge">
        <div class="gauge-value" :style="{ color: result.color }">
          <span>Your chance of losing is </span>
          {{ result.lose_probability }}%
        </div>
        <div class="gauge-bar">
          <div
            class="gauge-fill"
            :style="{
              width: result.lose_probability + '%',
              background: result.color,
            }"
          ></div>
        </div>
      </div>

      <!-- Tier -->
      <div class="tier" :class="result.tier.toLowerCase()">
        {{ result.tier }} Fighter
      </div>

      <!-- <div class="fight-duration">
        <label>How long do you plan for this fight to last in seconds?</label>
        <input
          type="number"
          step="1"
          min="10"
          max="2000"
          v-model="fightduration"
          placeholder="0"
        />
      </div> -->
      <!-- Recommendation -->
      <div class="recommendation">
        <strong>💡 Fight Strategy:</strong>
        <p>
          With a height of {{ form.height_cm }}cm and a weight of
          {{ form.weight_in_kg }}kg, you need to land
          {{ form.significant_strikes_landed_per_minute }} strike per minute
          with {{ form.significant_striking_accuracy }}% of your total strikes
          landing. At the same time you need to avoid
          {{ form.significant_strike_defence }}% of their opponent strikes and
          be able to absorb
          {{ form.significant_strikes_absorbed_per_minute }} strikes per minute.
          You must also land
          {{ form.average_takedowns_landed_per_15_minutes }} takedowns per 15
          minutes with {{ form.takedown_accuracy }}% of your takedown attempts
          succeeding and don't forget to stop {{ form.takedown_defense }}% of
          opponents takedown attempts. Attempt
          {{ form.average_submissions_attempted_per_15_minutes }} submssions per
          15 minutes. When you do all of that, your chance of losing the fight
          will be around {{ result.lose_probability }}%
        </p>
      </div>

      <!-- Metrics Breakdown -->
      <div class="metrics-breakdown">
        <h4>📊 Detailed Analysis</h4>
        <div
          v-for="metric in result.metrics_breakdown"
          :key="metric.metric"
          class="metric-row"
          :class="metric.status"
        >
          <span class="metric-name">{{ metric.metric }}</span>
          <span class="metric-status">{{
            metric.status.replace("_", " ")
          }}</span>
          <span class="metric-message">{{ metric.message }}</span>
        </div>
      </div>

      <!-- Input Summary -->
      <details class="input-summary">
        <summary>View All Input Metrics</summary>
        <div class="metrics-grid">
          <div
            v-for="(value, key) in result.metrics"
            :key="key"
            class="metric-item"
          >
            <span>{{ formatMetricName(key) }}:</span>
            <strong>{{ value }}</strong>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UFCPredictor",
  data() {
    return {
      form: {
        height_cm: 180,
        weight_in_kg: 77,
        reach_in_cm: 185,
        stance: "Orthodox",
        significant_strikes_landed_per_minute: 4.5,
        significant_striking_accuracy: 55,
        significant_strikes_absorbed_per_minute: 3.0,
        significant_strike_defence: 60,
        average_takedowns_landed_per_15_minutes: 2.5,
        takedown_accuracy: 50,
        takedown_defense: 70,
        average_submissions_attempted_per_15_minutes: 1.0,
      },
      loading: false,
      result: null,
      fightduration: 60,
    };
  },
  methods: {
    async predictWinProbability() {
      this.loading = true;
      this.result = null;

      try {
        const response = await axios.post("/api/ufc/predict", this.form);
        this.result = response.data;
        console.log(result);
      } catch (error) {
        console.error("Error predicting:", error);
        alert("Error calculating prediction. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    analyzeStrategy() {},

    formatMetricName(key) {
      return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    },
  },
};
</script>

<style lang="scss" scoped>
.ufc-predictor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.flasher {
  width: 60px;
  height: 60px;
  animation-name: flasher !important;
}

@keyframes flasher {
  0% {
    background-color: red;
  }
  33% {
    background-color: black;
  }
  66% {
    background-color: red;
  }
  100% {
    background-color: black;
  }
}

.header {
  text-align: center;
  margin-bottom: 32px;
  border-radius: 80px;
  box-shadow: 0 0 30px 1px #000;

  h1 {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  p {
    color: #666;
  }
}

.predictor-form {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 10px 20px 1px #0000004e;

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
  }

  .form-section {
    h3 {
      margin-bottom: 16px;
      color: #333;
      font-size: 1rem;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;

    label {
      font-weight: 600;
      font-size: 0.875rem;
      color: #202124;
    }

    input,
    select {
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.9rem;

      &:focus {
        outline: none;
        border-color: #e74c3c;
      }
    }
  }

  .predict-button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
    margin-top: 16px;

    &:hover {
      transform: translateY(-2px);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.loading {
  text-align: center;
  padding: 40px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top-color: #e74c3c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.results-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 6px solid #e74c3c;

  h2 {
    text-align: center;
    margin-bottom: 24px;
  }
}

.fight-duration {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;

  label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #202124;
  }

  input {
    padding: 10px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
    width: 4rem;

    &:focus {
      outline: none;
      border-color: #e74c3c;
    }
  }
}

.probability-gauge {
  text-align: center;
  margin-bottom: 24px;

  .gauge-value {
    font-size: 3.5rem;
    font-weight: bold;
    margin-bottom: 12px;

    span {
      font-size: 1.5rem;
      color: #202124;
    }
  }

  .gauge-bar {
    height: 16px;
    background: #e0e0e0;
    border-radius: 8px;
    overflow: hidden;

    .gauge-fill {
      height: 100%;
      transition: width 1s ease;
      border-radius: 8px;
    }
  }
}

.tier {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;

  &.elite {
    background: #2ecc7120;
    color: #27ae60;
  }
  &.competitive {
    background: #f39c1220;
    color: #e67e22;
  }
  &.developing {
    background: #3498db20;
    color: #2980b9;
  }
  &.beginner {
    background: #e74c3c20;
    color: #c0392b;
  }
}

.recommendation {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  p {
    margin-top: 8px;
    line-height: 1.5;
    font-size: 1.2rem;
  }
}

.metrics-breakdown {
  margin: 20px 0;

  h4 {
    margin-bottom: 12px;
  }

  .metric-row {
    display: grid;
    grid-template-columns: 160px 100px 1fr;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    margin-bottom: 4px;
    font-size: 0.875rem;
    align-items: center;

    .metric-name {
      font-weight: 600;
    }
    .metric-status {
      text-transform: capitalize;
    }
    .metric-message {
      color: #555;
    }

    &.elite {
      background: #2ecc7120;
      .metric-status {
        color: #27ae60;
        font-weight: 600;
      }
    }
    &.good {
      background: #3498db20;
      .metric-status {
        color: #2980b9;
        font-weight: 600;
      }
    }
    &.needs_work {
      background: #e74c3c20;
      .metric-status {
        color: #c0392b;
        font-weight: 600;
      }
    }
  }
}

.input-summary {
  margin-top: 16px;
  cursor: pointer;

  summary {
    font-weight: 600;
    color: #666;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    margin-top: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .metric-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;

      span {
        color: #666;
      }
      strong {
        color: #202124;
      }
    }
  }
}
</style>
