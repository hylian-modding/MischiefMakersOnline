import { ICore } from 'modloader64_api/IModloaderAPI'
import { ISave, Save } from './API/ISave'
import { IPlayer, Player, IActor, Actor } from './API/IActor';
import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';

export interface IMischiefMakersCore extends ICore {
    marina: IPlayer
    save: ISave
}

export class MischiefMakers implements IMischiefMakersCore {
    header!: any

    ModLoader!: IModLoaderAPI

    marina!: IPlayer
    save!: ISave

    preinit() {
        this.ModLoader.logger.info("TEST0")
    }
    init() {
        this.ModLoader.logger.info("TEST1")
    }

    postinit() {
        this.ModLoader.logger.info("TEST2")
        this.marina = new Player(this.ModLoader.emulator, 0);
        this.save = new Save(this.ModLoader.emulator)
    }

    onTick() {}
}


