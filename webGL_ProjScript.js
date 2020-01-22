// 
// The Shaders
//

var vertexShader =
[ 
    '#version 300 es',
    '',
    'precision mediump float;',
    '',
    'attribute vec4 positionMat;',
    '',
    'void main()',
    '{',
    '   gl_Position = positionMat;',
    '}'
].join('\n')

var fragmentShader =
[
    '#version 300 es',
    '',
    'precision mediump float;',
    '',
    'out vec4 outColor;',
    'void main()',
    '{',
    'outColor = vec4(1, 0, 0.5, 1);',
    '}'
].join('\n')

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

// the actual script
var initEngine = function()
{
    console.log('Script Working');
    // ++++++++++++++++++++++++++
    // Step1 - Initialize WebGL
    // ++++++++++++++++++++++++++
    var canvas = document.getElementById('WebGL_Canvas');
    // canvas.width = 1200;
    //canvas.height = 900;
    var gl = canvas.getContext('webgl');

    //if (!webGL)
    //{
    //    console.log("WebGL not supported, falling back to older version");
    //    webGL = canvas.getContext('Experimental-webGL');
    //}

    //if (!webGL)
    //{
    //    console.log("Failed second time - WebGL not supported on this browser");
    //}

    //webGL.clearColor (0.75, 0.85, 0.8, 1.0);
    //webGL.clear(webGL.COLOR_BUFFER_BIT | webGL.DEPTH_BUFFER_BIT);

    // init shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    // init program
    var program = createProgram(gl, vertexShader, fragmentShader);

    var positionAttriLocation = gl.getAttributeLocation(program, "positionMat");

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // 3 2D points
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var vertArrayObj = gl.createVertexArray();

    gl.bindVertexArray(vertArrayObj);

    gl.enableVertexAttribArray(positionAttriLocation);

    var size = 2;           // 2 components per iteration
    var type = gl.FLOAT;    // the data is 32bit floats
    var normalize = false;  // dont normalize the data
    var stride = 0;         // 0 = move forward size * sizeof(type) each iteration to get next position
    var offset = 0;         // start at the beginning of the buffer

    gl.vertexAttribPointer(positionAttriLocation, size, type, normalize, stride, offset);

    // Canvas settings
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // clear canvas
    webGL.clearColor (0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // tell program to use shaders
    gl.useProgram(program);

    // bind attri/buffer set
    gl.bindVertexArray(vertArrayObj);

    // execute GLSL program
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);

    // Step2 - Update World Model

    // Step3 - Set Attributes

    // Step4 - The settings (set buffers, uniforms, textures, program)

    // Step5 - Issue Draw Call

    // Step6 - Present Frame

}