import IMemory from "modloader64_api/IMemory";

export const GAME_CONTEXT_POINTER = 0x800BC4C0

export let SCENE_NAMES: any = {}

SCENE_NAMES[0x0000] = "[1-1] Meet Marina!!"
SCENE_NAMES[0x0001] = "[1-5] 3 Clancer Kids"
SCENE_NAMES[0x0002] = "[1-3] Clanball Land"
SCENE_NAMES[0x0003] = "[1-9] Western World"
SCENE_NAMES[0x0004] = "[1-4] Spike Land"
SCENE_NAMES[0x0005] = "[1-7] Wormin\' Up!!"
SCENE_NAMES[0x0006] = "[1-10] Volcan!!"
SCENE_NAMES[0x0007] = "[1-8] Crisis: Nepton"
SCENE_NAMES[0x0008] = "[1-6] Blockman Rises"
SCENE_NAMES[0x0009] = "[1-2] Meet Calina!!"
SCENE_NAMES[0x000A] = "[2-1] Sea of Lava"
SCENE_NAMES[0x000B] = "[2-3] Sink or Float!"
SCENE_NAMES[0x000C] = "[2-5] Searin\' Swing"
SCENE_NAMES[0x000D] = "[2-6] Flambee!!"
SCENE_NAMES[0x000E] = "[2-4] Hot Flush"
SCENE_NAMES[0x000F] = "[2-7] Tightrope Ride"
SCENE_NAMES[0x0010] = "[2-9] Magma Rafts!!"
SCENE_NAMES[0x0011] = "[2-2] Vertigo!!"
SCENE_NAMES[0x0012] = "[2-8] Freefall!!"
SCENE_NAMES[0x0013] = "[2-10] Seasick Climb"
SCENE_NAMES[0x0014] = "[2-11] Migen Brawl!!"
SCENE_NAMES[0x0015] = "[3-2] Clance War"
SCENE_NAMES[0x0016] = "[3-5] Go Marzen 64"
SCENE_NAMES[0x0017] = "[3-9] The Day Before"
SCENE_NAMES[0x0018] = "[3-11] Cat-astrophe!!"
SCENE_NAMES[0x0019] = "[3-3] Missile Surf!!"
SCENE_NAMES[0x001A] = "[3-6] Chilly Dog!!"
SCENE_NAMES[0x001B] = "[3-7] Snowstorm Maze"
SCENE_NAMES[0x001C] = "[3-8] LUNAR!!"
SCENE_NAMES[0x001D] = "[3-4] Clanball Lift!"
SCENE_NAMES[0x001E] = "[3-1] Clanpot Shake"
SCENE_NAMES[0x001F] = "[3-10] The Day Of"
SCENE_NAMES[0x0033] = "[3-12] CERBERUS α"
SCENE_NAMES[0x0034] = "[4-4] Rescue! Act 1"
SCENE_NAMES[0x0035] = "[4-2] Toadly Raw!!"
SCENE_NAMES[0x0036] = "[4-3] 7 Clancer Kids"
SCENE_NAMES[0x0037] = "[4-5] Rescue! Act 2"
SCENE_NAMES[0x0038] = "[4-1] Rolling Rock!!"
SCENE_NAMES[0x003E] = "[4-8] Aster\'s Tryke!"
SCENE_NAMES[0x003F] = "[4-9] Moley Cow!!"
SCENE_NAMES[0x0040] = "[4-10] Aster\'s Maze!"
SCENE_NAMES[0x0041] = "[4-7] Ghost Catcher!"
SCENE_NAMES[0x0042] = "[4-6] TARUS!!"
SCENE_NAMES[0x0048] = "[4-11] SASQUATCH β"
SCENE_NAMES[0x0049] = "[5-2] Counterattack"
SCENE_NAMES[0x004A] = "[5-1] Clance War II"
SCENE_NAMES[0x004B] = "[5-3] Bee\'s the one!"
SCENE_NAMES[0x0053] = "[5-5] Trapped!?"
SCENE_NAMES[0x0054] = "[5-4] MERCO!!"
SCENE_NAMES[0x0056] = "[5-7] Inner Struggle"
SCENE_NAMES[0x0057] = "[5-6] PHOENIX γ"
SCENE_NAMES[0x0058] = "[5-8] Final Battle"
SCENE_NAMES[0x0059] = "Intro"
SCENE_NAMES[0x005F] = "[5-9] Ending"
SCENE_NAMES[0x0060] = "[5-10] Credits"
SCENE_NAMES[0x0065] = "Level Select"

export interface IGame {
    stage_timer: number
    is_paused: number
    game_timer: number
    in_cutscene: number
    game_state: number /*
                0x00 = soft reset
                0x01 = intro splash
                0x02 = title screen
                0x03 = sound test
                0x04 = secret level select
                0x05 = loading
                0x06 = in level
                0x07 = fade out to death screen
                0x08 = intentional trap (This appears to be intended behaviour in this mode)
                0x09 = ??? (The instructions just after the trap)
                0x0A = demo mode
                0x0B = file select
                0x0C = stage transition
                0x0E = best times screen
                (See the proc at 0x800015F0)*/
    temp_state: number
    controller: number
    controller_pressed: number
    keybinds: Buffer // 0x38 size
    joy_x: number
    joy_y: number
    current_scene: number
}

export class Game implements IGame {
    emulator!: IMemory

    constructor (emu: IMemory) {
        this.emulator = emu
    }

    get stage_timer() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x10)
    }

    get game_timer() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x14)
    }

    get is_paused() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x18)
    }

    get in_cutscene() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x1C)
    }

    get game_state() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x20)
    }

    get temp_state() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x24)
    }

    get controller() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x28)
    }

    get controller_pressed() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x2C)
    }

    get keybinds() {
        return this.emulator.rdramReadBuffer(GAME_CONTEXT_POINTER + 0x30, 0x38)
    }

    get joy_x() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x6C)
    }

    get joy_y() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x70)
    }

    get current_scene() {
        return this.emulator.rdramRead16(0x800D08D4)
    }
}

