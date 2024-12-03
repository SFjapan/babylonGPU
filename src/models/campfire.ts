import { Vector3,SceneLoader,Scene,ParticleSystem } from "@babylonjs/core";
import { models } from "../models";
import { campfire_particle } from "../particles";
export async function createCampfire(scene:Scene,pos:Vector3,offset:number=models[3].offset,scalling:number=models[3].scalling){
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "campfire.glb",scene,null,null,"campfire");
    let mesh = current_model.meshes[0];
    mesh.id = "model";
    mesh.position = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
    mesh.scaling = new Vector3(scalling,scalling,scalling);

    const particle = ParticleSystem.Parse(campfire_particle,scene,"");
    particle.emitter = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
}