import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh,CreateSphere, MeshBuilder, ParticleSystem, PrecisionDate, SceneLoader, ShaderMaterial, UniversalCamera, WebGPUEngine, Material, Texture, ActionManager, ExecuteCodeAction, Action, CreateBox, CubeTexture } from '@babylonjs/core';
import "@babylonjs/loaders";
import { models } from './models';
import { campfire_particle,fountain_particle } from './particles';

window.addEventListener('DOMContentLoaded', async() => {
    //初期描画計測開始
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
        camera.checkCollisions = true;
        //移動速度
        camera.speed = 1;
        //視点移動速度
        camera.angularSensibility = 5000;
        //↑→↓←での移動
        camera.attachControl(gl_canvas,true);
        //重力
        camera.applyGravity = true;
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

        //skyboxの作成
        //全体を覆えるboxをつくる
        const skybox = CreateBox("skybox",{size:1000},scene);
        const skybox_material = new StandardMaterial("skybox_material");
        skybox_material.backFaceCulling = false;
        skybox_material.reflectionTexture = new CubeTexture("./imgs/skybox/",scene);
        skybox_material.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skybox_material.diffuseColor = new Color3(0, 0, 0);
        skybox_material.specularColor = new Color3(0, 0, 0);
        skybox.material = skybox_material;

        // 板の作成（地面として使用）
        const ground = CreateGround("ground", { width: 100, height: 100 }, scene);
        const g_material = new StandardMaterial("groundmaterial",scene);
        g_material.diffuseTexture = new Texture("./imgs/village_ground.png");
        ground.material = g_material;
        ground.receiveShadows = true; // 地面が影を受け取るように設定
        ground.checkCollisions = true;
        createVillage();
        
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
        console.log(scene.getNodeByName("box"));
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
        await createModel(models[model_index],model_count,cansellationToken);
    }

    async function createModel(model:{name:string,offset:number,scalling:number},count:number,token:{cancelled:boolean}){
        //メッシュをすべて削除して作成
        scene.getMeshesById("model").forEach(mesh => mesh.dispose());
        const particles = scene.particleSystems.slice();
        particles.forEach(particle=>particle.dispose());
        for(let x = 0; x < count;x++){
            for(let z = 0; z < count;z++){
                if(token.cancelled){
                    //途中でトークンのcancellがtrueになったらメッシュをすべて削除してreturn
                    scene.getMeshesById("model").forEach(mesh => mesh.dispose());
                    return;
                }
                switch (model.name){
                    case "house":
                        createHouse(new Vector3(x,0,z),model.offset,model.scalling);
                        break;
                    case "cat":
                        createCat(new Vector3(x,0,z),model.offset,model.scalling);
                        break;
                    case "fountain":
                        createFountain(new Vector3(x,0,z),model.offset,model.scalling);
                        break;
                    case "campfire":
                        createCampfire(new Vector3(x,0,z),model.offset,model.scalling);
                        break;
                    default:
                        break;
                }
                
            }
        }
    }

    async function createHouse(pos:Vector3,offset:number,scalling:number,rotation?:Vector3){
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
    async function createCat(pos:Vector3,offset:number,scalling:number,rotation?:Vector3){
        const current_model = await SceneLoader.ImportMeshAsync("","./models/", "cat.glb",scene,null,null,"house");
        let mesh = current_model.meshes[0];
        mesh.id = "model";
        if(rotation){
            mesh.rotation = rotation;
        }
        mesh.position = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
        mesh.scaling = new Vector3(scalling,scalling,scalling);
    }
    async function createFountain(pos:Vector3,offset:number,scalling:number){
        const current_model = await SceneLoader.ImportMeshAsync("","./models/", "fountain.glb",scene,null,null,"house");
        let mesh = current_model.meshes[0];
        mesh.id = "model";
        mesh.position = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
        mesh.scaling = new Vector3(scalling,scalling,scalling);

        const particle = ParticleSystem.Parse(fountain_particle,scene,"");
        particle.maxEmitPower = 1;
        particle.maxSize = 0.2;
        particle.emitter = new Vector3(mesh.position.x,mesh.position.y+1,mesh.position.z);
    }
    async function createCampfire(pos:Vector3,offset:number,scalling:number){
        const current_model = await SceneLoader.ImportMeshAsync("","./models/", "campfire.glb",scene,null,null,"house");
        let mesh = current_model.meshes[0];
        mesh.id = "model";
        mesh.position = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
        mesh.scaling = new Vector3(scalling,scalling,scalling);

        const particle = ParticleSystem.Parse(campfire_particle,scene,"");
        particle.emitter = new Vector3((pos.x*offset)+0,0.1,(pos.z*offset)+0);
    }

    async function createVillage(){
        //村を作る
        //家3つ、キャンプファイヤー1つ、噴水1つ
        //配置はYの字になるように真ん中に噴水一番下にキャンプファイヤーでYのへこみ部分に家
        createCampfire(new Vector3(3,0,-5),models[3].offset,models[3].scalling);
        createCat(new Vector3(3.3,0,-5),models[1].offset,models[1].scalling,new Vector3(0,3*Math.PI/3,0));
        createCat(new Vector3(2.7,0,-5),models[1].offset,models[1].scalling,new Vector3(0,6*Math.PI/-3,0));
        createCat(new Vector3(3,0,-4.7),models[1].offset,models[1].scalling,new Vector3(0,3*Math.PI/6,0));
        createFountain(new Vector3(0,0,0),models[2].offset,models[2].scalling);
        createHouse(new Vector3(0,0,0.75),models[0].offset,models[0].scalling,new Vector3(0,7.5*Math.PI/-10,0));
        createHouse(new Vector3(0.75,0,0),models[0].offset,models[0].scalling,new Vector3(0,5*-Math.PI/20,0));
        createHouse(new Vector3(-0.75,0,0),models[0].offset,models[0].scalling,new Vector3(0,5*Math.PI/20,0));
        createHouse(new Vector3(-0.55,0,-0.75),models[0].offset,models[0].scalling,new Vector3(0,5*Math.PI/10,0));
    }

    async function createFaceBox(){
        const box_material = new StandardMaterial("box_material");
        box_material.diffuseTexture = new Texture("./imgs/fruits.png");

        const faceUV = [];
        faceUV[0] = new Vector4(0.165,0,0.33,1);//背面の果物
        faceUV[1] = new Vector4(0.0,0.0,0.165,1);//前面の果物
        faceUV[2] = new Vector4(0.33,0.0,0.5,1);//右面の果物
        faceUV[3] = new Vector4(0.5,0.0,0.665,1);//左面の果物
        faceUV[4] = new Vector4(0.665,0.0,0.8,1);//上面の果物
        faceUV[5] = new Vector4(0.8,0.0,1,1);//下面の果物

        const box = MeshBuilder.CreateBox("box",{faceUV:faceUV,wrap:true},scene);
        box.material = box_material;
        box.position = new Vector3(0,3,0);
        box.checkCollisions = true;

        let alpha = 0;
        scene.onBeforeRenderObservable.add(()=>{
            box.scaling.y = Math.cos(alpha);
            alpha+=0.01;
        })
        let rotation = 0;
        scene.registerBeforeRender(()=>{
            box.rotation = new Vector3(0,rotation+=0.01,0);
        });
    }
    
});