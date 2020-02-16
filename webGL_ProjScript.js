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

// This function just makes sure external data loads in correctly
var initEngine = function () {

    async function getVSShader () {
        const response = await fetch('/shaders.vs.glsl');
        return await response.text();
    };

    async function getFSShader () {
        const response = await fetch('/shaders.fs.glsl');
        return await response.text();
    };

    async function getAyaModel () {
        const response = await fetch('/Aya_model.json');
        return await response.json();
    };

    async function getFloorModel () {
        const response = await fetch('/floor.json');
        return await response.json();
    };

    async function getAyaImage () {
        const response = await fetch ('/091_W_Aya_2k_01.jpg')
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
    var matLocation = gl.getUniformLocation(program, "transformMatrix");

    // *******************
    // Get geometry data
    // *******************
    // Aya first
    var ayaVertices = inputAyaJSON.meshes[0].vertices;
    var ayaIndices = [].concat.apply([], inputAyaJSON.meshes[0].faces);
    var ayaTexCoords = inputAyaJSON.meshes[0].texturecoords[0];

    // now floor
    var floorVertices = inputFloorJSON.meshes[0].vertices;
    var floorIndices = [].concat.apply([], inputFloorJSON.meshes[0].faces);
    var floorTexCoords = inputFloorJSON.meshes[0].texturecoords[0];

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

    // AYA Texture coords
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

    // AYA Indices
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);

    // DONE WITH FLOOR VAO
    gl.bindVertexArray(null);

    /******************
     * texture stuff  *
     ******************/
    // AYA
    var ayaTexture = gl.createTexture();
    var img = document.getElementById("AyaImage");
    gl.bindTexture(gl.TEXTURE_2D, ayaTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D)
    
    // floor

    // some render settings
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    var then = 0;

    // some vars for AYA initial transforms
    var ayaTranslation = [0, -100, -750];
    var ayaRotation = [degToRad(190), degToRad(40), degToRad(180)];
    var ayaScale = [.3, .3, .3];
    
    // some vars for Floor initial Transforms
    var floorTranslation = [0, -100, -750];
    var floorRotation = [degToRad(0), degToRad(0), degToRad(0)];
    var floorScale = [100, 100, 100];

    // Universal stuff for rendering objects
    var fieldOfViewRadians = degToRad(60);
    var rotateSpeed = 1.2;
    requestAnimationFrame(drawStuff);

    function drawStuff (now)
    {
        // convert time
        now *= 0.001;

        var deltaTime = now - then;

        then = now;

        ayaRotation[1] += rotateSpeed * deltaTime;

        // Convert from clipspace to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear canvas
        gl.clearColor (0.70, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        // tell program to use shaders
        gl.useProgram(program);

        // perspective settings
        var aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;

        // Compute matrix
        var matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
        matrix = m4.translate(matrix, ayaTranslation[0], ayaTranslation[1], ayaTranslation[2]);
        matrix = m4.xRotate(matrix, ayaRotation[0]);
        matrix = m4.yRotate(matrix, ayaRotation[1]);
        matrix = m4.zRotate(matrix, ayaRotation[2]);
        matrix = m4.scale(matrix, ayaScale[0], ayaScale[1], ayaScale[2]);

        // set matrix
        gl.uniformMatrix4fv(matLocation, false, matrix);

        // draw aya
        gl.bindVertexArray(ayaVAO);
        gl.bindTexture(gl.TEXTURE_2D, ayaTexture);
        gl.activeTexture(gl.TEXTURE0);
        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, ayaIndices.length, gl.UNSIGNED_SHORT, 0);

        var matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
        matrix = m4.translate(matrix, floorTranslation[0], floorTranslation[1], floorTranslation[2]);
        matrix = m4.xRotate(matrix, floorRotation[0]);
        matrix = m4.yRotate(matrix, floorRotation[1]);
        matrix = m4.zRotate(matrix, floorRotation[2]);
        matrix = m4.scale(matrix, floorScale[0], floorScale[1], floorScale[2]);

        // set matrix
        gl.uniformMatrix4fv(matLocation, false, matrix);


        // draw floor
        gl.bindVertexArray(floorVAO);
        gl.bindTexture(gl.TEXTURE_2D, ayaTexture);
        gl.activeTexture(gl.TEXTURE0)
        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, floorIndices.length, gl.UNSIGNED_SHORT, 0);

        // call next frame
        requestAnimationFrame(drawStuff);
    }
}