import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PrecisionDate, SceneLoader, UniversalCamera, WebGPUEngine } from '@babylonjs/core';
import "@babylonjs/loaders";
import { models } from './models';

window.addEventListener('DOMContentLoaded', async() => {
    const startCPU = PrecisionDate.Now;
    
    const gl_canvas = document.getElementById('canvas')as unknown as HTMLCanvasElement; // キャンバスの取得
    let fps = document.getElementById('fps'); //fps表示
    const engine = new WebGPUEngine(gl_canvas); // BABYLONエンジンの初期化
    await engine.initAsync();
    const createScene = async function() {
        const scene = new Scene(engine);
        scene.gravity = new Vector3(0, -9.81, 0);
        scene.collisionsEnabled = true;
        //カメラの設定
        const camera = new UniversalCamera('UniversalCamera',new Vector3(10,10,10),scene);
        camera.ellipsoid = new Vector3(1, 1, 1);
        //移動速度
        camera.speed = 1;
        //視点移動速度
        camera.angularSensibility = 5000;
        //↑→↓←での移動
        camera.attachControl(gl_canvas,true);
        //重力
        //camera.applyGravity = true;
        //WASD対応
        camera.keysUp.push(87);    // Wキー
        camera.keysDown.push(83);  // Sキー
        camera.keysLeft.push(65);  // Aキー
        camera.keysRight.push(68); // Dキー
        //当たり判定
        camera.checkCollisions = true;
        //ライトの設定
        const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
        light.intensity = 1;
        
        // 板の作成（地面として使用）
        const ground = CreateGround("ground", { width: 100000, height: 100000 }, scene);
        const g_material = new StandardMaterial("groundmaterial",scene);
        g_material.diffuseColor = new Color3(0,1,0);
        ground.material = g_material;
        ground.receiveShadows = true; // 地面が影を受け取るように設定
        ground.checkCollisions = true;
        for(let x = 0; x < 10;x++){
            for(let z = 0; z < 10;z++){
                const model = await SceneLoader.ImportMeshAsync("","./models/","house.glb",scene,null,null,"house");
                let house = model.meshes[0];
                house.id = "model";
                house.position = new Vector3((x*15)+0,0,(z*15)+0);
                house.scaling = new Vector3(10,10,10);
            }
        }
        
        //house.checkCollisions = true;
        return scene;
    };

    const scene = await createScene(); // シーンの作成
    let duration = 0;
    const loading = document.getElementById("loading");
    let scene_loaded = false;
    scene.executeWhenReady(()=>{
        const endCPU = PrecisionDate.Now;
        duration = (endCPU - startCPU) / 1000;
        loading.style.display = "none";
        scene_loaded = true;
    });
    engine.runRenderLoop(() => {
        scene.render();
        const current_fps = Math.floor(engine.getFps());
        fps.innerHTML ="fps:" +  current_fps +  "," +  duration.toFixed(2) + "秒";
    });
    window.addEventListener('resize', () => {
        engine.resize();
    });

   
    //input navigations
    let model_index = 0;
    let model_count = 10;
    const house_count = document.getElementById('model-count') as HTMLInputElement;
    const select_model = document.getElementById('select-model') as HTMLSelectElement;
    let cansellationToken :{cancelled:boolean} | null = null;
    house_count.addEventListener('change',async (e:Event)=>{
        const target = e.target as HTMLInputElement;
        const value = target.value as unknown as number;
        target.nextElementSibling.innerHTML = "model-count:" + value;
        model_count = value;
        await restatModelCreation();
    });

    select_model.addEventListener('change',async (e:Event)=>{
        const target = e.target as HTMLInputElement;
        const value = target.value as unknown as number;
        model_index = value;
        await restatModelCreation();
    });

    async function restatModelCreation(){
        if(!scene_loaded)return;
        //トークンがあったらtrueにして渡す
        if(cansellationToken){
            cansellationToken.cancelled = true;
        }
        //新しくトークンをfalseで作る
        cansellationToken = {cancelled:false};
        await createModel(models[model_index].name,model_count,models[model_index].offset,cansellationToken);
    }

    async function createModel(model:string,count:number,offset:number,token:{cancelled:boolean}){
        //メッシュをすべて削除して作成
        scene.getMeshesById("model").forEach(mesh => mesh.dispose());

        for(let x = 0; x < count;x++){
            for(let z = 0; z < count;z++){
                if(token.cancelled){
                    //途中でトークンのcancellがtrueになったらメッシュをすべて削除してreturn
                    scene.getMeshesById("model").forEach(mesh => mesh.dispose());
                    return;
                }
                const current_model = await SceneLoader.ImportMeshAsync("","./models/",model+ ".glb",scene,null,null,"house");
                let mesh = current_model.meshes[0];
                mesh.id = "model";
                mesh.position = new Vector3((x*offset)+0,0,(z*offset)+0);
                mesh.scaling = new Vector3(10,10,10);
            }
        }
    }
    
   
});