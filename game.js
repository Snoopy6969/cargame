function initGame() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.00035);

    scene.add(new THREE.AmbientLight(0x404060));
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(100,200,100);
    sun.castShadow = true;
    scene.add(sun);

    const road = new THREE.Group();
    scene.add(road);
    for(let i=0;i<500;i++){
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(36,60), new THREE.MeshLambertMaterial({color:0x111111}));
        seg.rotation.x = -Math.PI/2;
        seg.position.z = i*60;
        seg.receiveShadow = true;
        road.add(seg);
    }
    for(let i=0;i<500;i+=4){
        const line = new THREE.Mesh(new THREE.PlaneGeometry(1,30), new THREE.MeshBasicMaterial({color:0xffffff}));
        line.rotation.x = -Math.PI/2;
        line.position.set(0,0.1,i*60+30);
        road.add(line);
    }

    function makeCar(c){
        const g = new THREE.Group();
        const b = new THREE.Mesh(new THREE.BoxGeometry(3.5,1.6,8), new THREE.MeshPhongMaterial({color:c}));
        b.position.y = 1.6; b.castShadow = true; g.add(b);
        const r = new THREE.Mesh(new THREE.BoxGeometry(3,1.2,5), new THREE.MeshPhongMaterial({color:c*0.85}));
        r.position.y = 2.8; g.add(r);
        return g;
    }
    const car1 = makeCar(0xff0044);
    const car2 = makeCar(0x0088ff);
    scene.add(car1, car2);

    let p1 = {x:-8, speed:0, z:0};
    let p2 = {x: 8, speed:0, z:0};

    const cam1 = new THREE.PerspectiveCamera(75,2,0.1,20000);
    const cam2 = new THREE.PerspectiveCamera(75,2,0.1,20000);

    const keys = {};
    onkeydown = onkeyup = e=> keys[e.key.toLowerCase()] = e.type=='keydown';

    document.body.innerHTML += `
        <div style="position:fixed;top:20px;left:20px;color:#0f0;font:bold 40px Courier;text-shadow:0 0 20px #0f0;z-index:10">
            P1: <span id="s1">0</span> km/h<br>P2: <span id="s2">0</span> km/h
        </div>
        <div id="timer" style="position:fixed;top:20px;right:20px;color:#0f0;font:bold 40px Courier;text-shadow:0 0 20px #0f0;z-index:10">00:00.00</div>
        <div style="position:fixed;left:0;top:50%;width:100%;height:12px;background:#0f0;box-shadow:0 0 50px #0f0;transform:translateY(-50%);z-index:9"></div>
    `;

    const startTime = performance.now();
    setInterval(()=>{
        const t = ((performance.now()-startTime)/1000).toFixed(2);
        document.getElementById('timer').textContent = t.padStart(8,'0');
    },50);

    (function loop(){
        if(keys['a']) p1.x -= 0.7; if(keys['d']) p1.x += 0.7;
        if(keys['w']) p1.speed += 4; if(keys['s']) p1.speed *= 0.9;
        if(keys['arrowleft']) p2.x -= 0.7; if(keys['arrowright']) p2.x += 0.7;
        if(keys['arrowup']) p2.speed += 4; if(keys['arrowdown']) p2.speed *= 0.9;

        p1.speed *= 0.96; p2.speed *= 0.96;
        p1.z += p1.speed*0.15; p2.z += p2.speed*0.15;

        car1.position.set(p1.x, 2, -p1.z);
        car2.position.set(p2.x, 2, -p2.z);
        road.position.z = -(p1.z + p2.z)/2 % 60;

        cam1.position.set(0, 25, -p1.z + 70);
        cam1.lookAt(0, 5, -p1.z - 50);
        cam2.position.set(0, 25, -p2.z + 70);
        cam2.lookAt(0, 5, -p2.z - 50);

        document.getElementById('s1').textContent = Math.round(p1.speed*4);
        document.getElementById('s2').textContent = Math.round(p2.speed*4);

        const h = innerHeight/2;
        renderer.setScissorTest(true);
        renderer.setViewport(0,h,innerWidth,h); renderer.render(scene,cam1);
        renderer.setViewport(0,0,innerWidth,h); renderer.render(scene,cam2);

        requestAnimationFrame(loop);
    })();
}