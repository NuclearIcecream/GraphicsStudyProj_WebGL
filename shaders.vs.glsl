#version 300 es

precision mediump float;

// Vertice position
in vec4 vertPosition;
in vec2 vertTexCoord;
in vec3 a_Normal;

// matrix to hold transform data
uniform mat4 transformMatrix;
uniform mat4 u_World;

// varying for the color
out vec2 fragTexCoord;
out vec3 v_Normal;

void main()
{
    gl_Position = transformMatrix * vertPosition;

    // pass values to fragmentShader
    fragTexCoord = vertTexCoord;
    v_Normal = mat3(u_World) * a_Normal;
}