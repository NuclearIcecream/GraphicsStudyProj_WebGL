// 
// The Shaders
//

var vertexShaderCode = 
`#version 300 es
    precision mediump float;

    in vec2 vertPosition;

    void main() {
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
`;

var fragmentShaderCode = 
`#version 300 es

    precision mediump float;

    out vec4 outColor;

    void main() {
        outColor = vec4(1, 0, 0.5, 1);
    }
`;

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

    gl.clearColor (0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // init shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderCode);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);

    // init program
    var program = createProgram(gl, vertexShader, fragmentShader);

    var positionAttriLocation = gl.getAttribLocation(program, "vertPosition");
    
    // 3 2D points
    var positions = new Float32Array([
        -0.3, 0,
        0, 0.5,
        0.3, 0,
    ]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

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
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // clear canvas
    gl.clearColor (0.75, 0.85, 0.8, 1.0);
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
}
