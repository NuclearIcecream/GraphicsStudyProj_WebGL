#version 300 es
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