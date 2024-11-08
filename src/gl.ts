import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Collider, PrecisionDate, SceneLoader, UniversalCamera, WebGPUEngine } from '@babylonjs/core';
import "@babylonjs/loaders"
import { ChangeEvent } from 'react';


window.addEventListener('DOMContentLoaded', async() => {
    const startCPU = PrecisionDate.Now;

    const gl_canvas = document.getElementById('canvas')as unknown as HTMLCanvasElement; // キャンバスの取得
    let fps = document.getElementById('fps'); //fps表示
    const engine = new Engine(gl_canvas); // BABYLONエンジンの初期化
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
        for(let x = 0; x < 13;x++){
            for(let z = 0; z < 13;z++){
                const model = await SceneLoader.ImportMeshAsync("","./models/","house.glb",scene,null,null,"house");
                let house = model.meshes[0];
                house.id = "house";
                house.position = new Vector3((x*15)+0,0,(z*15)+0);
                house.scaling = new Vector3(10,10,10);
            }
        }
        
        //house.checkCollisions = true;
        return scene;
    };

    const scene = await createScene(); // シーンの作成
    let duration = 0;
    scene.executeWhenReady(()=>{
        const endCPU = PrecisionDate.Now;
        duration = (endCPU - startCPU) / 1000;
    });
    engine.runRenderLoop(() => {
        scene.render();
        const current_fps = Math.floor(engine.getFps());
        fps.innerHTML ="fps:" +  current_fps +  "," +  duration.toFixed(2) + "秒";
    });
    const house_count = document.getElementById('house-count') as HTMLInputElement;
    house_count.addEventListener('change',async (e:Event)=>{
        const target = e.target as HTMLInputElement;
        const value = target.value as unknown as number;
        target.nextElementSibling.innerHTML = "house-count:" + value;
        scene.getMeshesById("house").forEach(house=>{
            house.dispose();
        })
        for(let x = 0; x < value;x++){
            for(let z = 0; z < value;z++){
                const model = await SceneLoader.ImportMeshAsync("","./models/","cat.glb",scene,null,null,"house");
                let mesh = model.meshes[0];
                mesh.id = "house";
                mesh.position = new Vector3((x*15)+0,0,(z*15)+0);
                mesh.rotation = new Vector3(0,90,0);
                mesh.scaling = new Vector3(10,10,10);
            }
        }
    })
    window.addEventListener('resize', () => {
        engine.resize();
    });
});