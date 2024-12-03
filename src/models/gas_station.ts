import { Vector3,SceneLoader,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createGasStation(scene:Scene,pos:Vector3,offset:number=models[6].offset,scalling:number=models[6].scalling) {
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "gas_station.glb",scene,null,null,"gas_station");
    const mesh = current_model.meshes[0];
    mesh.id = "model";
    mesh.position = pos;
    mesh.scaling = new Vector3(scalling,scalling,scalling);
}