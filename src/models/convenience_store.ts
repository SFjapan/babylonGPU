import { Vector3,SceneLoader,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createConvenienceStore(scene:Scene,pos:Vector3,offset:number=models[7].offset,scalling:number=models[7].scalling) {
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "convenience_store.glb",scene,null,null,"convenience_store");
    const mesh = current_model.meshes[0];
    mesh.id = "model";
    mesh.position = pos;
    mesh.scaling = new Vector3(scalling,scalling,scalling);
}