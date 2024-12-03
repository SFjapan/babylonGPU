import { Vector3,SceneLoader,Scene,ParticleSystem } from "@babylonjs/core";
import { models } from "../models";
import { fountain_particle } from "../particles";
export async function createFountain(scene:Scene,pos:Vector3,offset:number=models[2].offset,scalling:number=models[2].scalling){
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "fountain.glb",scene,null,null,"fountain");
    let mesh = current_model.meshes[0];
    mesh.id = "model";
    mesh.position = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
    mesh.scaling = new Vector3(scalling,scalling,scalling);

    const particle = ParticleSystem.Parse(fountain_particle,scene,"");
    particle.maxEmitPower = 1;
    particle.maxSize = 0.2;
    particle.emitter = new Vector3(mesh.position.x,mesh.position.y+1,mesh.position.z);
}