export class MischiefMakersOnlineSaveStorage {
    constructor() {}

    gold_gems: Buffer = Buffer.alloc(8);
    unlocked_levels: Buffer = Buffer.alloc(4);
    best_times: Buffer = Buffer.alloc(0x90);
}

export class MischiefMakersOnlineStorage extends MischiefMakersOnlineSaveStorage {
    constructor() { super() }

    networkPlayerInstances: any = {};
    players: any = {}
    scenes: any = {}
    scene_data: any = {}
}

export default MischiefMakersOnlineStorage

