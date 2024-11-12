import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { CreateSphere, ParticleSystem, PrecisionDate, SceneLoader, ShaderMaterial, UniversalCamera, WebGPUEngine } from '@babylonjs/core';
import "@babylonjs/loaders";
import { models } from './models';

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
        for(let x = 0; x < 10;x++){
            for(let z = 0; z < 10;z++){
                const model = await SceneLoader.ImportMeshAsync("","./models/","house.glb",scene,null,null,"house");
                let house = model.meshes[0];
                const house_material = new StandardMaterial("housematerial",scene);
                house_material.diffuseColor = new Color3(0,1,0);
                house.id = "model";
                house.material = house_material;
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
        await createModel(models[model_index],model_count,cansellationToken);
    }

    async function createModel(model:{name:string,offset:number,scalling:number},count:number,token:{cancelled:boolean}){
        //メッシュをすべて削除して作成
        scene.getMeshesById("model").forEach(mesh => mesh.dispose());

        for(let x = 0; x < count;x++){
            for(let z = 0; z < count;z++){
                if(token.cancelled){
                    //途中でトークンのcancellがtrueになったらメッシュをすべて削除してreturn
                    scene.getMeshesById("model").forEach(mesh => mesh.dispose());
                    return;
                }
                const current_model = await SceneLoader.ImportMeshAsync("","./models/",model.name+ ".glb",scene,null,null,"house");
                let mesh = current_model.meshes[0];
                mesh.id = "model";
                if(model.name == "low_poly_camp_fire"){
                    const json = {"name":"CPU particle system","id":"default system","capacity":10000,"disposeOnStop":false,"manualEmitCount":-1,"emitter":[0,0,0],"particleEmitterType":{"type":"ConeParticleEmitter","radius":0.1,"angle":0.7853981633974483,"directionRandomizer":0,"radiusRange":1,"heightRange":1,"emitFromSpawnPointOnly":false},"texture":{"tags":null as any,"url":"https://assets.babylonjs.com/textures/flare.png","uOffset":0,"vOffset":0,"uScale":1,"vScale":1,"uAng":0,"vAng":0,"wAng":0,"uRotationCenter":0.5,"vRotationCenter":0.5,"wRotationCenter":0.5,"homogeneousRotationInUVTransform":false,"isBlocking":true,"name":"https://assets.babylonjs.com/textures/flare.png","hasAlpha":false,"getAlphaFromRGB":false,"level":1,"coordinatesIndex":0,"optimizeUVAllocation":true,"coordinatesMode":0,"wrapU":1,"wrapV":1,"wrapR":1,"anisotropicFilteringLevel":4,"isCube":false,"is3D":false,"is2DArray":false,"gammaSpace":true,"invertZ":false,"lodLevelInAlpha":false,"lodGenerationOffset":0,"lodGenerationScale":0,"linearSpecularLOD":false,"isRenderTarget":false,"animations":[] as any,"invertY":true,"samplingMode":3,"_useSRGBBuffer":false,"internalTextureLabel":"https://assets.babylonjs.com/textures/flare.png","noMipmap":false},"isLocal":false,"animations":[] as any,"beginAnimationOnStart":false,"beginAnimationFrom":0,"beginAnimationTo":60,"beginAnimationLoop":false,"startDelay":0,"renderingGroupId":0,"isBillboardBased":true,"billboardMode":7,"minAngularSpeed":0,"maxAngularSpeed":0,"minSize":0.1,"maxSize":0.1,"minScaleX":1,"maxScaleX":1,"minScaleY":1,"maxScaleY":1,"minEmitPower":2,"maxEmitPower":2,"minLifeTime":1,"maxLifeTime":2,"emitRate":30,"gravity":[0,0,0],"noiseStrength":[10,10,10],"color1":[1,1,1,1],"color2":[0.7372549019607844,0.03529411764705882,0.03529411764705882,1],"colorDead":[1,1,1,0],"updateSpeed":0.016666666666666666,"targetStopDuration":0,"blendMode":0,"preWarmCycles":0,"preWarmStepOffset":1,"minInitialRotation":0,"maxInitialRotation":0,"startSpriteCellID":0,"spriteCellLoop":true,"endSpriteCellID":0,"spriteCellChangeSpeed":1,"spriteCellWidth":0,"spriteCellHeight":0,"spriteRandomStartCell":false,"isAnimationSheetEnabled":false,"useLogarithmicDepth":false,"colorGradients":[{"gradient":0,"color1":[0,0,0,1],"color2":[0.41568627450980394,0.396078431372549,0.396078431372549,1]},{"gradient":0.12,"color1":[0.8823529411764706,0.023529411764705882,0.023529411764705882,1],"color2":[1,0.9490196078431372,0,1]},{"gradient":0.78,"color1":[0.47843137254901963,0.38823529411764707,0.6980392156862745,1],"color2":[0.41568627450980394,0.1803921568627451,0.1803921568627451,1]},{"gradient":1,"color1":[0,0,0,1],"color2":[0.5490196078431373,0.1607843137254902,0.1607843137254902,1]}],"sizeGradients":[{"gradient":0,"factor1":0.1,"factor2":0.2},{"gradient":0.14,"factor1":1,"factor2":1},{"gradient":0.3,"factor1":0.01,"factor2":0.01}],"startSizeGradients":[] as any,"textureMask":[1,1,1,1],"customShader":null as any,"preventAutoStart":false,"worldOffset":[0,0,0]};
                    const particle = ParticleSystem.Parse(json,scene,""); 
                    particle.emitter = new Vector3((x*model.offset)+0,0,(z*model.offset)+0);
                }
                mesh.position = new Vector3((x*model.offset)+0,0,(z*model.offset)+0);
                mesh.scaling = new Vector3(model.scalling,model.scalling,model.scalling);
            }
        }
    }
    
    
   
});