import { Vector3,SceneLoader,Animation,Scene } from "@babylonjs/core";
import { models } from "../models";
export async function createCar(scene:Scene,pos:Vector3,offset:number=models[4].offset,scalling:number=models[4].scalling){
    const current_model = await SceneLoader.ImportMeshAsync("","./models/", "car.glb",scene,null,null,"car");
    //車輪のアニメーション
    const wheels = current_model.meshes.slice(17,23);
    wheels.forEach((wheel,i)=>{
        //引数　名前　何に変更を加えるか(今回は回転) フレーム　代入される変数の型　ループのモード
        const wheelAnimation = new Animation(
                                                "wheelAnimation",
                                                "rotation.z",
                                                30,
                                                Animation.ANIMATIONTYPE_FLOAT,
                                                Animation.ANIMATIONLOOPMODE_CYCLE
                                            );
        wheel.rotationQuaternion = null; 
        if(i<2){
            const rightwheelKeys = [];
            rightwheelKeys.push({
                frame:0,
                value:0
            });
            rightwheelKeys.push({
                frame:30,
                value:2 * Math.PI * -1
            });
            wheelAnimation.setKeys(rightwheelKeys);
        }  else{
            const leftwheelKeys = [];
            leftwheelKeys.push({
                frame:0,
                value:0
            });
            leftwheelKeys.push({
                frame:30,
                value:2 * Math.PI
            });
            wheelAnimation.setKeys(leftwheelKeys);
        }       
        wheel.animations=[];
        wheel.animations.push(wheelAnimation);
        scene.beginAnimation(wheel, 0, 30, true);
    });
    
    //車が走っているアニメーション
    const carAnimattion = new Animation(
                                        "carAnimation",
                                        "position",
                                        30,
                                        Animation.ANIMATIONTYPE_VECTOR3,
                                        Animation.ANIMATIONLOOPMODE_CYCLE
                                    );
    const carKeys = [];
    carKeys.push({
        frame:0,
        value:new Vector3(3,0,50)
    });
    carKeys.push({
        frame:300,
        value:new Vector3(3,0,-50)
    });

    carAnimattion.setKeys(carKeys);
    let mesh = current_model.meshes[0];
    mesh.animations = [];
    mesh.animations.push(carAnimattion);
    scene.beginAnimation(mesh,0,300,true);
    mesh.id = "model";
    mesh.position = new Vector3((pos.x*offset)+0,1,(pos.z*offset)+0);
    mesh.scaling = new Vector3(scalling,scalling,scalling);
}