var modelAyaJSON;
var modelFloorJSON;

// function to create the shaders
function createShader (gl, type, source)
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success)
    {return shader;}

    console.log(shader);

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

//function to link program
function createProgram(gl, vertexShader, fragmentShader)
{
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success)
        {return program;}

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

function projection (width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
}

function objectMatrixTransform (viewProjMat, translateMat, rotationMat, scaleMat)
{
    var matrix = m4.translate(viewProjMat, translateMat[0],
        translateMat[1], translateMat[2]);
    matrix = m4.xRotate(matrix, rotationMat[0]);
    matrix = m4.yRotate(matrix, rotationMat[1]);
    matrix = m4.zRotate(matrix, rotationMat[2]);
    matrix = m4.scale(matrix, scaleMat[0],
        scaleMat[1], scaleMat[2]);
    return matrix;
}

// This function just makes sure external data loads in correctly
var initEngine = function () {

    async function getVSShader () {
        const response = await fetch ('shaders.vs.glsl');
        return await response.text ();
    };

    async function getFSShader () {
        const response = await fetch ('shaders.fs.glsl');
        return await response.text ();
    };

    async function getShadowVS () {
        const response = await fetch ('shaders.shadowVS.glsl');
        return await response.text ();
    };

    async function getShadowFS () {
        const response = await fetch ('shaders.shadowFS.glsl');
        return await response.text ();
    }

    async function getAyaModel () {
        const response = await fetch ('Aya_model.json');
        return await response.json ();
    };

    async function getFloorModel () {
        const response = await fetch ('floor.json');
        return await response.json ();
    };

    async function getAyaImage () {
        const response = await fetch ('091_W_Aya_2k_01.jpg')
        return await response.blob ();
    }

    function getData () {
        return Promise.all ([getVSShader (), getFSShader (), getShadowVS (), getShadowFS (), getAyaModel (), getFloorModel (), getAyaImage ()])
    };

    getData ().then (([vertexShaderCode, fragmentShaderCode, shadowVSCode, shadowFSCode,modelAyaData, modelFloorData, textureImageData]) => {
        runEngine(vertexShaderCode, fragmentShaderCode, shadowVSCode, shadowFSCode, modelAyaData, modelFloorData, textureImageData);
    });
};


// the actual script {was initEngine}
var runEngine = function(vertexShaderCode, fragmentShaderCode, shadowVSCode, shadowFSCode, inputAyaJSON, inputFloorJSON ,textureImageData)
{
    modelAyaJSON = inputAyaJSON;
    modelFloorJSON = inputFloorJSON;

    console.log('Script Working');
    // ++++++++++++++++++++++++++
    //  Initialize WebGL
    // ++++++++++++++++++++++++++

    var canvas = document.getElementById('WebGL_Canvas');
    canvas.width = 1200;
    canvas.height = 900;
    var gl = canvas.getContext('webgl2');

    if (!gl)
    {
        console.log("WebGL not supported, falling back to older version");
        gl = canvas.getContext('Experimental-webGL');
    }

    if (!gl)
    {
        console.log("Failed second time - WebGL not supported on this browser");
    }
    
    // not actually nessisary, just kinda like it
    gl.clearColor (0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /***************************************
     * Initializing of shaders and program *
     ***************************************/
    // init regular shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderCode);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);

    // init light shaders
    var shadowVS = createShader (gl, gl.VERTEX_SHADER, shadowVSCode);
    var shadowFS = createShader (gl, gl.FRAGMENT_SHADER, shadowFSCode);

    // init program
    var renderSceneProgram = createProgram (gl, vertexShader, fragmentShader);
    var renderLightProgram = createProgram (gl, shadowVS, shadowFS);

    // *******************
    // Get geometry data
    // *******************
    // Aya model data
    var ayaVertices = inputAyaJSON.meshes[0].vertices;
    var ayaIndices = [].concat.apply([], inputAyaJSON.meshes[0].faces);
    var ayaTexCoords = inputAyaJSON.meshes[0].texturecoords[0];
    var ayaNormals = inputAyaJSON.meshes[0].normals;

    // floor model data
    var floorVertices = inputFloorJSON.meshes[0].vertices;
    var floorIndices = [].concat.apply([], inputFloorJSON.meshes[0].faces);
    var floorTexCoords = inputFloorJSON.meshes[0].texturecoords[0];
    var floorNormals = inputFloorJSON.meshes[0].normals;

    // make VAOs
    var ayaVAO = gl.createVertexArray();    // aya vao
    var floorVAO = gl.createVertexArray();  // floor vao

    // *********************
    // Vao buffer stuff 
    // *********************
    // SETTING AYA BUFFER STUFF FIRST
    gl.bindVertexArray(ayaVAO);    // set Aya as current VAO
    
    // *********************
    // AYA Buffer data
    // *********************
    // AYA Vertices
{
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(ayaVertices), gl.STATIC_DRAW);
    var positionAttriLocation = gl.getAttribLocation(renderSceneProgram, "a_Position");
    var size = 3;                                       // 3 components per iteration (xyz)
    var type = gl.FLOAT;                                // the data is 32bit floats
    var normalize = gl.FALSE;                           // dont normalize the data
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get next position
    var offset = 0;                                     // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttriLocation);

    // AYA Texture coords
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(ayaTexCoords), gl.STATIC_DRAW);
    var texCoordAttriLocation = gl.getAttribLocation(renderSceneProgram, "a_TexCoord");
    var size = 2;                                       // size of each iteration
    var type = gl.FLOAT;                                // each color is 32bit Floats
    var normalize = gl.FALSE;                           // switch from 255 range to 0 - 1 range
    var stride = 2 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0 * Float32Array.BYTES_PER_ELEMENT;    // start at the begining of buffer
    // use above settings
    gl.vertexAttribPointer(texCoordAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(texCoordAttriLocation);

    // AYA Indices
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ayaIndices), gl.STATIC_DRAW);

    // AYA Normals
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(ayaNormals), gl.STATIC_DRAW);
    var normalAttriLocation = gl.getAttribLocation(renderSceneProgram, "a_Normal");
    var size = 3;                                       // size of each iteration
    var type = gl.FLOAT;                                // each color is 32bit Floats
    var normalize = gl.TRUE;                           // switch from 255 range to 0 - 1 range
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0 * Float32Array.BYTES_PER_ELEMENT;    // start at the begining of buffer
    gl.vertexAttribPointer (normalAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(normalAttriLocation)
}
    // DONE WITH AYA VAO
    gl.bindVertexArray(null);

    // FLOOR VAO
    gl.bindVertexArray(floorVAO);

    // *********************
    // * FLOOR buffer data *
    // *********************
    // Floor Vertices
{
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(floorVertices), gl.STATIC_DRAW);
    var positionAttriLocation = gl.getAttribLocation(renderSceneProgram, "a_Position");
    var size = 3;                                       // 3 components per iteration (xyz)
    var type = gl.FLOAT;                                // the data is 32bit floats
    var normalize = gl.FALSE;                           // dont normalize the data
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get next position
    var offset = 0;                                     // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttriLocation);

    // floor Texture coords
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(floorTexCoords), gl.STATIC_DRAW);
    var texCoordAttriLocation = gl.getAttribLocation(renderSceneProgram, "a_TexCoord");
    var size = 2;                                       // size of each iteration
    var type = gl.FLOAT;                                // each color is 32bit Floats
    var normalize = gl.FALSE;                           // switch from 255 range to 0 - 1 range
    var stride = 2 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0 * Float32Array.BYTES_PER_ELEMENT;    // start at the begining of buffer
    // use above settings
    gl.vertexAttribPointer(texCoordAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(texCoordAttriLocation);

    // floor Indices
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);

    // floor Normals
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(floorNormals), gl.STATIC_DRAW);
    var normalAttriLocation = gl.getAttribLocation(renderSceneProgram, "a_Normal");
    var size = 3;                                       // size of each iteration
    var type = gl.FLOAT;                                // each color is 32bit Floats
    var normalize = gl.TRUE;                            // switch from 255 range to 0 - 1 range
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0 * Float32Array.BYTES_PER_ELEMENT;    // start at the begining of buffer
    gl.vertexAttribPointer (normalAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(normalAttriLocation)
}
    // DONE WITH FLOOR VAO

    gl.bindVertexArray(null);

    /***************
     * LIGHT STUFF *
     ***************/
    gl.useProgram(renderSceneProgram);

    var ambientUniformLocation = gl.getUniformLocation (renderSceneProgram, 'ambientLightIntensity');
    var directionUniformLocation = gl.getUniformLocation (renderSceneProgram, 'lightSourceDirection');
    var intensityUniformLocation = gl.getUniformLocation (renderSceneProgram, 'lightSourceIntensity');

    gl.uniform3f (ambientUniformLocation, 0.9, 0.9, 0.7);
    gl.uniform3f (intensityUniformLocation, 0.9, 0.9, 0.9);

    /******************
     * texture stuff  *
     ******************/
    // texture look up test
    var textureDiffLoc = gl.getUniformLocation (renderSceneProgram, "diffuseSampler");
    gl.uniform1i (textureDiffLoc, 0); // bind to 0

    var textureDepthLoc = gl.getUniformLocation (renderSceneProgram, "shadowMap");
    gl.uniform1i (textureDepthLoc, 1); // bind to 1

    // AYA
    var whiteTexture = gl.createTexture ();
    var img = document.getElementById ("AyaImage");
    gl.activeTexture (gl.TEXTURE0);
    gl.bindTexture (gl.TEXTURE_2D, whiteTexture);
    gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap (gl.TEXTURE_2D)
    
    // some render settings
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    /********************
     * SHADOW MAP STUFF *
     ********************/
    const depthTexture = gl.createTexture ();
    const depthTextureSize = 1024;
    gl.activeTexture (gl.TEXTURE1);
    gl.bindTexture (gl.TEXTURE_2D, depthTexture);
    gl.texImage2D (gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, depthTextureSize,
                    depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const depthFramebuffer = gl.createFramebuffer ();
    gl.bindFramebuffer (gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                            gl.TEXTURE_2D, depthTexture, 0);

    // unbind the framebuffer
    gl.bindFramebuffer (gl.FRAMEBUFFER, null);

    /*************************
     *  END OF FUNNY SET-UPS *
     *************************/

    // some vars for AYA initial transforms
    const ayaUniforms = {
        texture: whiteTexture,
        translation: [0, 0, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [.15, .15, .15]
    };
    
    // some vars for Floor initial Transforms
    const floorUniforms = {
        texture: whiteTexture,
        //texture: depthTexture,
        translation: [0, 0, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [80, 10, 80]
    }

    // projection location - regular shaders
    var projectionLoc = gl.getUniformLocation (renderSceneProgram, "u_Projection");
    // view location - regular shaders
    var viewLoc = gl.getUniformLocation (renderSceneProgram, "u_View");
    // world location - regular shaders
    var worldLoc = gl.getUniformLocation (renderSceneProgram, "u_World");
    // light proj - regular shader
    var lightProjRegLoc = gl.getUniformLocation (renderSceneProgram, "u_LightProjection");
    // light view - regular shader
    var lightViewRegLoc = gl.getUniformLocation (renderSceneProgram, "u_LightView");

    // lightProjection location - shadow shaders
    var lightProjLocation = gl.getUniformLocation (renderLightProgram, "u_LightProjection");
    // lightView Location - shadow shaders
    var lightViewLocation = gl.getUniformLocation (renderLightProgram, "u_LightView");
    // worldLocation - shadow Shaders
    var lightWorldLocation = gl.getUniformLocation (renderLightProgram, "u_World");
    // fragment shader uniform
    var viewPosition = gl.getUniformLocation (renderSceneProgram, "viewPosition");


    const matrixLocations = {
        projection:  projectionLoc,
        view: viewLoc,
        regWorld: worldLoc,
        lightProj: lightProjLocation,
        lightView: lightViewLocation,
        lightWorld: lightWorldLocation
    };

    // vars used in render
    var ayaTransforms = new Float32Array (16);
    var floorTransforms = new Float32Array (16);

    var worldMatrix = new Float32Array (16);
    var viewMatrix = new Float32Array (16);
    var projMatrix = new Float32Array (16);

    //var lightWorldMatrix = new Float32Array (16);
    var lightViewMatrix = new Float32Array (16);
    var lightProjMatrix = new Float32Array (16);

    // create camera mat & settings
    var cameraPos = [0, 200, 600];
    var target = [0, 10, 50];
    var up = [0, 1, 0];
    
    // light settings
    var lightPos = [230.0, 250.0, 10.0];
    var lightTarget = [0.0, 50.0, 0.0];

    //cameraPos = lightPos;    
    //target = lightTarget;

    gl.uniform3f (directionUniformLocation, lightPos[0], lightPos[1], lightPos[2]);
    gl.uniform3f (viewPosition, cameraPos[0], cameraPos[1], cameraPos[2]);

    // Universal scene rules
    var aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
    var FOVRadians = degToRad(60);

    function drawLightShadow (lightProj, lightView, worldMatrix, programInfo)
    {
        // set program
        gl.useProgram (programInfo);

        // other
        lightView = m4.inverse (lightView);
       

        // set uniforms
        gl.uniformMatrix4fv (matrixLocations.lightProj, false, lightProj);
        gl.uniformMatrix4fv (matrixLocations.lightView, false, lightView);

        // Render Aya
        // use aya VAO information
        gl.bindVertexArray(ayaVAO);
        ayaTransforms = objectMatrixTransform (worldMatrix, ayaUniforms.translation, ayaUniforms.rotation, ayaUniforms.scale);
        gl.uniformMatrix4fv (matrixLocations.lightWorld, false, ayaTransforms);
          
        // do Aya Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, ayaUniforms.texture);
        

        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, ayaIndices.length, gl.UNSIGNED_SHORT, 0);
        // END OF AYA

        // Render Floor
        // use floor VAO information
        gl.bindVertexArray(floorVAO);
        floorTransforms = objectMatrixTransform (worldMatrix, floorUniforms.translation, floorUniforms.rotation, floorUniforms.scale);
        gl.uniformMatrix4fv(matrixLocations.lightWorld, false, floorTransforms);

        // do floor texture
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, floorUniforms.texture);

        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, floorIndices.length, gl.UNSIGNED_SHORT, 0);
        // END OF FLOOR
    }

    function drawCameraScene (projMatrix, worldMatrix, viewMatrix, lightProj, lightView ,programInfo)
    {
        // tell program to use shaders
        gl.useProgram(programInfo);

        viewMatrix = m4.inverse(viewMatrix);

        // set uniform locations
        gl.uniformMatrix4fv (matrixLocations.projection, false, projMatrix);
        gl.uniformMatrix4fv (matrixLocations.view, false, viewMatrix);
        gl.uniformMatrix4fv (lightProjRegLoc, false, lightProj);
        gl.uniformMatrix4fv (lightViewRegLoc, false, lightView);

        // Render Aya
        // use aya VAO information
        gl.bindVertexArray(ayaVAO);
        ayaTransforms = objectMatrixTransform (worldMatrix, ayaUniforms.translation, ayaUniforms.rotation, ayaUniforms.scale);
        gl.uniformMatrix4fv (matrixLocations.regWorld, false, ayaTransforms);
          
        // do Aya Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture (gl.TEXTURE_2D, ayaUniforms.texture);
        
        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, ayaIndices.length, gl.UNSIGNED_SHORT, 0);
        // END OF AYA

        // Render Floor
        // use floor VAO information
        gl.bindVertexArray(floorVAO);
        floorTransforms = objectMatrixTransform (worldMatrix, floorUniforms.translation, floorUniforms.rotation, floorUniforms.scale);
        gl.uniformMatrix4fv(matrixLocations.regWorld, false, floorTransforms);

        // do floor texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture (gl.TEXTURE_2D, floorUniforms.texture);
        
        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, floorIndices.length, gl.UNSIGNED_SHORT, 0);
        // END OF FLOOR
    }

    function renderScene (time) {
        // rotate the scene
        {
            time = time * 0.0005;
            ayaUniforms.rotation[1] = time;
            floorUniforms.rotation[1] = time;
        }

        /*********************
         * Render Shadow Map *
         *********************/

        // light world prolly not necissary
        //lightWorldMatrix = ;
        lightViewMatrix = m4.lookAt (lightPos, lightTarget, up);
        lightProjMatrix = m4.orthographic (-10, 10, -10, 10, 0.5, 1000);

        // for testing
        worldMatrix = m4.identity ();

        gl.bindFramebuffer (gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        drawLightShadow (lightProjMatrix, lightViewMatrix, worldMatrix, renderLightProgram);        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /**********************
         * Render Camera View *
         **********************/
        // Convert from clipspace to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        worldMatrix = m4.identity ();
        viewMatrix = m4.lookAt (cameraPos, target, up);
        projMatrix = m4.perspective (FOVRadians, aspect, 1, 2000);   
        
        // send the shadow shader
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture (gl.TEXTURE_2D, depthTexture);

        drawCameraScene (projMatrix, worldMatrix, viewMatrix, lightProjMatrix, lightViewMatrix, renderSceneProgram);

         // call next frame
         requestAnimationFrame(renderScene);
    }

    requestAnimationFrame(renderScene);

}