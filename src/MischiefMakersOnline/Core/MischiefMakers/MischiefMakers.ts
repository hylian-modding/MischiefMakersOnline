import { ICore } from 'modloader64_api/IModloaderAPI'
import { ISave, Save } from './API/ISave'
import { IPlayer, Player, IActor, Actor } from './API/IActor';
import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { IGame } from './API/IGame';

export interface IMischiefMakersCore extends ICore {
    marina: IPlayer
    save: ISave
}

export class MischiefMakers implements IMischiefMakersCore {
    constructor() {}
    
    heap_start: number = 0x80800000;
    heap_size: number = 0x83E00000 - 0x80800000;

    header!: any

    ModLoader!: IModLoaderAPI

    marina!: IPlayer
    game!: IGame
    save!: ISave

    preinit() {}
    init() {}
    postinit() {}
    onTick() {}
}


