import { Vector3,SceneLoader,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createHouse(scene:Scene,pos:Vector3,rotation?:Vector3,offset:number=models[0].offset,scalling:number=models[0].scalling){
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "house.glb",scene,null,null,"house");
    //current_model.meshes.map(e=>e.checkCollisions=true);
    let mesh = current_model.meshes[0];
    mesh.id = "model";
    //mesh.checkCollisions = true;
    mesh.position = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
    if(rotation){
        mesh.rotation = rotation;
    }
    mesh.scaling = new Vector3(scalling,scalling,scalling);
   
}