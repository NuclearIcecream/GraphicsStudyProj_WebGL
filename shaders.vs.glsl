#version 300 es

precision mediump float;

// Vertice position
layout (location = 0) in vec3 a_Position;
layout (location = 1) in vec2 a_TexCoord;
layout (location = 2) in vec3 a_Normal;

// matrix to hold transform data
//uniform mat4 transformMatrix;
uniform mat4 u_World;
uniform mat4 u_View;
uniform mat4 u_Projection;

// varying for the color
out vec3 fragPosition;
out vec2 fragTexCoord;
out vec3 v_Normal;

void main()
{
    gl_Position = u_Projection * u_View * u_World * vec4(a_Position, 1.0);

    // pass values to fragmentShader
    fragPosition = vec3 (u_World * vec4(a_Position, 1.0));
    v_Normal = transpose (inverse (mat3 (u_World))) * a_Normal;
    fragTexCoord = a_TexCoord;
}