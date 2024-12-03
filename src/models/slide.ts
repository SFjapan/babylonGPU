import { Vector3,SceneLoader,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createSlide(scene:Scene,pos:Vector3,offset:number=models[5].offset,scalling:number=models[5].scalling) {
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "slide.glb",scene,null,null,"slide");
    const mesh = current_model.meshes[0];
    current_model.meshes.map(e=>e.scaling=new Vector3(0.5,0.5,0.5));
    mesh.id = "model";
    mesh.position = pos;
    mesh.scaling = new Vector3(scalling,scalling,scalling);
}