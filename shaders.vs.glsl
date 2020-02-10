#version 300 es

precision mediump float;

// Vertice position
in vec4 vertPosition;
in vec2 vertTexCoord;

// matrix to hold transform data
uniform mat4 transformMatrix;

// varying for the color
out vec2 fragTexCoord;

void main()
{
    gl_Position = transformMatrix * vertPosition;

    // pass color to frag shader
    fragTexCoord = vertTexCoord;
}