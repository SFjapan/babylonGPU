import { Vector3,SceneLoader,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createBuisnessMan(scene:Scene,pos:Vector3,rotation?:Vector3,offset:number=models[10].offset,scalling:number=models[10].scalling){
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "sitting_man.glb",scene,null,null,"buisness_man");
    console.log(current_model);
    //current_model.animationGroups.map(e=>e.dispose());
    let mesh = current_model.meshes[0];
    mesh.id = "model";
    if(rotation){
        mesh.rotation = rotation;
    }
    //重いので一旦アニメーション削除
    mesh.position = new Vector3((pos.x*offset)+0,pos.y,(pos.z*offset)+0);
    mesh.scaling = new Vector3(scalling,scalling,scalling);
}