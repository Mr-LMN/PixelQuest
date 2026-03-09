// ZoneSystem reports a named area based on player position using placeholder zones.
export class ZoneSystem {
  constructor() {
    this.currentZone = { zoneId: 'village', name: 'Village Hub' };
    this.zones = [
      { zoneId: 'village', name: 'Village Hub', minX: 0, maxX: 420, minY: 0, maxY: 640 },
      { zoneId: 'combat-trial', name: 'Combat Trial', minX: 420, maxX: 960, minY: 240, maxY: 640 },
      { zoneId: 'forest-path', name: 'Forest Path', minX: 420, maxX: 960, minY: 0, maxY: 240 },
    ];
  }

  update(playerX, playerY) {
    const zone = this.zones.find(
      (item) => playerX >= item.minX && playerX < item.maxX && playerY >= item.minY && playerY < item.maxY
    );

    if (zone && zone.zoneId !== this.currentZone.zoneId) {
      this.currentZone = zone;
      return zone;
    }

    return null;
  }

  getCurrentZoneName() {
    return this.currentZone.name;
  }
}
