var modelJSON;

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

//
function getColorData()
{
    var vertColors = new Float32Array([
        // left column front
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,

        // top rung front
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,

        // middle rung front
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,
        0.78, 0.27, 0.47,

        // left column back
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,

        // top rung back
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,

        // middle rung back
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,
        .31, .27, .78,

        // top
        .27, .78, .82,
        .27, .78, .82,
        .27, .78, .82,
        .27, .78, .82,
        .27, .78, .82,
        .27, .78, .82,

        // top rung right
        .78, .78, .27,
        .78, .78, .27,
        .78, .78, .27,
        .78, .78, .27,
        .78, .78, .27,
        .78, .78, .27,

        // under top rung
        .82, .39, .27,
        .82, .39, .27,
        .82, .39, .27,
        .82, .39, .27,
        .82, .39, .27,
        .82, .39, .27,

        // between top rung and middle
        .82, .62, .27,
        .82, .62, .27,
        .82, .62, .27,
        .82, .62, .27,
        .82, .62, .27,
        .82, .62, .27,

        // top of middle rung
        0.27, 0.70, 0.82,
        0.27, 0.70, 0.82,
        0.27, 0.70, 0.82,
        0.27, 0.70, 0.82,
        0.27, 0.70, 0.82,
        0.27, 0.70, 0.82,

        // right of middle rung
        0.39, 0.27, 0.82,
        0.39, 0.27, 0.82,
        0.39, 0.27, 0.82,
        0.39, 0.27, 0.82,
        0.39, 0.27, 0.82,
        0.39, 0.27, 0.82,

        // bottom of middle rung.
        0.29, 0.82, 0.39,
        0.29, 0.82, 0.39,
        0.29, 0.82, 0.39,
        0.29, 0.82, 0.39,
        0.29, 0.82, 0.39,
        0.29, 0.82, 0.39,

        // right of bottom
        0.54, 0.82, 0.31,
        0.54, 0.82, 0.31,
        0.54, 0.82, 0.31,
        0.54, 0.82, 0.31,
        0.54, 0.82, 0.31,
        0.54, 0.82, 0.31,

        // bottom
        0.35, 0.50, 0.43,
        0.35, 0.50, 0.43,
        0.35, 0.50, 0.43,
        0.35, 0.50, 0.43,
        0.35, 0.50, 0.43,
        0.35, 0.50, 0.43,

        // left side
        0.62, 0.62, 0.86,
        0.62, 0.62, 0.86,
        0.62, 0.62, 0.86,
        0.62, 0.62, 0.86,
        0.62, 0.62, 0.86,
        0.62, 0.62, 0.86  
    ]);

    return vertColors;
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

    async function getModel () {
        const response = await fetch('/Aya_model.json');
        return await response.json();
    };

    async function getImage () {
        const response = await fetch ('/091_W_Aya_2k_01.jpg')
        return await response.blob();
    }

    function getData () {
        return Promise.all ([getVSShader(), getFSShader(), getModel(), getImage()])
    };

    getData ().then (([vertexShaderCode, fragmentShaderCode, modelData, textureImageData]) => {
        runEngine(vertexShaderCode, fragmentShaderCode, modelData, textureImageData);
    });
};


// the actual script {was initEngine}
var runEngine = function(vertexShaderCode, fragmentShaderCode, inputModelJSON, textureImageData)
{

    modelJSON = inputModelJSON;

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

    // set geometry data
    var ayaVertices = inputModelJSON.meshes[0].vertices;

    var ayaIndices = [].concat.apply([], inputModelJSON.meshes[0].faces);

    var ayaTexCoords = inputModelJSON.meshes[0].texturecoords[0];

    // Buffer set up
    var vertBufferObj = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferObj);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ayaVertices), gl.STATIC_DRAW);

    var texCoordsBufferObj = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBufferObj);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ayaTexCoords), gl.STATIC_DRAW);

    var indexBufferObj = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObj);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ayaIndices), gl.STATIC_DRAW);

    // Buffer attribs
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferObj);
    var positionAttriLocation = gl.getAttribLocation(program, "vertPosition");   
    // define how attribute reads data from the buffer
    var size = 3;           // 3 components per iteration (xyz)
    var type = gl.FLOAT;    // the data is 32bit floats
    var normalize = gl.FALSE;  // dont normalize the data
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;         // 0 = move forward size * sizeof(type) each iteration to get next position
    var offset = 0;         // start at the beginning of the buffer
    // use above settings
    gl.vertexAttribPointer(positionAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttriLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBufferObj);
    var texCoordAttriLocation = gl.getAttribLocation(program, "vertTexCoord");
    // define how texture attribute stuff is read
    var size = 2;                                       // size of each iteration
    var type = gl.FLOAT;                                // each color is 32bit Floats
    var normalize = gl.FALSE;                           // switch from 255 range to 0 - 1 range
    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;    // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0 * Float32Array.BYTES_PER_ELEMENT;    // start at the begining of buffer
    // use above settings
    gl.vertexAttribPointer(texCoordAttriLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(texCoordAttriLocation);

    
    /*
     * texture stuff
     */
    var ayaTexture = gl.createTexture();
    var img = document.getElementById("AyaImage");
    gl.bindTexture(gl.TEXTURE_2D, ayaTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D)

    // some render settings
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    var then = 0;

    // some vars for initial transforms
    var translation = [0, -100, -750];
    var rotation = [degToRad(190), degToRad(40), degToRad(180)];
    var scale = [.3, .3, .3];
    var fieldOfViewRadians = degToRad(60);
    var rotateSpeed = 1.2;

    requestAnimationFrame(drawStuff);

    function drawStuff (now)
    {
        // convert time
        now *= 0.001;

        var deltaTime = now - then;

        then = now;

        rotation[1] += rotateSpeed * deltaTime;

        // Convert from clipspace to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        //console.log ("Width: " + gl.canvas.width + ", Height: " + gl.canvas.height);

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
        matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
        matrix = m4.xRotate(matrix, rotation[0]);
        matrix = m4.yRotate(matrix, rotation[1]);
        matrix = m4.zRotate(matrix, rotation[2]);
        matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

        // set matrix
        gl.uniformMatrix4fv(matLocation, false, matrix);

        gl.bindTexture(gl.TEXTURE_2D, ayaTexture);
        gl.activeTexture(gl.TEXTURE0);

        // execute GLSL program
        gl.drawElements(gl.TRIANGLES, ayaIndices.length, gl.UNSIGNED_SHORT, 0);

        // call next frame
        requestAnimationFrame(drawStuff);
    }
}