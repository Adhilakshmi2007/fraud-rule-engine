import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [flags, setFlags] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchFlags = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/fraud-flags"
      );

      const data = await response.json();
      setFlags(data);
    } catch (error) {
      console.error("Error fetching fraud flags:", error);
    }
  };

  useEffect(() => {
    fetchFlags();

    const interval = setInterval(fetchFlags, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (flagId, status) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/fraud-flags/${flagId}?status=${status}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        fetchFlags();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const highCount = flags.filter(
    (flag) => flag.risk_level === "HIGH"
  ).length;

  const mediumCount = flags.filter(
    (flag) => flag.risk_level === "MEDIUM"
  ).length;

  const lowCount = flags.filter(
    (flag) => flag.risk_level === "LOW"
  ).length;

  const pendingCount = flags.filter(
    (flag) => flag.status === "PENDING"
  ).length;

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesSearch =
        flag.user_id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        String(flag.transaction_id).includes(search);

      const matchesFilter =
        filter === "ALL" ||
        flag.risk_level === filter ||
        flag.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [flags, search, filter]);

  const totalRisk = highCount + mediumCount + lowCount;

  const highPercent =
    totalRisk === 0 ? 0 : (highCount / totalRisk) * 100;

  const mediumPercent =
    totalRisk === 0 ? 0 : (mediumCount / totalRisk) * 100;

  const lowPercent =
    totalRisk === 0 ? 0 : (lowCount / totalRisk) * 100;

  const maxCount = Math.max(
    highCount,
    mediumCount,
    lowCount,
    1
  );

  return (
    <div className="dashboard">

      {/* Animated background */}
      <div className="particles">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i}></span>
        ))}
      </div>

      {/* HEADER */}
      <header className="topbar">

        <div className="brand">

          <div className="shield">
            🛡️
          </div>

          <div>
            <h1>FRAUDGUARD</h1>
            <p>Transaction Risk Monitoring System</p>
          </div>

        </div>

        <div className="system-status">
          <span></span>
          SYSTEM ONLINE
        </div>

      </header>


      <main>

        {/* SUMMARY */}
        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div>
              <p>TOTAL FLAGS</p>
              <h2>{flags.length}</h2>
            </div>
          </div>

          <div className="stat-card danger">
            <div className="stat-icon">🚨</div>
            <div>
              <p>HIGH RISK</p>
              <h2>{highCount}</h2>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">⚠</div>
            <div>
              <p>MEDIUM RISK</p>
              <h2>{mediumCount}</h2>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">◉</div>
            <div>
              <p>PENDING REVIEW</p>
              <h2>{pendingCount}</h2>
            </div>
          </div>

        </section>


        {/* ANALYTICS */}
        <section className="analytics">

          {/* DONUT */}
          <div className="panel">

            <div className="panel-title">
              <div>
                <h3>Risk Distribution</h3>
                <p>Current fraud risk levels</p>
              </div>

              <span className="live-dot">LIVE</span>
            </div>

            <div className="donut-area">

              <div
                className="donut"
                style={{
                  background: `conic-gradient(
                    #ff3b6b 0 ${highPercent}%,
                    #ffae42 ${highPercent}% ${highPercent + mediumPercent}%,
                    #36e58c ${highPercent + mediumPercent}% 100%
                  )`
                }}
              >
                <div className="donut-inner">
                  <strong>{flags.length}</strong>
                  <span>FLAGS</span>
                </div>
              </div>

              <div className="legend">

                <div>
                  <span className="legend-dot high"></span>
                  HIGH
                  <strong>{highCount}</strong>
                </div>

                <div>
                  <span className="legend-dot medium"></span>
                  MEDIUM
                  <strong>{mediumCount}</strong>
                </div>

                <div>
                  <span className="legend-dot low"></span>
                  CLEARED/LOW
                  <strong>{lowCount}</strong>
                </div>

              </div>

            </div>

          </div>


          {/* BAR CHART */}
          <div className="panel">

            <div className="panel-title">
              <div>
                <h3>Risk Activity</h3>
                <p>Fraud rule trigger overview</p>
              </div>

              <span className="chart-icon">▥</span>
            </div>

            <div className="bar-chart">

              <div className="bar-group">
                <div
                  className="bar high-bar"
                  style={{
                    height: `${(highCount / maxCount) * 160}px`
                  }}
                >
                  <span>{highCount}</span>
                </div>
                <label>HIGH</label>
              </div>

              <div className="bar-group">
                <div
                  className="bar medium-bar"
                  style={{
                    height: `${(mediumCount / maxCount) * 160}px`
                  }}
                >
                  <span>{mediumCount}</span>
                </div>
                <label>MEDIUM</label>
              </div>

              <div className="bar-group">
                <div
                  className="bar low-bar"
                  style={{
                    height: `${(lowCount / maxCount) * 160}px`
                  }}
                >
                  <span>{lowCount}</span>
                </div>
                <label>LOW</label>
              </div>

            </div>

          </div>

        </section>


        {/* ALERTS */}
        <section className="alerts-panel">

          <div className="alerts-header">

            <div>
              <h2>🚨 Live Fraud Alerts</h2>
              <p>Review suspicious transactions detected by the rule engine</p>
            </div>

            <div className="controls">

              <input
                type="text"
                placeholder="🔎 Search user / transaction..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="ALL">All Alerts</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="CLEARED">Cleared</option>
              </select>

            </div>

          </div>


          <div className="alerts">

            {filteredFlags.length === 0 ? (

              <div className="empty">
                <div>🛡️</div>
                <h3>No fraud alerts found</h3>
                <p>Everything looks clean.</p>
              </div>

            ) : (

              filteredFlags.map((flag) => (

                <div
                  className={`alert-card ${flag.risk_level.toLowerCase()}`}
                  key={flag.id}
                >

                  <div className="alert-main">

                    <div className="alert-badge">
                      {flag.risk_level === "HIGH"
                        ? "🔴"
                        : flag.risk_level === "MEDIUM"
                        ? "🟠"
                        : "🟢"}
                    </div>

                    <div>

                      <div className="alert-title">
                        <h3>
                          Alert #{flag.id}
                        </h3>

                        <span className={`risk-pill ${flag.risk_level.toLowerCase()}`}>
                          {flag.risk_level}
                        </span>
                      </div>

                      <p>
                        User <strong>{flag.user_id}</strong>
                        {" "}• Transaction #{flag.transaction_id}
                      </p>

                    </div>

                  </div>


                  <div className="alert-info">

                    <div>
                      <small>AMOUNT</small>
                      <strong>₹{flag.amount}</strong>
                    </div>

                    <div>
                      <small>LOCATION</small>
                      <strong>{flag.location}</strong>
                    </div>

                    <div>
                      <small>RULES</small>
                      <strong>{flag.triggered_rules}</strong>
                    </div>

                    <div>
                      <small>RISK SCORE</small>
                      <strong>{flag.risk_score}</strong>
                    </div>

                  </div>


                  <div className="alert-actions">

                    <span className="status">
                      ● {flag.status}
                    </span>

                    {flag.status === "PENDING" && (

                      <>
                        <button
                          onClick={() =>
                            updateStatus(
                              flag.id,
                              "REVIEWED"
                            )
                          }
                        >
                          ✓ Review
                        </button>

                        <button
                          className="clear"
                          onClick={() =>
                            updateStatus(
                              flag.id,
                              "CLEARED"
                            )
                          }
                        >
                          ✓ Clear
                        </button>
                      </>

                    )}

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

      <footer>
        FRAUDGUARD • RULE ENGINE MONITORING • SECURE SYSTEM
      </footer>

    </div>
  );
}

export default App;