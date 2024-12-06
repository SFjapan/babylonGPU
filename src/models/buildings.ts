import { Vector3,SceneLoader,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createBuilding1(scene:Scene,pos:Vector3,rotation?:Vector3,offset:number=models[8].offset,scalling:number=models[8].scalling){
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "building01.glb",scene,null,null,"building01");
    let mesh = current_model.meshes[0];
    mesh.id = "model";
    if(rotation){
        mesh.rotation = rotation;
    }
    mesh.position = new Vector3((pos.x*offset)+0,pos.y,(pos.z*offset)+0);
    mesh.scaling = new Vector3(scalling,scalling,scalling);
}