<template>
  <div class="comprehensive-scout">
    <div class="header">
      <h1>⚽ Comprehensive Player Scouting</h1>
      <p>Combined analysis of international potential &amp; market value</p>
    </div>

    <!-- Scouting Form -->
    <form @submit.prevent="scoutPlayer" class="scout-form">
      <div class="form-grid">
        <div class="form-group">
          <label>📏 Height (cm)</label>
          <input
            type="number"
            v-model="form.height"
            required
            min="140"
            max="220"
            step="1"
          />
        </div>

        <div class="form-group">
          <label>🎂 Age</label>
          <input
            type="number"
            v-model="form.age"
            required
            min="16"
            max="40"
            step="1"
          />
        </div>

        <div class="form-group">
          <label>📍 Position</label>
          <select v-model="form.position" required>
            <option v-for="pos in positions" :key="pos" :value="pos">
              {{ pos }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>🦶 Foot</label>
          <select v-model="form.foot" required>
            <option v-for="foot in footOptions" :key="foot" :value="foot">
              {{ foot }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>🏆 League</label>
          <select v-model="form.league" required>
            <option v-for="league in leagues" :key="league" :value="league">
              {{ league }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>🌍 Current Caps (optional)</label>
          <input
            type="number"
            v-model="form.international_caps"
            min="0"
            step="1"
          />
        </div>
      </div>

      <button type="submit" :disabled="loading" class="scout-button">
        {{ loading ? "🔍 Analyzing..." : "🚀 Generate Scouting Report" }}
      </button>
    </form>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Analyzing player profile with dual AI models...</p>
    </div>

    <!-- Comprehensive Results -->
    <div v-if="result" class="results-container">
      <!-- Player Profile Summary -->
      <div class="profile-card">
        <h3>📋 Player Profile</h3>
        <div class="profile-grid">
          <div class="profile-item">
            <span class="label">Height:</span>
            <span class="value">{{ result.player_profile.height_cm }} cm</span>
          </div>
          <div class="profile-item">
            <span class="label">Age:</span>
            <span class="value">{{ result.player_profile.age }} years</span>
          </div>
          <div class="profile-item">
            <span class="label">Position:</span>
            <span class="value">{{ result.player_profile.position }}</span>
          </div>
          <div class="profile-item">
            <span class="label">Foot:</span>
            <span class="value">{{ result.player_profile.foot }}-footed</span>
          </div>
          <div class="profile-item">
            <span class="label">League:</span>
            <span class="value">{{ result.player_profile.league }}</span>
          </div>
        </div>
      </div>

      <!-- Two-Column Layout for Metrics -->
      <div class="metrics-two-column">
        <!-- International Potential Card -->
        <div class="metric-card caps-card">
          <h3>🌍 International Potential</h3>
          <div class="caps-prediction">
            <span class="caps-number">{{
              result.international_potential.predicted_caps
            }}</span>
            <span class="caps-label">expected caps</span>
          </div>
          <div class="percentile-bar">
            <div
              class="percentile-fill"
              :style="{
                width: result.international_potential.percentile + '%',
                background: getCapsColor(
                  result.international_potential.percentile,
                ),
              }"
            ></div>
          </div>
          <div class="percentile-text">
            <strong>{{ result.international_potential.ranking_text }}</strong>
            <span
              >({{ result.international_potential.percentile }}th
              percentile)</span
            >
          </div>
          <div
            class="tier-badge"
            :class="getCapsClass(result.international_potential.percentile)"
          >
            {{ result.international_potential.tier }}
          </div>
          <p class="tier-desc">
            {{ result.international_potential.tier_description }}
          </p>
        </div>

        <!-- Market Value Card -->
        <div class="metric-card value-card">
          <h3>💰 Market Value</h3>
          <div class="value-prediction">
            <span class="value-number">{{
              formatCurrency(result.market_value.predicted_value)
            }}</span>
          </div>
          <div class="value-tier">
            <span class="value-icon">{{ result.market_value.value_icon }}</span>
            <span class="value-tier-text">{{
              result.market_value.value_tier
            }}</span>
          </div>
          <div class="value-breakdown">
            <div class="breakdown-item">
              <span>Transfer fee range:</span>
              <strong
                >{{ formatCurrency(result.market_value.predicted_value * 0.8) }}
                -
                {{
                  formatCurrency(result.market_value.predicted_value * 1.2)
                }}</strong
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Combined Score Card -->
      <div
        class="combined-score-card"
        :style="{
          background: result.combined_score.color + '20',
          borderLeftColor: result.combined_score.color,
        }"
      >
        <div class="score-header">
          <h3>📊 Combined Scouting Score</h3>
          <div class="score-value">{{ result.combined_score.score }}/100</div>
        </div>
        <div class="score-bar">
          <div
            class="score-fill"
            :style="{
              width: result.combined_score.score + '%',
              background: result.combined_score.color,
            }"
          ></div>
        </div>
        <div class="score-breakdown">
          <div class="breakdown">
            <span>International Potential:</span>
            <strong
              >{{
                result.combined_score.caps_contribution.toFixed(1)
              }}
              pts</strong
            >
          </div>
          <div class="breakdown">
            <span>Market Value:</span>
            <strong
              >{{
                result.combined_score.value_contribution.toFixed(1)
              }}
              pts</strong
            >
          </div>
        </div>
        <div class="score-tier">
          {{ result.combined_score.tier }}
        </div>
      </div>

      <!-- Recommendation -->
      <div class="recommendation-card">
        <h3>💡 Scout Recommendation</h3>
        <p>{{ result.recommendation }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="exportReport" class="btn-export">
          📄 Export Report
        </button>
        <button @click="resetForm" class="btn-reset">🔄 New Search</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ComprehensiveScout",
  data() {
    return {
      form: {
        height: 185,
        age: 24,
        position: "Attack",
        foot: "right",
        league: "British League",
        international_caps: 0,
      },
      positions: [],
      footOptions: [],
      leagues: [],
      loading: false,
      result: null,
    };
  },
  async mounted() {
    await this.loadOptions();
  },
  methods: {
    async loadOptions() {
      try {
        const [positionsRes, footRes, leaguesRes] = await Promise.all([
          axios.get("https://altablastar-backend.onrender.com/api/positions"),
          axios.get(
            "https://altablastar-backend.onrender.com/api/foot_options",
          ),
          axios.get("https://altablastar-backend.onrender.com/api/leagues"),
        ]);
        this.positions = positionsRes.data;
        this.footOptions = footRes.data;
        this.leagues = leaguesRes.data;
      } catch (error) {
        console.error("Error loading options:", error);
      }
    },

    async scoutPlayer() {
      this.loading = true;
      this.result = null;

      try {
        const response = await axios.post(
          "/api/scout/comprehensive",
          this.form,
        );
        this.result = response.data;
      } catch (error) {
        console.error("Error scouting player:", error);
        alert("Error generating scouting report. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(value) {
      if (value >= 1_000_000) {
        return `€${(value / 1_000_000).toFixed(1)}M`;
      }
      return `€${value.toLocaleString()}`;
    },

    getCapsColor(percentile) {
      if (percentile >= 85) return "linear-gradient(90deg, #FFD700, #FFA500)";
      if (percentile >= 70) return "linear-gradient(90deg, #9B59B6, #8E44AD)";
      if (percentile >= 50) return "linear-gradient(90deg, #3498DB, #2980B9)";
      if (percentile >= 25) return "linear-gradient(90deg, #2ECC71, #27AE60)";
      return "linear-gradient(90deg, #F39C12, #E67E22)";
    },

    getCapsClass(percentile) {
      if (percentile >= 85) return "elite";
      if (percentile >= 70) return "star";
      if (percentile >= 50) return "solid";
      return "developing";
    },

    exportReport() {
      const report = {
        player: this.result.player_profile,
        international_potential: this.result.international_potential,
        market_value: this.result.market_value,
        combined_score: this.result.combined_score,
        recommendation: this.result.recommendation,
        generated_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scouting_report_${this.form.position}_${this.form.age}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    resetForm() {
      this.form = {
        height: 185,
        age: 24,
        position: "Attack",
        foot: "right",
        league: "British League",
        international_caps: 0,
      };
      this.result = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.comprehensive-scout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 2rem;
    color: #202124;
    margin-bottom: 8px;
  }

  p {
    color: #666;
  }
}

.scout-form {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-weight: 600;
      color: #202124;
      font-size: 0.875rem;
    }

    input,
    select {
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s;

      &:focus {
        outline: none;
        border-color: #1a73e8;
      }
    }
  }

  .scout-button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;

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
    border-top-color: #667eea;
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

.results-container {
  animation: fadeIn 0.5s ease-out;
}

.profile-card,
.recommendation-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 16px;
    color: #202124;
  }
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;

  .profile-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;

    .label {
      font-weight: 600;
      color: #666;
    }

    .value {
      color: #202124;
    }
  }
}

.metrics-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h3 {
      margin-bottom: 16px;
      text-align: center;
    }
  }
}

.caps-prediction,
.value-prediction {
  text-align: center;
  margin-bottom: 16px;

  .caps-number,
  .value-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1a73e8;
  }

  .caps-label {
    font-size: 1rem;
    color: #666;
  }
}

.percentile-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;

  .percentile-fill {
    height: 100%;
    transition: width 1s ease;
  }
}

.percentile-text {
  text-align: center;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.tier-badge {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-weight: 600;

  &.elite {
    background: #ffd70020;
    color: #daa520;
  }

  &.star {
    background: #9b59b620;
    color: #9b59b6;
  }

  &.solid {
    background: #3498db20;
    color: #3498db;
  }

  &.developing {
    background: #f39c1220;
    color: #e67e22;
  }
}

.tier-desc {
  text-align: center;
  font-size: 0.8rem;
  color: #666;
}

.value-tier {
  text-align: center;
  margin-bottom: 16px;

  .value-icon {
    font-size: 2rem;
    margin-right: 8px;
  }

  .value-tier-text {
    font-size: 1rem;
    font-weight: 600;
  }
}

.value-breakdown {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }
}

.combined-score-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .score-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .score-value {
      font-size: 2rem;
      font-weight: bold;
    }
  }

  .score-bar {
    height: 12px;
    background: #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 16px;

    .score-fill {
      height: 100%;
      transition: width 1s ease;
    }
  }

  .score-breakdown {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 0.875rem;
  }

  .score-tier {
    text-align: center;
    font-weight: 600;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 8px;
  }
}

.recommendation-card {
  p {
    line-height: 1.6;
    color: #202124;
  }
}

.action-buttons {
  display: flex;
  gap: 16px;

  button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &.btn-export {
      background: #28a745;
      color: white;

      &:hover {
        background: #218838;
      }
    }

    &.btn-reset {
      background: #6c757d;
      color: white;

      &:hover {
        background: #5a6268;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .metrics-two-column {
    grid-template-columns: 1fr;
  }
}
</style>
