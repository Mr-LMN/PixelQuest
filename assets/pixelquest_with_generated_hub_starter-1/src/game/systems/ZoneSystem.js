// ZoneSystem tracks area state and provides reusable zone unlocking helpers.
export class ZoneSystem {
  constructor(zones = [], initialZoneId) {
    this.zones = zones.map((zone) => ({ ...zone, isUnlocked: zone.locked !== true }));
    this.currentZone = this.zones.find((zone) => zone.zoneId === initialZoneId) ?? this.zones[0] ?? null;

    this.unlockRules = [];
    this.completedTriggers = new Set();
  }

  update(playerX, playerY) {
    const zone = this.zones.find(
      (item) =>
        playerX >= item.x &&
        playerX < item.x + item.width &&
        playerY >= item.y &&
        playerY < item.y + item.height
    );

    if (zone && (!this.currentZone || zone.zoneId !== this.currentZone.zoneId)) {
      this.currentZone = zone;
      return zone;
    }

    return null;
  }

  getCurrentZoneName() {
    return this.currentZone?.name ?? 'Unknown Area';
  }

  unlockZone(zoneId) {
    const zone = this.zones.find((item) => item.zoneId === zoneId);
    if (!zone) return null;

    zone.isUnlocked = true;
    return zone;
  }

  isZoneUnlocked(zoneId) {
    return this.zones.find((zone) => zone.zoneId === zoneId)?.isUnlocked ?? false;
  }

  registerUnlockRule(rule) {
    if (!rule?.triggerId || typeof rule.onTrigger !== 'function') return;
    this.unlockRules.push(rule);
  }

  trigger(triggerId, context = {}) {
    if (!triggerId || this.completedTriggers.has(triggerId)) {
      return [];
    }

    const matchingRules = this.unlockRules.filter((rule) => rule.triggerId === triggerId);
    if (matchingRules.length === 0) return [];

    this.completedTriggers.add(triggerId);

    return matchingRules.map((rule) => rule.onTrigger({ ...context, zoneSystem: this })).filter(Boolean);
  }
}
