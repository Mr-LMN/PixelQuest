// BossHealth displays a compact health bar for the current boss target.
const BossHealth = ({ boss }) => {
  if (!boss) return null;

  const healthPercent = Math.max(0, (boss.currentHp / boss.maxHp) * 100);

  return (
    <article className="ui-panel">
      <h2>Boss</h2>
      <p>{boss.name}</p>
      <div className="health-track">
        <div className="health-fill" style={{ width: `${healthPercent}%` }} />
      </div>
      <p>
        HP: {boss.currentHp}/{boss.maxHp} {boss.isActive ? '(Engaged)' : '(Out of range)'}
      </p>
    </article>
  );
};

export default BossHealth;
