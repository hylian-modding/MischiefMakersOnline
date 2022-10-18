import { IPlugin, IPluginServerConfig, IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { InjectCore } from "modloader64_api/CoreInjection";
import { IPacketHeader } from "modloader64_api/NetworkHandler";
import { EventsClient, EventsServer, EventHandler } from 'modloader64_api/EventHandler';
import { SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { IMischiefMakersCore, MischiefMakers } from './Core/MischiefMakers/MischiefMakers'
import MischiefMakersClient from "./MischiefMakersClient"
import MischiefMakersServer from "./MischiefMakersServer"
import MischiefMakersOnlineStorage from "./MischiefMakersOnlineStorage";

export class MischiefMakersOnline implements IPlugin, IPluginServerConfig {
    ModLoader = {} as IModLoaderAPI
    name = "MischiefMakersOnline"

    core: MischiefMakers;

    constructor() {
        this.core = new MischiefMakers();
    }

    @SidedProxy(ProxySide.CLIENT, MischiefMakersClient)
    client!: MischiefMakersClient;

    @SidedProxy(ProxySide.SERVER, MischiefMakersServer)
    server!: MischiefMakersServer;

    sendPacketToPlayersInScene(packet: IPacketHeader): void {
        if (this.server !== undefined) {
            this.server.sendPacketToPlayersInScene(packet);
        }
    }

    preinit() {}
    init() {}
    postinit() {}
    onTick(frame: number) {}

    @EventHandler(EventsClient.ON_INJECT_FINISHED)
    onClient_InjectFinished(evt: any) {}

    getServerURL(): string {
        //@ts-ignore
        if (global.ModLoader.version != "2.0.30") {
            return "modloader64.com:8030"
        }
        else {
            return "195.252.199.200:8030"
        }
    }
}

module.exports = MischiefMakersOnline

export default MischiefMakersOnline

