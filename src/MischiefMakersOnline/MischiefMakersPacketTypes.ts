import Vector2 from './Math/Vector2'
import Vector3 from 'modloader64_api/math/Vector3';
import { Packet, packetHelper, UDPPacket} from 'modloader64_api/ModLoaderDefaultImpls';
import { sign } from 'crypto';
import { Actor, SceneActorUpdate } from './Core/MischiefMakers/API/IActor';

export class GoldGemsPacket extends Packet {
    gold_gems: Buffer

    constructor(gems: Buffer, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Gold`, "mmo", lobby, false)
        this.gold_gems = gems
    }
}

export class UnlockedLevelsPacket extends Packet {
    unlocked_levels: Buffer

    constructor(levels: Buffer, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Levels`, "mmo", lobby, false)
        this.unlocked_levels = levels
    }
}

export class BestTimesPacket extends Packet {
    best_times: Buffer

    constructor(times: Buffer, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Times`, "mmo", lobby, false)
        this.best_times = times
    }
}

export class UpdatePlayerPositionPacket extends Packet {
    pos: Vector3

    constructor(lhs: Vector3, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Pos`, "mmo", lobby, false)
        this.pos = lhs
    }
}

export class UpdatePlayerVelocityPacket extends Packet {
    vel: Vector2

    constructor(lhs: Vector2, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Vel`, "mmo", lobby, false)
        this.vel = lhs
    }
}

export class UpdatePlayerRGBAPacket extends Packet {
    rgba: number

    constructor(lhs: number, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}RGBA`, "mmo", lobby, false)
        this.rgba = lhs
    }
}

export class UpdatePlayerDataPacket extends Packet {
    mode: number
    effect_flags: number
    health: number
    air_ground_state: number
    idle_time: number



    constructor(lhs: Actor, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}PData`, "mmo", lobby, false)
        this.mode = lhs.mode
        this.effect_flags = lhs.effect_flags
        this.health = lhs.health
        this.air_ground_state = lhs.air_ground_state
        this.idle_time = lhs.idle_time
    }
}

export class UpdatePlayerScalePacket extends Packet {
    scaleXY: number
    scale_0: Vector2
    scale_1: Vector2

    constructor(lhs: Actor, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}PScale`, "mmo", lobby, false)
        this.scaleXY = lhs.scaleXY
        this.scale_0 = lhs.scale_0
        this.scale_1 = lhs.scale_1
    }
}

export class PingServerPacket extends Packet {
    time_sent: number

    constructor(tick: Date, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Ping`, "mmo", lobby, false)
        this.time_sent = tick.valueOf();
    }
}

export class PlayerPingPacket extends Packet {
    ping: number

    constructor(ping: number, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}PPing`, "mmo", lobby, false)
        this.ping = ping
    }
}

export class SceneChangePacket extends Packet {
    scene: number

    constructor(scene: number, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Scene`, "mmo", lobby, false)
        this.scene = scene
    }
}

export class SceneUpdatePacket extends Packet {
    update_data: SceneActorUpdate[]
    scene: number

    constructor(data: SceneActorUpdate[], scene: number, lobby: string, is_server: number = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}SceneU`, "mmo", lobby, false)
        this.update_data = data
        this.scene = scene
    }
}


