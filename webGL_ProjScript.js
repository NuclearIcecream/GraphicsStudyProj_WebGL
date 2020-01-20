var initEngine = function()
{
    console.log('Script Working');
    // ++++++++++++++++++++++++++
    // Step1 - Initialize WebGL
    // ++++++++++++++++++++++++++
    var canvas = document.getElementById('WebGL_Canvas');
    var webGL = canvas.getContext('WebGL');

    if (!webGL)
    {
        console.log("WebGL not supported, falling back to other version");
        webGL = canvas.getContext('Experimental-webGL');
    }

    if (!wbeGL)
    {
        console.log("Failed second time - WebGL not supported on this browser");
    }

    gl.clearColor (0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Step2 - Update World Model

    // Step3 - Set Attributes

    // Step4 - The settings (set buffers, uniforms, textures, program)

    // Step5 - Issue Draw Call

    // Step6 - Present Frame

}