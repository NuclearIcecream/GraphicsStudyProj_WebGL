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

function getMatrixLocations (programInfo, gl)
{
    var matArray = new Array(3);
    // projection location
    matArray[0] = gl.getUniformLocation (programInfo, "u_Projection");
    // view location
    matArray[1] = gl.getUniformLocation (programInfo, "u_View");
    // world location
    matArray[2] = gl.getUniformLocation (programInfo, "u_World");
    
    return matArray;
}

// This function just makes sure external data loads in correctly
var initEngine = function () {

    async function getVSShader () {
        const response = await fetch('shaders.vs.glsl');
        return await response.text();
    };

    async function getFSShader () {
        const response = await fetch('shaders.fs.glsl');
        return await response.text();
    };

    async function getAyaModel () {
        const response = await fetch('Aya_model.json');
        return await response.json();
    };

    async function getFloorModel () {
        const response = await fetch('floor.json');
        return await response.json();
    };

    async function getAyaImage () {
        const response = await fetch ('091_W_Aya_2k_01.jpg')
        return await response.blob();
    }

    function getData () {
        return Promise.all ([getVSShader(), getFSShader(), getAyaModel(), getFloorModel (), getAyaImage()])
    };

    getData ().then (([vertexShaderCode, fragmentShaderCode, modelAyaData, modelFloorData, textureImageData]) => {
        runEngine(vertexShaderCode, fragmentShaderCode, modelAyaData, modelFloorData, textureImageData);
    });
};


// the actual script {was initEngine}
var runEngine = function(vertexShaderCode, fragmentShaderCode, inputAyaJSON, inputFloorJSON ,textureImageData)
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
    // init shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderCode);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);

    // init program
    var program = createProgram(gl, vertexShader, fragmentShader);

    /*********************************
     * setting attributes and things *
     *********************************/
    
    // Lookup matrix uniform
    //var worldMatLocation = gl.getUniformLocation (program, "u_World");
    //var viewMatLocation = gl.getUniformLocation (program, "u_View");
    //var projMatLocation = gl.getUniformLocation (program, "u_Projection");

    // *******************
    // Get geometry data
    // *******************
    // Aya first
    var ayaVertices = inputAyaJSON.meshes[0].vertices;
    var ayaIndices = [].concat.apply([], inputAyaJSON.meshes[0].faces);
    var ayaTexCoords = inputAyaJSON.meshes[0].texturecoords[0];
    var ayaNormals = inputAyaJSON.meshes[0].normals;

    // now floor
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
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(ayaVertices), gl.STATIC_DRAW);
    var positionAttriLocation = gl.getAttribLocation(program, "vertPosition");
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
    var texCoordAttriLocation = gl.getAttribLocation(program, "vertTexCoord");
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
    var normalAttriLocation = gl.getAttribLocation(program, "a_Normal");
    var size = 3;                                       // size of each iteration
    var type = gl.FLOAT;                                // each color is 32bit Floats
    var normalize = gl.TRUE;                           // switch from 255 range to 0 - 1 range
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0 * Float32Array.BYTES_PER_ELEMENT;    // start at the begining of buffer
    gl.vertexAttribPointer (normalAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(normalAttriLocation)

    // DONE WITH AYA VAO
    gl.bindVertexArray(null);

    // FLOOR VAO
    gl.bindVertexArray(floorVAO);

    // *********************
    // * FLOOR buffer data *
    // *********************
    // Floor Vertices
    gl.bindBuffer (gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(floorVertices), gl.STATIC_DRAW);
    var positionAttriLocation = gl.getAttribLocation(program, "vertPosition");
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
    var texCoordAttriLocation = gl.getAttribLocation(program, "vertTexCoord");
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
    var normalAttriLocation = gl.getAttribLocation(program, "a_Normal");
    var size = 3;                                       // size of each iteration
    var type = gl.FLOAT;                                // each color is 32bit Floats
    var normalize = gl.TRUE;                            // switch from 255 range to 0 - 1 range
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0 * Float32Array.BYTES_PER_ELEMENT;    // start at the begining of buffer
    gl.vertexAttribPointer (normalAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(normalAttriLocation)

    // DONE WITH FLOOR VAO
    gl.bindVertexArray(null);

    /***************
     * LIGHT STUFF *
     ***************/
    gl.useProgram(program);

    var ambientUniformLocation = gl.getUniformLocation (program, 'ambientLightIntensity');
    var directionUniformLocation = gl.getUniformLocation (program, 'lightSourceDirection');
    var intensityUniformLocation = gl.getUniformLocation (program, 'lightSourceIntensity');

    gl.uniform3f (ambientUniformLocation, 0.1, 0.1, 0.2);
    gl.uniform3f (directionUniformLocation, 20.0, 10.0, 0.0);
    gl.uniform3f (intensityUniformLocation, 0.9, 0.9, 0.9);

    /******************
     * texture stuff  *
     ******************/
    // AYA
    var whiteTexture = gl.createTexture();
    var img = document.getElementById("AyaImage");
    gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D)
    
    // some render settings
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    // some vars for AYA initial transforms
    const ayaUniforms = {
        texture: whiteTexture,
        translation: [0, -50, -300],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [.15, .15, .15]
    };
    
    // some vars for Floor initial Transforms
    const floorUniforms = {
        texture: whiteTexture,
        translation: [0, -150, -750],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [100, 100, 100]
    }

    // vars used in render
    var ayaTransforms = new Float32Array (16);
    var floorTransforms = new Float32Array (16);

    var worldMatrix = new Float32Array (16);
    var viewMatrix = new Float32Array (16);
    var projMatrix = new Float32Array (16);

    function drawScene (projMatrix, worldMatrix, viewMatrix, programInfo)
    {
        // tell program to use shaders
        gl.useProgram(program);

        viewMatrix = m4.inverse(viewMatrix);

        // get uniform locations
        var matrixLocations = getMatrixLocations (programInfo, gl);

        // set uniform locations
        gl.uniformMatrix4fv (matrixLocations[0], false, projMatrix);
        gl.uniformMatrix4fv (matrixLocations[1], false, viewMatrix);

        // Render Aya
        // use aya VAO information
        gl.bindVertexArray(ayaVAO);
        ayaTransforms = objectMatrixTransform (worldMatrix, ayaUniforms.translation, ayaUniforms.rotation, ayaUniforms.scale);
        gl.uniformMatrix4fv (matrixLocations[2], false, ayaTransforms);
          
        // do Aya Texture
        gl.bindTexture(gl.TEXTURE_2D, ayaUniforms.texture);
        gl.activeTexture(gl.TEXTURE0);

        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, ayaIndices.length, gl.UNSIGNED_SHORT, 0);
        // END OF AYA

        // Render Floor
        // use floor VAO information
        gl.bindVertexArray(floorVAO);
        floorTransforms = objectMatrixTransform (worldMatrix, floorUniforms.translation, floorUniforms.rotation, floorUniforms.scale);
        gl.uniformMatrix4fv(matrixLocations[2], false, floorTransforms);

        // do floor texture
        gl.bindTexture(gl.TEXTURE_2D, floorUniforms.texture);
        gl.activeTexture(gl.TEXTURE0)

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

        // Convert from clipspace to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear canvas
        gl.clearColor (0.70, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        // create camera mat & settings
        var cameraPos = [0, 100, 300];
        var target = [0, 10, 50];
        var up = [0, 1, 0];
        
        // Universal scene rules
        var aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
        var FOVRadians = degToRad(60);

        worldMatrix = m4.identity ();
        viewMatrix = m4.lookAt (cameraPos, target, up);
        projMatrix = m4.perspective (FOVRadians, aspect, 1, 2000);    

        drawScene (projMatrix, worldMatrix, viewMatrix, program);

         // call next frame
         requestAnimationFrame(renderScene);
    }

    requestAnimationFrame(renderScene);

}