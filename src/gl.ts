import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MeshBuilder,  PrecisionDate, UniversalCamera, Texture, CreateBox, CubeTexture, GroundMesh } from '@babylonjs/core';
import "@babylonjs/loaders";
import { createHouse } from './models/house';
import { createCat } from './models/cat';
import { createFountain } from './models/fountain';
import { createCampfire } from './models/campfire';
import { createCar } from './models/car';
import { createSlide } from './models/slide';
import { createGasStation } from './models/gas_station';
import { createConvenienceStore } from './models/convenience_store';
import { createBuilding1 } from './models/buildings'; 
import { createCityPark } from './models/citypark';
import { createBuisnessMan } from './models/buisnessman';
window.addEventListener('DOMContentLoaded', async() => {
    //初期描画計測開始
    const startCPU = PrecisionDate.Now;
    const scenes = ["village","town","city"];
    const gl_canvas = document.getElementById('canvas') as unknown as HTMLCanvasElement; // キャンバスの取得
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
        g_material.diffuseTexture = new Texture("./imgs/town_ground.png");
        ground.material = g_material;
        ground.receiveShadows = true; // 地面が影を受け取るように設定
        ground.checkCollisions = true;
        
        return scene;
    };

    const scene = await createScene(); // シーンの作成
    let duration = 0;
    const loading = document.getElementById("loading");
    let scene_loaded = false;

    //準備完了
    scene.executeWhenReady(()=>{
        const endCPU = PrecisionDate.Now;
        duration = (endCPU - startCPU) / 1000;
        loading.style.display = "none";
        scene_loaded = true;
        createCity();
        console.log(scene.getNodeByName("box"));
    });

    //レンダリング
    engine.runRenderLoop(() => {
        scene.render();
        const current_fps = Math.floor(engine.getFps());
        fps.innerHTML ="fps:" +  current_fps +  "," +  duration.toFixed(2) + "秒";
    });

    //リサイズ
    window.addEventListener('resize', () => {
        engine.resize();
    });

   
    //input navigations
    let scene_index = 0;
    const select_scene = document.getElementById('select-scene') as HTMLSelectElement;
    let cansellationToken :{cancelled:boolean} | null = null;

    select_scene.addEventListener('change',async (e:Event)=>{
        const target = e.target as HTMLInputElement;
        const value = target.value as unknown as number;
        scene_index = value;
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
        await createMunicipality(cansellationToken);
    }

    async function createMunicipality(token:{cancelled:boolean}){
        //メッシュをすべて削除して作成
        scene.getMeshesById("model").forEach(mesh => mesh.dispose());
        const particles = scene.particleSystems.slice();
        particles.forEach(particle=>particle.dispose());
        const startTime = performance.now();
        switch(scenes[scene_index]){
            case "village":
                await createVillage();
                break;
            case "town":
                await createTown();
                break;
            case "city":
                await createCity();
                break;
            default:
                break;            
        }
        const endTime = performance.now();
        console.log(endTime - startTime);

        duration = (endTime - startTime)/1000;
    }

    function setGroundMaterial(texture:string){
        if(!scene_loaded)return;
        const ground:GroundMesh = scene.getMeshByName("ground") as GroundMesh;
        const g_material = new StandardMaterial("groundmaterial",scene);
        g_material.diffuseTexture = new Texture("./imgs/" + texture + ".png");
        ground.material = g_material;
        ground.receiveShadows = true; // 地面が影を受け取るように設定
        ground.checkCollisions = true;
    }

    async function createVillage(){
        //村を作る
        //家3つ、キャンプファイヤー1つ、噴水1つ
        //配置はYの字になるように真ん中に噴水一番下にキャンプファイヤーでYのへこみ部分に家
        if(!scene_loaded)return;
        setGroundMaterial("village_ground");
        await createCampfire(scene,new Vector3(3,0,-5));
        await createCat(scene,new Vector3(3.3,0,-5),new Vector3(0,3*Math.PI/3,0));
        await createCat(scene,new Vector3(2.7,0,-5),new Vector3(0,6*Math.PI/-3,0));
        await createCat(scene,new Vector3(3,0,-4.7),new Vector3(0,3*Math.PI/6,0));
        await createFountain(scene,new Vector3(0,0,0));
        await createHouse(scene,new Vector3(0,0,0.75),new Vector3(0,7.5*Math.PI/-10,0));
        await createHouse(scene,new Vector3(0.75,0,0),new Vector3(0,5*-Math.PI/20,0));
        await createHouse(scene,new Vector3(-0.75,0,0),new Vector3(0,5*Math.PI/20,0));
        await createHouse(scene,new Vector3(-0.55,0,-0.75),new Vector3(0,5*Math.PI/10,0));
    }

    async function createTown(){
        if(!scene_loaded)return;
        setGroundMaterial("town_ground");
        await createHouse(scene,new Vector3(1.3,0,1));
        await createHouse(scene,new Vector3(2.1,0,1));
        await createHouse(scene,new Vector3(2.9,0,1));
        await createHouse(scene,new Vector3(1.1,0,-1.3),new Vector3(0,10*Math.PI/5,0));
        await createHouse(scene,new Vector3(1.9,0,-1.3),new Vector3(0,10*Math.PI/5,0));
        await createHouse(scene,new Vector3(2.7,0,-1.3),new Vector3(0,10*Math.PI/5,0));
        await createCar(scene,new Vector3(0,0,0),new Vector3(1,0,50),new Vector3(1,0,-50));
        await createSlide(scene,new Vector3(30,-0.3,-30));
        await createGasStation(scene,new Vector3(-30,0,30));
        await createConvenienceStore(scene,new Vector3(-30,0,-20));
    }

    async function createCity() {
        if(!scene_loaded)return;
        setGroundMaterial("city_ground");
        for(let x = 0; x < 3;x++){
            for(let y =0; y < 3;y++){
                await createBuilding1(scene,new Vector3(0.2 + (x*1.2),3,0.7 + (y*1.2)));
            }
        }
        //createCityPark(scene,new Vector3(-2.7,0,2.7));
        await createCar(scene,new Vector3(0,0,0),new Vector3(-1,0,50),new Vector3(-1,0,-50));
        await createCar(scene,new Vector3(0,0,0),new Vector3(-4,0,-50),new Vector3(-4,0,50),new Vector3(0,10*Math.PI/5,0));

        await createBuisnessMan(scene,new Vector3(0.3,1,1),new Vector3(0,3*Math.PI/5,0));
        await createBuisnessMan(scene,new Vector3(0.5,1,1),new Vector3(0,-3*Math.PI/5,0));
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