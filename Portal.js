function portal_view(camera, src_portal, dst_portal, kordaja) {
	//TODO Kogu see matemaatika siin paneb segast. Leida parem lahendus. 
	//Eesmärk: liigutada kaamera õigesse kohta et portaalist oleks näha õiget objekti.
	//Olemas on kaamera asukoht, protaalide asukohad. Leida nurk ja kaugus port1 ja kaamera vahel
	//Paigutada kaamera port 2 suhtes sama nurga ja kugusega.
	src_portal.updateMatrixWorld();
	dst_portal.updateMatrixWorld();
	camera.updateMatrixWorld();
	
	var camerapos = new THREE.Vector3();
	var camerarot = new THREE.Quaternion();
	var camerascale = new THREE.Vector3();
	camera.matrix.decompose(camerapos,camerarot,camerascale);
	
	var srcpos = new THREE.Vector3();
	var srcquat = new THREE.Quaternion();
	var srcscale = new THREE.Vector3();
	src_portal.matrix.decompose(srcpos, srcquat, srcscale);
	
	var destquat = new THREE.Quaternion();
	var destpos = new THREE.Vector3();
	var destscale = new THREE.Vector3();
	dst_portal.matrix.decompose(destpos,destquat,destscale);
	
	var diff = camerapos.clone().sub(srcpos);
	
	
	//IF ortation between2 portals is 180 its all ok
	//any other and we need to rotate

	var ydiff = src_portal.rotation.y - dst_portal.rotation.y - Math.PI;
	diff.applyAxisAngle(new THREE.Vector3(0,1,0),-ydiff);
	var newcampos = diff.add(destpos);
	var yrotvec = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-ydiff);
	srcquat = srcquat.multiply(destquat.inverse());
	camerarot = camerarot.multiply(yrotvec);
	
	var inverse_view_to_source = new THREE.Matrix4();
	inverse_view_to_source.compose(newcampos,camerarot,camerascale);
	
	// http://www.terathon.com/lengyel/Lengyel-Oblique.pdf Siit saada kuidagi oblique fusrum culling.
	var M3 = new THREE.Vector4(camera.projectionMatrix.elements[2], camera.projectionMatrix.elements[6],camera.projectionMatrix.elements[10],camera.projectionMatrix.elements[14]);
		
	var M4 = new THREE.Vector4(camera.projectionMatrix.elements[3], camera.projectionMatrix.elements[7],camera.projectionMatrix.elements[11],camera.projectionMatrix.elements[15]);
	
	
	return inverse_view_to_source;
}



function draw() {
	requestAnimationFrame(draw);

	var dt = clock.getDelta();

	parseControls(dt);
	
	var time = clock.getElapsedTime();
	var m = time / 4;
	lightPosition = lightTrajectory.getPoint(m - parseInt(m));
	scene.children[0].position.set(lightPosition.x, lightPosition.y, lightPosition.z);
	light.set(lightPosition.x,lightPosition.y,lightPosition.z);
	
	// telepordime kaamera x pos ja quadi piiride järgi
	if (camera.position.x > wallPos-1) {
		if (camera.position.y < port1_quad.position.y + quadSideLength/2 && camera.position.y > port1_quad.position.y - quadSideLength/2 && Math.abs(camera.position.z) < quadSideLength/2) {
			camera.position.x = -wallPos+1;
		}
		else {
			camera.position.x -= 0.25;
		}
	}
	else if (camera.position.x < -wallPos+1) {
		if (camera.position.y < port2_quad.position.y + quadSideLength/2 && camera.position.y > port2_quad.position.y - quadSideLength/2 && Math.abs(camera.position.z) < quadSideLength/2) {
			camera.position.x = wallPos-1;
		}
		else {
			camera.position.x += 0.25;
		}
	}
	// labane kontroll, mis ei lase kaameral hangaarist välja minna
	if (camera.position.z > wallPos) {
		camera.position.z -= 0.25;
	}
	else if (camera.position.z < -wallPos) {
		camera.position.z += 0.25;
	}			
	
	camera.updateMatrixWorld();
	original_mat = camera.matrixWorld.clone();
	
	var gl = renderer.context;
	
	//Puhastame kõik buffrid ära
	renderer.autoClear = false;
	renderer.clear(true,true,true);
	
	//Valmistame stencli
	gl.stencilOp(gl.KEEP,gl.KEEP,gl.REPLACE);
	gl.stencilMask(0xff);
	
	gl.colorMask(false,false,false,false);
	gl.depthMask(false);
	
	gl.enable(gl.STENCIL_TEST);
	gl.enable(gl.DEPTH_TEST);
	
	//Portaal 1 stenclisse
	gl.stencilFunc(gl.ALWAYS,1,0xff);
	renderer.render(port1_scene,camera);
	
	//Portaal 2 stenclisse
	gl.stencilFunc(gl.ALWAYS,2,0xff);
	renderer.render(port2_scene,camera);
	
	renderer.clear(false,true,false);
	
	gl.colorMask(true,true,true,true);
	gl.depthMask(true);
	camera.matrixAutoUpdate = false;
	
	//Joonistame esimese protaali vaate
	gl.stencilFunc(gl.EQUAL,1,0xff);
	
	gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
	
	camera.matrixWorld = portal_view(camera,port1_quad,port2_quad,1);
	renderer.render(scene,camera);

	//Joonistame teise portaali vaate
	gl.stencilFunc(gl.EQUAL,2,0xff);
	
	gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
	camera.matrixWorld = original_mat;
	camera.matrixWorld = portal_view(camera,port2_quad,port1_quad,-1);
	renderer.render(scene,camera);
	
	//Aitab stenclist
	gl.disable(gl.STENCIL_TEST);
	renderer.clear(false,false,true);
	
	//Paneme kaamera tagai algesse kohta
	camera.matrixWorld = original_mat.clone();
	camera.matrixAutoUpdate = true;
	
	//Tühjendame sügavuspuhvri
	renderer.clear(false,true,false);
	
	
	//Joonistame mõlemad portaalid sügavus buffrisse
	// Et neid üle ei kirjutataks
	gl.colorMask(false,false,false,false);
	gl.depthMask(true);
	renderer.render(port1_scene,camera);
	renderer.render(port2_scene,camera);
	gl.enable(gl.DEPTH_TEST);
	
	//Joonistame lõpliku stseeni
	gl.colorMask(true,true,true,true);
	renderer.render(scene,camera);
	
}

function teleportCam(portal) {

}