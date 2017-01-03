function createObjects(scene){
	var randomObjects = new THREE.Object3D();
	
	for (var i = 0; i < 10; i++) {
		var cube = createCube('#'+(Math.random()*0xFFFFFF<<0).toString(16)); //new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), createShaderMaterial(new THREE.Color(0x3DE5CF)));
		cube.position.set(randInt(-40,40), randInt(-30,20), randInt(-40,40));
		cube.scale.set(randInt(1,4), randInt(1,4), randInt(1,4));
		randomObjects.add(cube);
	}
	for (var i = 0; i < 10; i++) {
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32),
					new THREE.MeshPhongMaterial({ color: '#'+(Math.random()*0xFFFFFF<<0).toString(16), specular: 0x555555, shininess: 30 }));
		cube.position.set(randInt(-50,40), randInt(-10,20), randInt(-40,50));
		sphere.scale.set(randInt(1,2), randInt(1,2), randInt(1,2));
		randomObjects.add(sphere);		
	}

	randomObjects.position.set(0, 0, 0);
	scene.add(randomObjects);
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function addHangar(scene) {
	var hangar = new THREE.Object3D();
	var halfPi = Math.PI / 2;
	//var wallPos = 20;
	var wallSize = 2*wallPos;
	
	var leftWall = createWall(0x47d147, wallSize);
	leftWall.position.set(-wallPos, 0, 0);
	leftWall.rotation.set(0, halfPi, 0);
	hangar.add(leftWall);
	
	var rightWall = createWall(0xff00ff, wallSize);
	rightWall.position.set(wallPos, 0, 0);
	rightWall.rotation.set(0, -halfPi, 0);
	hangar.add(rightWall);
	
	var backWall = createWall(0x1436e1, wallSize);
	backWall.position.set(0, 0, -wallPos);
	hangar.add(backWall);

	var frontWall = createWall(0x1436e1, wallSize);
	frontWall.position.set(0, 0, wallPos);
	frontWall.rotation.set(0, halfPi*2, 0);
	hangar.add(frontWall);
	
	var ceiling = createWall(0x00ffff, wallSize);
	ceiling.position.set(0, wallPos, 0);
	ceiling.rotation.set(halfPi, 0, 0);
	hangar.add(ceiling);
	
	var floor = createWall(0xffff00, wallSize);
	floor.position.set(0, -wallPos, 0);
	floor.rotation.set(-halfPi, 0, 0);
	hangar.add(floor);
	
	scene.add(hangar);
	return hangar;
}


function addQuad(texture, x, y, z, roty) {
	var halfPi = Math.PI / 2;

	var quad = createQuad(texture);
	quad.position.set(x, y, z);
	quad.rotation.set(0, roty, 0);

	return quad;
}

function createQuad(texture) {
	var geometry = new THREE.PlaneGeometry(quadSideLength, quadSideLength, 1);
	var material = new THREE.MeshPhongMaterial({ map:texture, specular: 0x555555, shininess: 30 });
	var wall     = new THREE.Mesh(geometry, material);
	
	return wall;
}

function createWall(colorCode, wallSize) {
	var geometry = new THREE.PlaneGeometry(wallSize, wallSize, 1);
	var color    = new THREE.Color(colorCode);
	//Replaced our custom material with phong
	//TODO: replace for other things too, make our light work with it
	var material = new THREE.MeshPhongMaterial({ color: colorCode, specular: 0x555555, shininess: 30 });
	var wall     = new THREE.Mesh(geometry, material);
	wall.name 	 = "wall";
	return wall;
}

function createCube(colorCode) {
	var geometry = new THREE.BoxGeometry(2, 2, 2);
	var color    = new THREE.Color(colorCode);
	var material = new THREE.MeshPhongMaterial({ color: color, specular: 0x555555, shininess: 30 });
	var cube     = new THREE.Mesh(geometry, material);
	
	return cube;
}