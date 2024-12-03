import { Vector3,SceneLoader,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createCat(scene:Scene,pos:Vector3,rotation?:Vector3,offset:number=models[1].offset,scalling:number=models[1].scalling){
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "cat.glb",scene,null,null,"cat");
    let mesh = current_model.meshes[0];
    mesh.id = "model";
    if(rotation){
        mesh.rotation = rotation;
    }
    mesh.position = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
    mesh.scaling = new Vector3(scalling,scalling,scalling);
}