import "./UserGuide.css";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuide = ({ isOpen, onClose }: UserGuideProps) => {
  if (!isOpen) return null;

  return (
    <div className="user-guide-overlay" onClick={onClose}>
      <div className="user-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-guide-header">
          <h2>🚴 User Guide</h2>
          <button className="user-guide-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="user-guide-content">
          <section className="guide-section">
            <h3>📖 Getting Started</h3>
            <div className="guide-steps">
              <div className="guide-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Record a Ride in Strava</h4>
                  <ul>
                    <li>Open Strava app and start recording a ride</li>
                    <li>
                      Make sure GPS tracking is enabled (not manual entry)
                    </li>
                    <li>Save the activity when you finish</li>
                  </ul>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Activities Sync Automatically</h4>
                  <ul>
                    <li>
                      As soon as you save a ride, Strava notifies the app via a
                      webhook and your activity appears within seconds — no
                      action needed
                    </li>
                    <li>
                      If something looks missing, you can still hit
                      "🔄 Sync Now" on the dashboard to force a refresh
                    </li>
                  </ul>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>View Your Progress</h4>
                  <ul>
                    <li>
                      See your distance, progress percentage, and virtual
                      location on the map
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="guide-section important-section">
            <h3>⚠️ Important Notes</h3>
            <div className="important-points">
              <div className="important-point">
                <span className="icon">📱</span>
                <div>
                  <strong>Record First, Sync Later</strong>
                  <p>Always record your ride in Strava BEFORE syncing</p>
                </div>
              </div>
              <div className="important-point">
                <span className="icon">📍</span>
                <div>
                  <strong>GPS Tracking Required</strong>
                  <p>
                    Only GPS-tracked rides count. Manual entries are NOT
                    counted.
                  </p>
                </div>
              </div>
              <div className="important-point">
                <span className="icon">🚴</span>
                <div>
                  <strong>Activity Type Matters</strong>
                  <p>Only activities marked as "Ride" in Strava are synced</p>
                </div>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>✅ What Counts Toward Distance?</h3>
            <div className="counts-table">
              <div className="table-row header">
                <div>Activity Type</div>
                <div>GPS Tracked</div>
                <div>Counts?</div>
              </div>
              <div className="table-row">
                <div>Ride (GPS)</div>
                <div>✅ Yes</div>
                <div className="counts-yes">✅ YES</div>
              </div>
              <div className="table-row">
                <div>Ride (Manual)</div>
                <div>❌ No</div>
                <div className="counts-no">❌ NO</div>
              </div>
              <div className="table-row">
                <div>Run / Walk</div>
                <div>✅ Yes</div>
                <div className="counts-no">❌ No (wrong type)</div>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>🔄 How Syncing Works</h3>
            <div className="sync-info">
              <div className="sync-item">
                <strong>Webhook (Primary):</strong>
                <p>
                  When you save a ride in Strava, Strava sends a webhook event
                  to the app. The activity is fetched, saved, and your
                  dashboard / challenge progress updates within seconds — no
                  polling, no waiting.
                </p>
              </div>
              <div className="sync-item">
                <strong>Daily Safety Net:</strong>
                <p>
                  A background job runs once a day at 03:00 UTC to backfill
                  anything missed during a Strava or app outage. You should
                  rarely notice this.
                </p>
              </div>
              <div className="sync-item">
                <strong>Manual Sync:</strong>
                <p>
                  Click "🔄 Sync Now" on the dashboard or a challenge page if
                  you still do not see a recent ride. Manual sync is now a
                  fallback rather than the main path.
                </p>
              </div>
              <div className="sync-item">
                <strong>Edits &amp; Deletes:</strong>
                <p>
                  If you edit a ride's distance or delete it in Strava, the
                  webhook updates or removes it here too — totals and
                  challenge progress recompute automatically.
                </p>
              </div>
              <div className="sync-item">
                <strong>What Gets Synced:</strong>
                <ul>
                  <li>✅ GPS-tracked rides from Strava</li>
                  <li>✅ Activities with distance &gt; 0 km</li>
                  <li>✅ Activities marked as "Ride" type</li>
                  <li>❌ Manual entries (not counted)</li>
                  <li>❌ Non-cycling activities</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>📊 Understanding Your Dashboard</h3>
            <div className="dashboard-info">
              <div className="dashboard-item">
                <strong>📏 Distance Covered:</strong> Total kilometers cycled
              </div>
              <div className="dashboard-item">
                <strong>🗺️ Remaining Distance:</strong> Kilometers left to
                complete route
              </div>
              <div className="dashboard-item">
                <strong>📊 Progress:</strong> Percentage of route completed
              </div>
              <div className="dashboard-item">
                <strong>🎯 Target Distance:</strong> Total distance of your
                challenge
              </div>
              <div className="dashboard-item">
                <strong>⏰ Days Remaining:</strong> Days left in challenge
                period
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>🐛 Troubleshooting</h3>
            <div className="troubleshooting">
              <div className="trouble-item">
                <strong>No activities showing?</strong>
                <ul>
                  <li>Check that you have GPS-tracked rides in Strava</li>
                  <li>Verify activities are marked as "Ride" type</li>
                  <li>
                    Make sure you saved activities in Strava before syncing
                  </li>
                </ul>
              </div>
              <div className="trouble-item">
                <strong>Distance not updating?</strong>
                <ul>
                  <li>Activities must be GPS-tracked (not manual entries)</li>
                  <li>Only "Ride" activities count toward distance</li>
                  <li>Activities must have distance &gt; 0 km</li>
                  <li>
                    If a ride saved in Strava more than a few minutes ago is
                    still missing, click "🔄 Sync Now" to force a refresh
                  </li>
                </ul>
              </div>
              <div className="trouble-item">
                <strong>
                  Challenge map shows "No route configured for this challenge"?
                </strong>
                <ul>
                  <li>
                    The challenge was created without a route attached. Ask the
                    challenge creator (or an admin) to assign a route to it
                  </li>
                  <li>
                    Your distance and progress still count — only the map view
                    is hidden
                  </li>
                </ul>
              </div>
              <div className="trouble-item">
                <strong>Re-authorize Strava if syncing stops</strong>
                <ul>
                  <li>
                    If you revoke access in your Strava settings, the app will
                    deactivate your account and stop syncing. Sign in again
                    with Strava to restore the connection
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="guide-section quick-ref">
            <h3>⚡ Quick Reference</h3>
            <div className="quick-ref-grid">
              <div className="quick-ref-col">
                <h4>✅ Do This</h4>
                <ul>
                  <li>✅ Record rides with GPS in Strava</li>
                  <li>✅ Save activities before syncing</li>
                  <li>✅ Sync regularly</li>
                  <li>✅ Check activities are "Ride" type</li>
                </ul>
              </div>
              <div className="quick-ref-col">
                <h4>❌ Don't Do This</h4>
                <ul>
                  <li>❌ Don't manually enter activities</li>
                  <li>❌ Don't sync before recording</li>
                  <li>❌ Don't expect runs/walks to count</li>
                  <li>❌ Don't forget to save in Strava</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="guide-footer">
            <p>
              This guide covers the essentials. For more detailed information,
              refer to the full User Guide documentation.
            </p>
            <button className="guide-close-btn" onClick={onClose}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
