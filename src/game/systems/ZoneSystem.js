// ZoneSystem reports the active area name based on player position.
export class ZoneSystem {
  constructor(zones = [], initialZoneId) {
    this.zones = zones;
    this.currentZone = zones.find((zone) => zone.zoneId === initialZoneId) ?? zones[0] ?? null;
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
}
