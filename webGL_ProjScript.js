/*
var vertexShaderCode = `#version 300 es
// Vertice position
in vec4 vertPosition;
in vec4 a_color;

// matrix to hold transform data
uniform mat4 transformMatrix;

// varying for the color
out vec4 v_color;

void main()
{
    gl_Position = transformMatrix * vertPosition;

    // pass color to frag shader
    v_color = a_color;
}
`

var fragmentShaderCode = `#version 300 es

precision mediump float;

in vec4 v_color;

out vec4 outColor;

void main() 
{
    outColor = v_color;
}
`
*/

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

function getGraphicsData ()
{
    // an F
    // Each has to be two vertices
    var graphicsMatrix = new Float32Array([
           // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0,
      ])

    return graphicsMatrix;
}

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

var initEngine = function () {

    var vertexShaderCode = fetch('shaders.vs.glsl', {mode: 'no-cors'})
        .then(response => response.text())
        .then(data => console.log(data))
        .then(error => console.error(error));

    var fragmentShaderCode = fetch('shaders.fs.glsl', {mode: 'no-cors'})
        .then(response => response.text())
        .then(data => console.log(data))
        .then(error => console.error(error));

    var modelJSON = fetch('/Aya_model.json', {mode: 'no-cors'})
        .then(response => response.json())
        .then(data=> console.log(data))
        .catch(error => console.error(error));

    

    runEngine(vertexShaderCode, fragmentShaderCode);
};


// the actual script
var runEngine = function(vertexShaderCode, fragmentShaderCode)
{
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
    // lookup mesh attributes
    var positionAttriLocation = gl.getAttribLocation(program, "vertPosition");
    var colorLocation = gl.getAttribLocation(program, "a_color")

    // Lookup uniforms
    var matLocation = gl.getUniformLocation(program, "transformMatrix");

    // create and bind geo buffer stuff
    var posBuffer = gl.createBuffer();
    var vertArrayObj = gl.createVertexArray();
    gl.bindVertexArray(vertArrayObj);

    //gl.bindVertexArray(vertArrayObj);
    gl.enableVertexAttribArray(positionAttriLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    // set geo
    var graphicsData = getGraphicsData();
    gl.bufferData (gl.ARRAY_BUFFER, graphicsData, gl.STATIC_DRAW);

    // define how attribute reads data from the buffer
    var size = 3;           // 3 components per iteration (xyz)
    var type = gl.FLOAT;    // the data is 32bit floats
    var normalize = false;  // dont normalize the data
    var stride = 0;         // 0 = move forward size * sizeof(type) each iteration to get next position
    var offset = 0;         // start at the beginning of the buffer

    gl.vertexAttribPointer(positionAttriLocation, size, type, normalize, stride, offset);

    // COLOR STUFF
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    var colorData = getColorData();
    gl.bufferData (gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

    // turn on color attribute
    gl.enableVertexAttribArray(colorLocation);

    // define how color attribute stuff if read
    var size = 3;                   // size of each iteration
    var type = gl.FLOAT;            // each color is 32bit Floats
    var normalize = false;          // switch from 255 range to 0 - 1 range
    var stride = 0;                 // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0;                 // start at the begining of buffer

    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

    // some vars for initial transforms
    var translation = [0, 50, -360];
    var rotation = [degToRad(190), degToRad(40), degToRad(0)];
    var scale = [1, 1, 1];
    var fieldOfViewRadians = degToRad(60);
    var rotateSpeed = 1.2;
    
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var then = 0;

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
        console.log ("Width: " + gl.canvas.width + ", Height: " + gl.canvas.height);

        // clear canvas
        gl.clearColor (0.70, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        // tell program to use shaders
        gl.useProgram(program);

        // bind attri/buffer set
        gl.bindVertexArray(vertArrayObj);

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

        // execute GLSL program
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 16*6;
        gl.drawArrays(primitiveType, offset, count);

        // call next frame
        requestAnimationFrame(drawStuff);
    }
}